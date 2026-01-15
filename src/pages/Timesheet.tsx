import { useState, useEffect, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, subWeeks, addMonths, subMonths, eachDayOfInterval, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
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
        title: "Errore",
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
      return `${format(dateRange.start, "d MMM", { locale: it })} - ${format(dateRange.end, "d MMM yyyy", { locale: it })}`;
    }
    return format(currentDate, "MMMM yyyy", { locale: it });
  }, [viewMode, currentDate, dateRange]);

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
        title: "Registrazione aggiornata",
        description: "Le modifiche sono state salvate con successo.",
      });

      setEditingEntry(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Errore",
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
        title: "Registrazione eliminata",
        description: "La registrazione è stata eliminata con successo.",
      });

      setDeletingEntry(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Errore",
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
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Timesheet</h1>
            <p className="text-muted-foreground mt-1">
              Visualizza le tue registrazioni orarie
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-[180px] rounded-xl border-border/60 bg-card/50">
                <SelectValue placeholder="Filtra cliente" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Tutti i clienti</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: client.color }}
                      />
                      {client.name}
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
        <div className="card-premium p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <SelectTrigger className="w-[140px] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="week">Settimana</SelectItem>
                  <SelectItem value="month">Mese</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={goToToday} className="rounded-xl">
                Oggi
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={navigatePrevious} className="rounded-xl hover:bg-primary/10 hover:text-primary hover:border-primary/30">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-semibold min-w-[200px] text-center capitalize px-4 py-2 bg-muted/50 rounded-xl">
                {periodLabel}
              </span>
              <Button variant="outline" size="icon" onClick={navigateNext} className="rounded-xl hover:bg-primary/10 hover:text-primary hover:border-primary/30">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Totale:</span>
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
                    <TableHead className="w-[140px]">Giorno</TableHead>
                    <TableHead>Attività</TableHead>
                    <TableHead className="w-[100px] text-right">Totale</TableHead>
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
                          isToday && "bg-primary/5",
                          isWeekend && !isToday && "bg-muted/30"
                        )}
                      >
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className={cn(
                              "capitalize",
                              isToday && "text-primary font-semibold"
                            )}>
                              {format(day, "EEEE", { locale: it })}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(day, "d MMMM", { locale: it })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {dayEntries.length === 0 ? (
                            <span className="text-muted-foreground text-sm">-</span>
                          ) : (
                            <div className="space-y-2">
                              {dayEntries.map((entry) => {
                                const client = getClientById(entry.client_id);
                                return (
                                  <div
                                    key={entry.id}
                                    className="flex items-center gap-3 py-1 group"
                                  >
                                    <div
                                      className="w-2 h-2 rounded-full flex-shrink-0"
                                      style={{
                                        backgroundColor: client?.color || "#94a3b8",
                                      }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">
                                          {client?.name || "Senza cliente"}
                                        </span>
                                        <Badge variant="outline" className="text-xs">
                                          {formatDuration(entry.duration_seconds || 0)}
                                        </Badge>
                                      </div>
                                      {entry.description && (
                                        <p className="text-xs text-muted-foreground truncate">
                                          {entry.description}
                                        </p>
                                      )}
                                    </div>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                      {formatTimeOfDay(entry.start_time)}
                                      {entry.end_time && ` - ${formatTimeOfDay(entry.end_time)}`}
                                    </span>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setEditingEntry(entry)}>
                                          <Pencil className="h-4 w-4 mr-2" />
                                          Modifica
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => setDeletingEntry(entry)}
                                          className="text-destructive focus:text-destructive"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Elimina
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={cn(
                            "font-medium",
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
          <div className="card-premium p-6">
            <h3 className="text-lg font-semibold mb-4">Riepilogo per cliente</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                    className="p-4 rounded-2xl border bg-gradient-to-br from-card to-muted/30 hover-lift"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: client.color }}
                      />
                      <span className="font-semibold text-sm truncate">
                        {client.name}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gradient">
                      {formatDuration(clientTotal)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {percentage}% del totale
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
