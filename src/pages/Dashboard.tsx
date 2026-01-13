import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ManualEntryDialog } from "@/components/dashboard/ManualEntryDialog";
import { cn } from "@/lib/utils";
import { useTimer } from "@/hooks/useTimer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

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
  const timer = useTimer();

  const [clients, setClients] = useState<Client[]>([]);
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [savingManual, setSavingManual] = useState(false);

  const selectedClient = clients.find((c) => c.id === timer.clientId) || null;

  // Fetch clients and today's entries
  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split("T")[0];

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
          .eq("date", today)
          .order("start_time", { ascending: false }),
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (entriesRes.error) throw entriesRes.error;

      setClients(clientsRes.data || []);
      setTodayEntries(entriesRes.data || []);

      // Auto-select first client if none selected
      if (!timer.clientId && clientsRes.data && clientsRes.data.length > 0) {
        timer.setClientId(clientsRes.data[0].id);
      }
    } catch (error: any) {
      toast({
        title: "Errore",
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

  // Refetch when timer stops
  useEffect(() => {
    if (!timer.isRunning && !timer.saving) {
      fetchData();
    }
  }, [timer.isRunning, timer.saving, fetchData]);

  // Keyboard shortcut
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
      timer.start(timer.clientId, timer.description);
    }
  }, [timer]);

  const handleManualEntry = async (data: {
    date: Date;
    startTime: string;
    endTime: string;
    clientId: string | null;
    description: string;
  }) => {
    if (!user) return;
    setSavingManual(true);

    try {
      const dateStr = data.date.toISOString().split("T")[0];
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
        description: data.description || null,
        date: dateStr,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        duration_seconds: durationSeconds,
        entry_type: "manual",
      });

      if (error) throw error;

      toast({
        title: "Salvato",
        description: "Voce inserita con successo",
      });
      setManualDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Errore",
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
        title: "Eliminato",
        description: "Voce eliminata con successo",
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
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
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
        {/* Timer Card */}
        <Card
          variant={timer.isRunning ? "timer-active" : "timer"}
          className={cn(
            "relative overflow-hidden transition-all duration-500",
            timer.isRunning && "timer-pulse"
          )}
        >
          {/* Client color bar */}
          {selectedClient && (
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: selectedClient.color }}
            />
          )}

          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center">
              {/* Client selector */}
              <div className="relative mb-6">
                {clients.length > 0 ? (
                  <>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 text-sm"
                      onClick={() => setShowClientDropdown(!showClientDropdown)}
                      disabled={timer.isRunning}
                    >
                      {selectedClient ? (
                        <>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: selectedClient.color }}
                          />
                          <span>{selectedClient.name}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">
                          Seleziona cliente
                        </span>
                      )}
                      <ChevronDown className="w-4 h-4" />
                    </Button>

                    {showClientDropdown && (
                      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-card border rounded-lg shadow-lg py-2 z-10 animate-scale-in">
                        {clients.map((client) => (
                          <button
                            key={client.id}
                            className="w-full px-4 py-2 flex items-center gap-3 hover:bg-muted transition-colors text-sm"
                            onClick={() => {
                              timer.setClientId(client.id);
                              setShowClientDropdown(false);
                            }}
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: client.color }}
                            />
                            {client.name}
                          </button>
                        ))}
                        <div className="border-t my-2" />
                        <Link
                          to="/clients"
                          className="w-full px-4 py-2 flex items-center gap-3 hover:bg-muted transition-colors text-sm text-primary"
                        >
                          <Plus className="w-4 h-4" />
                          Nuovo cliente
                        </Link>
                      </div>
                    )}
                  </>
                ) : (
                  <Link to="/clients">
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Aggiungi cliente
                    </Button>
                  </Link>
                )}
              </div>

              {/* Timer display */}
              <div
                className={cn(
                  "font-mono text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 transition-all",
                  timer.isRunning ? "text-success" : "text-foreground"
                )}
              >
                {formatTime(timer.elapsedTime)}
              </div>

              {/* Description input */}
              <Input
                placeholder="Su cosa stai lavorando?"
                value={timer.description}
                onChange={(e) => timer.setDescription(e.target.value)}
                className="max-w-md text-center border-dashed mb-8"
                disabled={timer.isRunning}
              />

              {/* Action buttons */}
              <div className="flex gap-4">
                <Button
                  variant={timer.isRunning ? "timer-stop" : "timer"}
                  size="lg"
                  onClick={handleStartStop}
                  disabled={timer.saving}
                  className="min-w-[140px]"
                >
                  {timer.saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : timer.isRunning ? (
                    <>
                      <Square className="w-5 h-5 fill-current" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      Start
                    </>
                  )}
                </Button>
                <Button
                  variant="timer-manual"
                  size="lg"
                  onClick={() => setManualDialogOpen(true)}
                  disabled={timer.isRunning}
                >
                  <Clock className="w-5 h-5" />
                  Manuale
                </Button>
              </div>

              {/* Keyboard hint */}
              <p className="mt-6 text-xs text-muted-foreground flex items-center gap-2">
                <Keyboard className="w-3 h-3" />
                Premi Spazio per start/stop
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Today's entries */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Oggi</h2>
              <p className="text-sm text-muted-foreground">
                Totale:{" "}
                <span className="font-medium text-foreground">
                  {formatDuration(totalTodaySeconds)}
                </span>
              </p>
            </div>
            {clients.length > 0 && todayEntries.length > 0 && (
              <div className="flex items-center gap-1">
                {clients.map((client) => {
                  const clientTime = todayEntries
                    .filter((e) => e.client_id === client.id)
                    .reduce((acc, e) => acc + (e.duration_seconds || 0), 0);
                  if (clientTime === 0) return null;
                  const percentage = (clientTime / totalTodaySeconds) * 100;
                  return (
                    <div
                      key={client.id}
                      className="h-2 rounded-full"
                      style={{
                        backgroundColor: client.color,
                        width: `${Math.max(percentage * 0.8, 8)}px`,
                      }}
                      title={`${client.name}: ${formatDuration(clientTime)}`}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            {todayEntries.length === 0 ? (
              <Card variant="default" className="text-center py-12">
                <p className="text-muted-foreground mb-2">
                  Nessuna attività oggi.
                </p>
                <p className="text-sm text-muted-foreground">
                  Pronto a iniziare? 🚀
                </p>
              </Card>
            ) : (
              todayEntries.map((entry) => {
                const client = getClientById(entry.client_id);
                return (
                  <Card key={entry.id} variant="interactive" className="group">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Color indicator */}
                        <div
                          className="w-1 h-12 rounded-full"
                          style={{
                            backgroundColor: client?.color || "#94a3b8",
                          }}
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium truncate">
                              {client?.name || "Senza cliente"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {entry.description || "Nessuna descrizione"}
                          </p>
                        </div>

                        {/* Time info */}
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {formatDuration(entry.duration_seconds || 0)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTimeOfDay(entry.start_time)}
                            {entry.end_time &&
                              ` - ${formatTimeOfDay(entry.end_time)}`}
                          </div>
                        </div>

                        {/* Actions (visible on hover) */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon-sm" disabled>
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive"
                            onClick={() => handleDeleteEntry(entry.id)}
                            disabled={deletingId === entry.id}
                          >
                            {deletingId === entry.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Manual Entry Dialog */}
        <ManualEntryDialog
          open={manualDialogOpen}
          onOpenChange={setManualDialogOpen}
          onSubmit={handleManualEntry}
          clients={clients}
          isLoading={savingManual}
        />
      </div>
    </DashboardLayout>
  );
}
