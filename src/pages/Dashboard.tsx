import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Play,
  Square,
  Clock,
  Plus,
  ChevronDown,
  Keyboard,
  Edit2,
  Trash2,
  Loader2,
  Sparkles,
  Mail,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ManualEntryDialog } from "@/components/dashboard/ManualEntryDialog";
import { TimerDisplay } from "@/components/dashboard/TimerDisplay";
import { EditEntryDialog } from "@/components/timesheet/EditEntryDialog";
import { TrialBanner } from "@/components/dashboard/TrialBanner";
import { CheckoutSuccessDialog } from "@/components/dashboard/CheckoutSuccessDialog";
import { SendReportDialog } from "@/components/reports/SendReportDialog";
import { cn } from "@/lib/utils";
import { useTimer } from "@/hooks/useTimer";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface Client {
  id: string;
  name: string;
  color: string;
  email: string | null;
}

interface Task {
  id: string;
  title: string;
  client_id: string | null;
  status: string;
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

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const timer = useTimer();

  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [savingManual, setSavingManual] = useState(false);

  const selectedClient = clients.find((c) => c.id === timer.clientId) || null;
  const selectedTask = tasks.find((t) => t.id === timer.taskId) || null;
  
  // Filter tasks by selected client
  const filteredTasks = tasks.filter(
    (task) => !timer.clientId || task.client_id === timer.clientId || task.client_id === null
  );

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      const today = format(new Date(), "yyyy-MM-dd");

      const [clientsRes, entriesRes, tasksRes] = await Promise.all([
        supabase
          .from("clients")
          .select("id, name, color, email")
          .eq("user_id", user.id)
          .order("name"),
        supabase
          .from("time_entries")
          .select("*")
          .eq("user_id", user.id)
          .eq("date", today)
          .order("start_time", { ascending: false }),
        supabase
          .from("tasks")
          .select("id, title, client_id, status")
          .eq("user_id", user.id)
          .neq("status", "completed")
          .order("created_at", { ascending: false }),
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (entriesRes.error) throw entriesRes.error;
      if (tasksRes.error) throw tasksRes.error;

      setClients(clientsRes.data || []);
      setTodayEntries(entriesRes.data || []);
      setTasks(tasksRes.data || []);

      if (!timer.clientId && clientsRes.data && clientsRes.data.length > 0) {
        timer.setClientId(clientsRes.data[0].id);
      }
    } catch (error: any) {
      toast({
        title: t("dashboard.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, timer.clientId, timer.setClientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!timer.isRunning && !timer.saving) {
      fetchData();
    }
  }, [timer.isRunning, timer.saving, fetchData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        handleStartStop();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [timer.isRunning, timer.clientId, timer.description]);

  const handleStartStop = useCallback(async () => {
    if (timer.isRunning) {
      await timer.stop();
    } else {
      timer.start(timer.clientId, timer.description, timer.taskId);
    }
  }, [timer]);

  const handleManualEntry = async (data: {
    date: Date;
    startTime: string;
    endTime: string;
    clientId: string | null;
    taskId: string | null;
    description: string;
  }) => {
    if (!user) return;
    setSavingManual(true);

    try {
      const dateStr = format(data.date, "yyyy-MM-dd");
      const [startH, startM] = data.startTime.split(":").map(Number);
      const [endH, endM] = data.endTime.split(":").map(Number);

      const startDate = new Date(data.date);
      startDate.setHours(startH, startM, 0, 0);

      const endDate = new Date(data.date);
      endDate.setHours(endH, endM, 0, 0);

      const durationSeconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);

      const { error } = await supabase.from("time_entries").insert({
        user_id: user.id,
        client_id: data.clientId,
        task_id: data.taskId,
        description: data.description || null,
        date: dateStr,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        duration_seconds: durationSeconds,
        entry_type: "manual",
      });

      if (error) throw error;

      toast({
        title: t("dashboard.entrySaved"),
        description: t("dashboard.entrySavedDesc"),
      });
      setManualDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: t("dashboard.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingManual(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!user) return;

    setDeletingId(entryId);
    try {
      const { error } = await supabase
        .from("time_entries")
        .delete()
        .eq("id", entryId)
        .eq("user_id", user.id);

      if (error) throw error;

      setTodayEntries((prev) => prev.filter((e) => e.id !== entryId));
      toast({
        title: t("dashboard.entryDeleted"),
        description: t("dashboard.entryDeletedDesc"),
      });
    } catch (error: any) {
      toast({
        title: t("dashboard.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditEntry = async (data: {
    id: string;
    date: Date;
    startTime: string;
    endTime: string;
    clientId: string | null;
    description: string;
  }) => {
    if (!user) return;
    setIsEditing(true);

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

      toast({
        title: t("dashboard.entryEdited"),
        description: t("dashboard.entryEditedDesc"),
      });
      setEditingEntry(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: t("dashboard.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  const totalTodaySeconds = todayEntries.reduce(
    (acc, entry) => acc + (entry.duration_seconds || 0),
    0
  );

  const getClientById = (id: string | null) =>
    clients.find((c) => c.id === id) || null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8 tempora-animate-in overflow-x-hidden">
        {/* Checkout Success Dialog */}
        <CheckoutSuccessDialog />
        
        {/* Trial Banner */}
        <TrialBanner />
        {/* Timer Card - Premium Design */}
        <div
          className={cn(
            "relative overflow-hidden rounded-3xl border bg-card transition-all duration-500",
            timer.isRunning 
              ? "border-success/30 shadow-[0_0_60px_-12px_hsl(var(--success)/0.4)]" 
              : "border-border/50 shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.15)]"
          )}
        >
          {/* Background patterns */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-purple-500/[0.03]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/[0.05] to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/[0.05] to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          {/* Client color accent bar */}
          {selectedClient && (
            <div
              className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
              style={{ 
                background: `linear-gradient(90deg, ${selectedClient.color}, ${selectedClient.color}80, transparent)` 
              }}
            />
          )}

          <div className="relative pt-8 pb-10 px-4 sm:px-6">
            <div className="flex flex-col items-center">
              {/* Client & Task selectors */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                {/* Client selector */}
                <div className="relative">
                  {clients.length > 0 ? (
                    <>
                      <Button
                        variant="outline"
                        className="flex items-center gap-3 px-5 py-2.5 rounded-2xl border-border/60 bg-card/50 hover:bg-card hover:border-primary/30 transition-all"
                        onClick={() => {
                          setShowClientDropdown(!showClientDropdown);
                          setShowTaskDropdown(false);
                        }}
                        disabled={timer.isRunning}
                      >
                        {selectedClient ? (
                          <>
                            <div
                              className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20"
                              style={{ backgroundColor: selectedClient.color }}
                            />
                            <span className="font-medium">{selectedClient.name}</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">
                            {t("dashboard.selectClient")}
                          </span>
                        )}
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </Button>

                      {showClientDropdown && (
                        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-56 bg-card border rounded-2xl py-2 z-20 shadow-lg">
                          {clients.map((client) => (
                            <button
                              key={client.id}
                              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary/10 transition-colors text-sm"
                              onClick={() => {
                                timer.setClientId(client.id);
                                // Reset task if it doesn't belong to this client
                                const currentTask = tasks.find(t => t.id === timer.taskId);
                                if (currentTask && currentTask.client_id !== null && currentTask.client_id !== client.id) {
                                  timer.setTaskId(null);
                                }
                                setShowClientDropdown(false);
                              }}
                            >
                              <div
                                className="w-3.5 h-3.5 rounded-full"
                                style={{ backgroundColor: client.color }}
                              />
                              <span className="font-medium">{client.name}</span>
                            </button>
                          ))}
                          <div className="border-t border-border/50 my-2" />
                          <Link
                            to="/clients"
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary/10 transition-colors text-sm text-primary font-medium"
                          >
                            <Plus className="w-4 h-4" />
                            {t("dashboard.newClient")}
                          </Link>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link to="/clients">
                      <Button variant="outline" className="rounded-2xl">
                        <Plus className="w-4 h-4 mr-2" />
                        {t("dashboard.addClient")}
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Task selector */}
                {filteredTasks.length > 0 && (
                  <div className="relative">
                    <Button
                      variant="outline"
                      className="flex items-center gap-3 px-5 py-2.5 rounded-2xl border-border/60 bg-card/50 hover:bg-card hover:border-primary/30 transition-all"
                      onClick={() => {
                        setShowTaskDropdown(!showTaskDropdown);
                        setShowClientDropdown(false);
                      }}
                      disabled={timer.isRunning}
                    >
                      {selectedTask ? (
                        <span className="font-medium">{selectedTask.title}</span>
                      ) : (
                        <span className="text-muted-foreground">
                          {t("dashboard.selectTask")}
                        </span>
                      )}
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </Button>

                    {showTaskDropdown && (
                      <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-64 bg-card border rounded-2xl py-2 z-20 shadow-lg max-h-64 overflow-y-auto">
                        <button
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary/10 transition-colors text-sm text-muted-foreground"
                          onClick={() => {
                            timer.setTaskId(null);
                            setShowTaskDropdown(false);
                          }}
                        >
                          {t("dashboard.noTask")}
                        </button>
                        <div className="border-t border-border/50 my-2" />
                        {filteredTasks.map((task) => (
                          <button
                            key={task.id}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary/10 transition-colors text-sm"
                            onClick={() => {
                              timer.setTaskId(task.id);
                              // If task has a client, also set that client
                              if (task.client_id && task.client_id !== timer.clientId) {
                                timer.setClientId(task.client_id);
                              }
                              setShowTaskDropdown(false);
                            }}
                          >
                            <span className="font-medium truncate">{task.title}</span>
                          </button>
                        ))}
                        <div className="border-t border-border/50 my-2" />
                        <Link
                          to="/tasks"
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary/10 transition-colors text-sm text-primary font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          {t("dashboard.newTask")}
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Timer display - Premium */}
              <div className="mb-4 sm:mb-6 w-full flex justify-center">
                <TimerDisplay
                  time={formatTime(timer.elapsedTime)}
                  isRunning={timer.isRunning}
                />
              </div>

              {/* Description input */}
              <Input
                placeholder={t("dashboard.workingOn")}
                value={timer.description}
                onChange={(e) => timer.setDescription(e.target.value)}
                className="w-full max-w-md text-center border-dashed border-border/60 mb-8 sm:mb-10 rounded-2xl h-12 bg-card/50 focus:bg-card transition-colors"
                disabled={timer.isRunning}
              />

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
                <Button
                  size="lg"
                  onClick={handleStartStop}
                  disabled={timer.saving}
                  className={cn(
                    "w-full sm:w-auto sm:min-w-[160px] h-14 rounded-2xl text-base font-semibold transition-all duration-300",
                    timer.isRunning 
                      ? "bg-destructive hover:bg-destructive/90 shadow-lg" 
                      : "btn-gradient"
                  )}
                >
                  {timer.saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : timer.isRunning ? (
                    <>
                      <Square className="w-5 h-5 mr-2 fill-current" />
                      {t("dashboard.stop")}
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2 fill-current" />
                      {t("dashboard.start")}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setManualDialogOpen(true)}
                  disabled={timer.isRunning}
                  className="w-full sm:w-auto h-14 rounded-2xl hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
                >
                  <Clock className="w-5 h-5 mr-2" />
                  {t("dashboard.manual")}
                </Button>
              </div>

              {/* Keyboard hint - hidden on mobile */}
              <p className="hidden sm:flex mt-8 text-xs text-muted-foreground items-center gap-2 px-4 py-2 bg-muted/50 rounded-full">
                <Keyboard className="w-3.5 h-3.5" />
                {t("dashboard.keyboardHint")} <kbd className="px-1.5 py-0.5 bg-card rounded text-[10px] font-mono border">{t("dashboard.spaceKey")}</kbd> {t("dashboard.keyboardHintAction")}
              </p>
            </div>
          </div>
        </div>

        {/* Today's entries */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">{t("dashboard.today")}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t("dashboard.total")}{" "}
                <span className="font-semibold text-primary">
                  {formatDuration(totalTodaySeconds)}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {todayEntries.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReportDialogOpen(true)}
                  className="rounded-xl hover:bg-primary/10 hover:border-primary/30"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {t("dashboard.sendReport")}
                </Button>
              )}
              {clients.length > 0 && todayEntries.length > 0 && (
              <div className="flex items-center gap-1.5 p-2 bg-muted/50 rounded-full">
                {clients.map((client) => {
                  const clientTime = todayEntries
                    .filter((e) => e.client_id === client.id)
                    .reduce((acc, e) => acc + (e.duration_seconds || 0), 0);
                  if (clientTime === 0) return null;
                  const percentage = (clientTime / totalTodaySeconds) * 100;
                  return (
                    <div
                      key={client.id}
                      className="h-2.5 rounded-full transition-all hover:scale-110"
                      style={{
                        backgroundColor: client.color,
                        width: `${Math.max(percentage * 0.8, 10)}px`,
                      }}
                      title={`${client.name}: ${formatDuration(clientTime)}`}
                    />
                  );
                })}
              </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3 stagger-children">
            {todayEntries.length === 0 ? (
              <div className="card-premium text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <p className="text-lg font-medium mb-2">
                  {t("dashboard.noEntries")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.noEntriesDesc")}
                </p>
              </div>
            ) : (
              todayEntries.map((entry) => {
                const client = getClientById(entry.client_id);
                return (
                  <div key={entry.id} className="card-premium group hover-lift p-5">
                    <div className="flex items-center gap-4">
                      {/* Color indicator */}
                      <div
                        className="w-1.5 h-14 rounded-full"
                        style={{
                          background: `linear-gradient(180deg, ${client?.color || "#94a3b8"}, ${client?.color || "#94a3b8"}60)`,
                        }}
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold truncate">
                            {client?.name || t("dashboard.noClient")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {entry.description || t("dashboard.noDescription")}
                        </p>
                      </div>

                      {/* Time info */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-gradient">
                          {formatDuration(entry.duration_seconds || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTimeOfDay(entry.start_time)}
                          {entry.end_time &&
                            ` - ${formatTimeOfDay(entry.end_time)}`}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-xl hover:bg-primary/10"
                          onClick={() => setEditingEntry(entry)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 rounded-xl"
                          onClick={() => handleDeleteEntry(entry.id)}
                          disabled={deletingId === entry.id}
                        >
                          {deletingId === entry.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Manual Entry Dialog */}
      <ManualEntryDialog
        open={manualDialogOpen}
        onOpenChange={setManualDialogOpen}
        onSubmit={handleManualEntry}
        clients={clients}
        tasks={tasks}
        isLoading={savingManual}
      />

      {/* Edit Entry Dialog */}
      <EditEntryDialog
        open={!!editingEntry}
        onOpenChange={(open) => !open && setEditingEntry(null)}
        onSubmit={handleEditEntry}
        entry={editingEntry}
        clients={clients}
        isLoading={isEditing}
      />

      {/* Send Report Dialog */}
      <SendReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        clients={clients}
        defaultPeriod="today"
      />
    </DashboardLayout>
  );
}
