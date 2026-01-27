import { useState, useEffect, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, ChevronLeft, ChevronRight, Clock, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, subWeeks, addMonths, subMonths, eachDayOfInterval, isSameDay, Locale } from "date-fns";
import { it, enUS, es, fr, de } from "date-fns/locale";

const dateLocales: Record<string, Locale> = { it, en: enUS, es, fr, de };
import { cn } from "@/lib/utils";
import { EditEntryDialog } from "@/components/timesheet/EditEntryDialog";
import { DeleteEntryDialog } from "@/components/timesheet/DeleteEntryDialog";
import { ExportMenu } from "@/components/timesheet/ExportMenu";

interface Client {
  id: string;
  name: string;
  color: string;
}

interface TimeEntry {
  id: string;
  client_id: string | null;
  description: string | null;
  duration_seconds: number | null;
  start_time: string;
  end_time: string | null;
  date: string;
  entry_type: string;
}

type ViewMode = "week" | "month";

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatTimeOfDay(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Timesheet() {
  const { user, profile } = useAuth();
  const { language, t } = useLanguage();
  const locale = dateLocales[language] || enUS;

  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [clients, setClients] = useState<Client[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<string>("all");
  
  // Edit/Delete state
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<TimeEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dateRange = useMemo(() => {
    if (viewMode === "week") {
      return {
        start: startOfWeek(currentDate, { weekStartsOn: 1 }),
        end: endOfWeek(currentDate, { weekStartsOn: 1 }),
      };
    }
    return {
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    };
  }, [viewMode, currentDate]);

  const days = useMemo(() => {
    return eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
  }, [dateRange]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const startStr = format(dateRange.start, "yyyy-MM-dd");
      const endStr = format(dateRange.end, "yyyy-MM-dd");

      const [clientsRes, entriesRes] = await Promise.all([
        supabase
          .from("clients")
          .select("id, name, color")
          .eq("user_id", user.id)
          .order("name"),
        supabase
          .from("time_entries")
          .select("*")
          .eq("user_id", user.id)
          .gte("date", startStr)
          .lte("date", endStr)
          .order("date", { ascending: true })
          .order("start_time", { ascending: true }),
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (entriesRes.error) throw entriesRes.error;

      setClients(clientsRes.data || []);
      setEntries(entriesRes.data || []);
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredEntries = useMemo(() => {
    if (selectedClient === "all") return entries;
    return entries.filter((e) => e.client_id === selectedClient);
  }, [entries, selectedClient]);

  const entriesByDay = useMemo(() => {
    const map = new Map<string, TimeEntry[]>();
    days.forEach((day) => {
      const dateKey = format(day, "yyyy-MM-dd");
      map.set(dateKey, []);
    });
    filteredEntries.forEach((entry) => {
      const existing = map.get(entry.date) || [];
      existing.push(entry);
      map.set(entry.date, existing);
    });
    return map;
  }, [filteredEntries, days]);

  const totalByDay = useMemo(() => {
    const map = new Map<string, number>();
    entriesByDay.forEach((dayEntries, dateKey) => {
      const total = dayEntries.reduce((acc, e) => acc + (e.duration_seconds || 0), 0);
      map.set(dateKey, total);
    });
    return map;
  }, [entriesByDay]);

  const totalSeconds = useMemo(() => {
    return filteredEntries.reduce((acc, e) => acc + (e.duration_seconds || 0), 0);
  }, [filteredEntries]);

  const getClientById = (id: string | null) =>
    clients.find((c) => c.id === id) || null;

  const navigatePrevious = () => {
    if (viewMode === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const navigateNext = () => {
    if (viewMode === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const periodLabel = useMemo(() => {
    if (viewMode === "week") {
      return `${format(dateRange.start, "d MMM", { locale })} - ${format(dateRange.end, "d MMM yyyy", { locale })}`;
    }
    return format(currentDate, "MMMM yyyy", { locale });
  }, [viewMode, currentDate, dateRange, locale]);

  const handleEditEntry = async (data: {
    id: string;
    date: Date;
    startTime: string;
    endTime: string;
    clientId: string | null;
    description: string;
  }) => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const dateStr = format(data.date, "yyyy-MM-dd");
      const [startH, startM] = data.startTime.split(":").map(Number);
      const [endH, endM] = data.endTime.split(":").map(Number);
      
      const startDate = new Date(data.date);
      startDate.setHours(startH, startM, 0, 0);
      
      const endDate = new Date(data.date);
      endDate.setHours(endH, endM, 0, 0);
      
      const durationSeconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);

      const { error } = await supabase
        .from("time_entries")
        .update({
          date: dateStr,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          duration_seconds: durationSeconds,
          client_id: data.clientId,
          description: data.description || null,
        })
        .eq("id", data.id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: t("timesheet.entryUpdated"),
        description: t("timesheet.entryUpdatedDesc"),
      });

      setEditingEntry(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!user || !deletingEntry) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("time_entries")
        .delete()
        .eq("id", deletingEntry.id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: t("timesheet.entryDeleted"),
        description: t("timesheet.entryDeletedDesc"),
      });

      setDeletingEntry(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-4 sm:space-y-6 tempora-animate-in overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("timesheet.title")}</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {t("timesheet.subtitle")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-border/60 bg-card/50">
                <SelectValue placeholder={t("timesheet.filterClient")} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">{t("timesheet.allClients")}</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: client.color }}
                      />
                      <span className="truncate">{client.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ExportMenu
              entries={entries}
              clients={clients}
              dateRange={dateRange}
              userName={profile?.name || user?.email || "Utente"}
              logoUrl={(profile as any)?.logo_url}
              selectedClientId={selectedClient}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="card-premium p-4 sm:p-5">
          <div className="flex flex-col gap-4">
            {/* Row 1: View mode and Today button */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                  <SelectTrigger className="w-[110px] sm:w-[140px] rounded-xl text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="week">{t("timesheet.week")}</SelectItem>
                    <SelectItem value="month">{t("timesheet.month")}</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" onClick={goToToday} className="rounded-xl text-sm">
                  {t("timesheet.today")}
                </Button>
              </div>

              {/* Total - visible on mobile in row 1 */}
              <div className="flex sm:hidden items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-bold text-primary text-sm">{formatDuration(totalSeconds)}</span>
              </div>
            </div>

            {/* Row 2: Period navigation */}
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <Button variant="outline" size="icon" onClick={navigatePrevious} className="rounded-xl hover:bg-primary/10 hover:text-primary hover:border-primary/30 h-9 w-9 sm:h-10 sm:w-10">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs sm:text-sm font-semibold flex-1 sm:flex-none sm:min-w-[200px] text-center capitalize px-3 sm:px-4 py-2 bg-muted/50 rounded-xl truncate">
                {periodLabel}
              </span>
              <Button variant="outline" size="icon" onClick={navigateNext} className="rounded-xl hover:bg-primary/10 hover:text-primary hover:border-primary/30 h-9 w-9 sm:h-10 sm:w-10">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Total - visible on desktop */}
            <div className="hidden sm:flex items-center justify-center gap-3 px-4 py-2.5 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20 w-fit mx-auto">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">{t("timesheet.total")}:</span>
              <span className="font-bold text-primary">{formatDuration(totalSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Timesheet Grid */}
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] sm:w-[140px] text-xs sm:text-sm">{t("timesheet.day")}</TableHead>
                  <TableHead className="text-xs sm:text-sm">{t("timesheet.activities")}</TableHead>
                  <TableHead className="w-[60px] sm:w-[100px] text-right text-xs sm:text-sm">{t("timesheet.total")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {days.map((day) => {
                  const dateKey = format(day, "yyyy-MM-dd");
                  const dayEntries = entriesByDay.get(dateKey) || [];
                  const dayTotal = totalByDay.get(dateKey) || 0;
                  const isToday = isSameDay(day, new Date());
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                  return (
                    <TableRow
                      key={dateKey}
                      className={cn(
                        "transition-colors",
                        isToday && "bg-primary/5",
                        isWeekend && !isToday && "bg-muted/30"
                      )}
                    >
                      <TableCell className="font-medium p-2 sm:p-4">
                        <div className="flex flex-col">
                          <span className={cn(
                            "capitalize font-semibold text-xs sm:text-sm",
                            isToday && "text-primary"
                          )}>
                            {format(day, "EEE", { locale })}
                            <span className="hidden sm:inline">
                              {format(day, "EE", { locale }).length < format(day, "EEEE", { locale }).length && 
                                format(day, "EEEE", { locale }).slice(format(day, "EEE", { locale }).length)}
                            </span>
                          </span>
                          <span className="text-[10px] sm:text-xs text-muted-foreground">
                            {format(day, "d MMM", { locale })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="p-2 sm:p-4">
                        {dayEntries.length === 0 ? (
                          <span className="text-muted-foreground text-xs sm:text-sm">-</span>
                        ) : (
                          <div className="space-y-2">
                            {dayEntries.map((entry) => {
                              const client = getClientById(entry.client_id);
                              return (
                                <div
                                  key={entry.id}
                                  className="flex items-start sm:items-center gap-2 sm:gap-3 py-1 sm:py-1.5 group"
                                >
                                  <div
                                    className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5 sm:mt-0"
                                    style={{
                                      backgroundColor: client?.color || "#94a3b8",
                                    }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                      <span className="text-xs sm:text-sm font-medium truncate max-w-[80px] sm:max-w-none">
                                        {client?.name || t("timesheet.noClient")}
                                      </span>
                                      <Badge variant="outline" className="text-[10px] sm:text-xs rounded-full px-1.5 sm:px-2">
                                        {formatDuration(entry.duration_seconds || 0)}
                                      </Badge>
                                    </div>
                                    {entry.description && (
                                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-none">
                                        {entry.description}
                                      </p>
                                    )}
                                    {/* Time on mobile - below description */}
                                    <span className="text-[10px] text-muted-foreground sm:hidden">
                                      {formatTimeOfDay(entry.start_time)}
                                      {entry.end_time && ` - ${formatTimeOfDay(entry.end_time)}`}
                                    </span>
                                  </div>
                                  {/* Time on desktop */}
                                  <span className="hidden sm:block text-xs text-muted-foreground whitespace-nowrap">
                                    {formatTimeOfDay(entry.start_time)}
                                    {entry.end_time && ` - ${formatTimeOfDay(entry.end_time)}`}
                                  </span>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 sm:opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex-shrink-0"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-xl">
                                      <DropdownMenuItem onClick={() => setEditingEntry(entry)} className="rounded-lg">
                                        <Pencil className="h-4 w-4 mr-2" />
                                        {t("common.edit")}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => setDeletingEntry(entry)}
                                        className="text-destructive focus:text-destructive rounded-lg"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        {t("common.delete")}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right p-2 sm:p-4">
                        <span className={cn(
                          "font-semibold text-xs sm:text-sm",
                          dayTotal > 0 ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {dayTotal > 0 ? formatDuration(dayTotal) : "-"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Summary by client */}
        {selectedClient === "all" && clients.length > 0 && (
          <div className="card-premium p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t("timesheet.summaryByClient")}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
              {clients.map((client) => {
                const clientTotal = entries
                  .filter((e) => e.client_id === client.id)
                  .reduce((acc, e) => acc + (e.duration_seconds || 0), 0);
                
                if (clientTotal === 0) return null;
                
                const percentage = totalSeconds > 0 
                  ? Math.round((clientTotal / totalSeconds) * 100) 
                  : 0;

                return (
                  <div
                    key={client.id}
                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border bg-gradient-to-br from-card to-muted/30 hover-lift"
                  >
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <div
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: client.color }}
                      />
                      <span className="font-semibold text-xs sm:text-sm truncate">
                        {client.name}
                      </span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gradient">
                      {formatDuration(clientTotal)}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                      {percentage}% {t("timesheet.ofTotal")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Edit Entry Dialog */}
        <EditEntryDialog
          open={!!editingEntry}
          onOpenChange={(open) => !open && setEditingEntry(null)}
          onSubmit={handleEditEntry}
          entry={editingEntry}
          clients={clients}
          isLoading={isSubmitting}
        />

        {/* Delete Entry Dialog */}
        <DeleteEntryDialog
          open={!!deletingEntry}
          onOpenChange={(open) => !open && setDeletingEntry(null)}
          onConfirm={handleDeleteEntry}
          isLoading={isSubmitting}
        />
      </div>
    </DashboardLayout>
  );
}
