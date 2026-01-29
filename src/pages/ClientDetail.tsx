import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { format, startOfMonth, subMonths } from "date-fns";
import { it, enUS, es, fr, de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Clock,
  TrendingUp,
  Calendar,
  Search,
  Edit2,
  Trash2,
  Loader2,
  Mail,
  FileText,
  Euro,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EditEntryDialog } from "@/components/timesheet/EditEntryDialog";
import { DeleteEntryDialog } from "@/components/timesheet/DeleteEntryDialog";
import { SendReportDialog } from "@/components/reports/SendReportDialog";
import { ClientTasksSection } from "@/components/clients/ClientTasksSection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import type { Locale } from "date-fns";

const dateLocales: Record<string, Locale> = { it, en: enUS, es, fr, de };

interface Client {
  id: string;
  name: string;
  email: string | null;
  color: string;
  hourly_rate: number | null;
  notes: string | null;
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

export default function ClientDetail() {
  const { clientId } = useParams<{ clientId: string }>();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const locale = dateLocales[language] || enUS;
  const [client, setClient] = useState<Client | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");
  
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<TimeEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  useEffect(() => {
    if (user && clientId) {
      fetchData();
    }
  }, [user, clientId]);

  const fetchData = async () => {
    if (!clientId) return;
    setLoading(true);
    
    try {
      const [clientRes, entriesRes] = await Promise.all([
        supabase
          .from("clients")
          .select("*")
          .eq("id", clientId)
          .single(),
        supabase
          .from("time_entries")
          .select("*")
          .eq("client_id", clientId)
          .order("start_time", { ascending: false }),
      ]);

      if (clientRes.error) throw clientRes.error;
      if (entriesRes.error) throw entriesRes.error;

      setClient(clientRes.data);
      setEntries(entriesRes.data || []);
    } catch (error) {
      console.error("Error fetching client:", error);
      toast.error(t("clientDetail.errorLoading"));
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = useMemo(() => {
    let filtered = entries;

    // Filter by period
    if (periodFilter !== "all") {
      const now = new Date();
      let startDate: Date;
      
      switch (periodFilter) {
        case "month":
          startDate = startOfMonth(now);
          break;
        case "3months":
          startDate = startOfMonth(subMonths(now, 2));
          break;
        case "6months":
          startDate = startOfMonth(subMonths(now, 5));
          break;
        case "year":
          startDate = startOfMonth(subMonths(now, 11));
          break;
        default:
          startDate = new Date(0);
      }
      
      filtered = filtered.filter(entry => new Date(entry.date) >= startDate);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(entry => 
        entry.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [entries, periodFilter, searchQuery]);

  const totalSeconds = useMemo(() => 
    filteredEntries.reduce((acc, e) => acc + (e.duration_seconds || 0), 0),
    [filteredEntries]
  );

  const totalEarnings = useMemo(() => {
    if (!client?.hourly_rate) return null;
    return (totalSeconds / 3600) * client.hourly_rate;
  }, [totalSeconds, client?.hourly_rate]);

  const entriesByDate = useMemo(() => {
    const grouped: Record<string, TimeEntry[]> = {};
    filteredEntries.forEach(entry => {
      const dateKey = entry.date;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(entry);
    });
    return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredEntries]);

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
      const dateStr = data.date.toISOString().split("T")[0];
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
          client_id: data.clientId,
          description: data.description || null,
          date: dateStr,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          duration_seconds: durationSeconds,
        })
        .eq("id", data.id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success(t("clientDetail.entryUpdated"));
      setEditingEntry(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
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

      toast.success(t("clientDetail.entryDeleted"));
      setDeletingEntry(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto text-center py-16 sm:py-20">
          <p className="text-base sm:text-lg text-muted-foreground mb-4">{t("clientDetail.notFound")}</p>
          <Link to="/clients">
            <Button variant="outline" className="rounded-xl w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("clientDetail.backToClients")}
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-5 sm:space-y-8 tempora-animate-in overflow-x-hidden">
        {/* Back button & Header */}
        <div>
          <Link to="/clients">
            <Button variant="ghost" size="sm" className="mb-3 sm:mb-4 -ml-2 rounded-xl hover:bg-primary/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("clientDetail.backToClients")}
            </Button>
          </Link>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-2xl font-bold text-white shadow-lg flex-shrink-0"
                style={{ 
                  background: `linear-gradient(135deg, ${client.color}, ${client.color}cc)`,
                  boxShadow: `0 8px 24px -4px ${client.color}40`
                }}
              >
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-3xl font-bold tracking-tight truncate">{client.name}</h1>
                <p className="text-sm text-muted-foreground truncate">{client.email || t("clientDetail.noEmail")}</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setReportDialogOpen(true)}
              className="btn-gradient rounded-xl w-full sm:w-auto"
            >
              <Mail className="w-4 h-4 mr-2" />
              {t("clientDetail.sendReport")}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="card-premium p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold truncate">{formatDuration(totalSeconds)}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{t("clientDetail.totalHoursFiltered")}</p>
              </div>
            </div>
          </div>
          
          <div className="card-premium p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold truncate">
                  {client.hourly_rate ? `€${client.hourly_rate}/h` : "-"}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{t("clientDetail.hourlyRate")}</p>
              </div>
            </div>
          </div>
          
          <div className="card-premium p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Euro className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold truncate">
                  {totalEarnings !== null ? `€${totalEarnings.toFixed(2)}` : "-"}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{t("clientDetail.earningsFiltered")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {client.notes && (
          <div className="card-premium p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t("clientDetail.notes")}</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">{client.notes}</p>
          </div>
        )}

        {/* Tasks Section */}
        <ClientTasksSection clientId={clientId!} />

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("clientDetail.searchDescription")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 rounded-xl h-11 bg-card/50 border-border/60 w-full"
            />
          </div>
          
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-full sm:w-[180px] rounded-xl h-11">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">{t("clientDetail.allHistory")}</SelectItem>
              <SelectItem value="month">{t("clientDetail.thisMonth")}</SelectItem>
              <SelectItem value="3months">{t("clientDetail.last3Months")}</SelectItem>
              <SelectItem value="6months">{t("clientDetail.last6Months")}</SelectItem>
              <SelectItem value="year">{t("clientDetail.lastYear")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Entries List */}
        <div className="space-y-5 sm:space-y-6">
          {entriesByDate.length === 0 ? (
            <div className="card-premium text-center py-12 sm:py-16 px-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <p className="text-base sm:text-lg font-medium mb-2">{t("clientDetail.noEntries")}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t("clientDetail.noEntriesDesc")}
              </p>
            </div>
          ) : (
            entriesByDate.map(([dateKey, dayEntries]) => {
              const dayTotal = dayEntries.reduce((acc, e) => acc + (e.duration_seconds || 0), 0);
              return (
                <div key={dateKey} className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm sm:text-base truncate">
                      {format(new Date(dateKey), "EEE d MMM yyyy", { locale })}
                    </h3>
                    <span className="text-xs sm:text-sm font-medium text-primary whitespace-nowrap">
                      {formatDuration(dayTotal)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {dayEntries.map((entry) => (
                      <div key={entry.id} className="card-premium group hover-lift p-3 sm:p-4">
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                          <div
                            className="w-1 h-10 sm:h-12 rounded-full flex-shrink-0"
                            style={{ backgroundColor: client.color }}
                          />
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm sm:text-base truncate">
                              {entry.description || t("clientDetail.noDescription")}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-2 text-[10px] sm:text-xs text-muted-foreground">
                              <span>
                                {formatTimeOfDay(entry.start_time)}
                                {entry.end_time && ` - ${formatTimeOfDay(entry.end_time)}`}
                              </span>
                              <span className="sm:hidden font-bold text-primary">
                                {formatDuration(entry.duration_seconds || 0)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="hidden sm:block text-right flex-shrink-0">
                            <p className="font-bold text-gradient">
                              {formatDuration(entry.duration_seconds || 0)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-xl hover:bg-primary/10 h-8 w-8 sm:h-9 sm:w-9"
                              onClick={() => setEditingEntry(entry)}
                            >
                              <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10 rounded-xl h-8 w-8 sm:h-9 sm:w-9"
                              onClick={() => setDeletingEntry(entry)}
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Edit Entry Dialog */}
      <EditEntryDialog
        open={!!editingEntry}
        onOpenChange={(open) => !open && setEditingEntry(null)}
        onSubmit={handleEditEntry}
        entry={editingEntry}
        clients={client ? [client] : []}
        isLoading={isSubmitting}
      />

      {/* Delete Entry Dialog */}
      <DeleteEntryDialog
        open={!!deletingEntry}
        onOpenChange={(open) => !open && setDeletingEntry(null)}
        onConfirm={handleDeleteEntry}
        isLoading={isSubmitting}
      />

      {/* Send Report Dialog */}
      <SendReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        clients={client ? [client] : []}
        defaultClientId={client?.id}
      />
    </DashboardLayout>
  );
}
