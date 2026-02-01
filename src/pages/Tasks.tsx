import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Circle,
  Calendar,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
  ListTodo,
  Filter,
  Link2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { DeleteTaskDialog } from "@/components/tasks/DeleteTaskDialog";
import { LinkTimeEntriesDialog } from "@/components/tasks/LinkTimeEntriesDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";
import { it, enUS, es, fr, de } from "date-fns/locale";

type TaskStatus = "todo" | "in_progress" | "completed";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  client_id: string | null;
  created_at: string;
  total_seconds: number;
}

interface Client {
  id: string;
  name: string;
  color: string;
}

const statusConfig: Record<TaskStatus, { icon: typeof Circle; label: string; color: string }> = {
  todo: { icon: Circle, label: "tasks.status.todo", color: "text-muted-foreground" },
  in_progress: { icon: Clock, label: "tasks.status.inProgress", color: "text-warning" },
  completed: { icon: CheckCircle2, label: "tasks.status.completed", color: "text-success" },
};

export default function Tasks() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);

  const getLocale = () => {
    switch (language) {
      case "it": return it;
      case "es": return es;
      case "fr": return fr;
      case "de": return de;
      default: return enUS;
    }
  };

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      const [tasksRes, clientsRes, entriesRes] = await Promise.all([
        supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("clients")
          .select("id, name, color")
          .eq("user_id", user.id)
          .order("name"),
        supabase
          .from("time_entries")
          .select("task_id, duration_seconds")
          .eq("user_id", user.id)
          .not("task_id", "is", null),
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (clientsRes.error) throw clientsRes.error;
      if (entriesRes.error) throw entriesRes.error;

      // Calculate total seconds per task
      const hoursMap: Record<string, number> = {};
      entriesRes.data?.forEach((entry) => {
        if (entry.task_id && entry.duration_seconds) {
          hoursMap[entry.task_id] = (hoursMap[entry.task_id] || 0) + entry.duration_seconds;
        }
      });

      const tasksWithHours = (tasksRes.data || []).map((task) => ({
        ...task,
        status: task.status as TaskStatus,
        total_seconds: hoursMap[task.id] || 0,
      }));

      setTasks(tasksWithHours);
      setClients(clientsRes.data || []);
    } catch (error: any) {
      toast({
        title: t("tasks.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveTask = async (data: {
    title: string;
    description: string;
    status: TaskStatus;
    due_date: Date | null;
    client_id: string | null;
  }) => {
    if (!user) return;
    setSaving(true);

    try {
      if (selectedTask) {
        const { error } = await supabase
          .from("tasks")
          .update({
            title: data.title,
            description: data.description || null,
            status: data.status,
            due_date: data.due_date ? format(data.due_date, "yyyy-MM-dd") : null,
            client_id: data.client_id,
          })
          .eq("id", selectedTask.id)
          .eq("user_id", user.id);

        if (error) throw error;

        toast({
          title: t("tasks.updated"),
          description: t("tasks.updatedDesc"),
        });
      } else {
        const { error } = await supabase.from("tasks").insert({
          user_id: user.id,
          title: data.title,
          description: data.description || null,
          status: data.status,
          due_date: data.due_date ? format(data.due_date, "yyyy-MM-dd") : null,
          client_id: data.client_id,
        });

        if (error) throw error;

        toast({
          title: t("tasks.created"),
          description: t("tasks.createdDesc"),
        });
      }

      setDialogOpen(false);
      setSelectedTask(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: t("tasks.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!user || !selectedTask) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", selectedTask.id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: t("tasks.deleted"),
        description: t("tasks.deletedDesc"),
      });

      setDeleteDialogOpen(false);
      setSelectedTask(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: t("tasks.error"),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId)
        .eq("user_id", user.id);

      if (error) throw error;

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (error: any) {
      toast({
        title: t("tasks.error"),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getClientById = (id: string | null) => clients.find((c) => c.id === id);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesClient = clientFilter === "all" || task.client_id === clientFilter;
    return matchesSearch && matchesStatus && matchesClient;
  });

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
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8 tempora-animate-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t("tasks.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("tasks.subtitle")}
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedTask(null);
              setDialogOpen(true);
            }}
            className="btn-gradient rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("tasks.new")}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("tasks.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | "all")}>
            <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder={t("tasks.filterStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("tasks.allStatuses")}</SelectItem>
              <SelectItem value="todo">{t("tasks.status.todo")}</SelectItem>
              <SelectItem value="in_progress">{t("tasks.status.inProgress")}</SelectItem>
              <SelectItem value="completed">{t("tasks.status.completed")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
              <SelectValue placeholder={t("tasks.filterClient")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("tasks.allClients")}</SelectItem>
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
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
              <ListTodo className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("tasks.empty")}</h3>
            <p className="text-muted-foreground mb-4">{t("tasks.emptyDesc")}</p>
            <Button
              onClick={() => {
                setSelectedTask(null);
                setDialogOpen(true);
              }}
              className="btn-gradient rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("tasks.createFirst")}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const StatusIcon = statusConfig[task.status].icon;
              const client = getClientById(task.client_id);
              const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== "completed";
              const isDueToday = task.due_date && isToday(new Date(task.due_date));

              return (
                <div
                  key={task.id}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border bg-card p-4 sm:p-5 transition-all hover:shadow-lg hover:border-primary/20",
                    task.status === "completed" && "opacity-60"
                  )}
                >
                  {/* Client color accent */}
                  {client && (
                    <div
                      className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
                      style={{ backgroundColor: client.color }}
                    />
                  )}

                  <div className="flex items-start gap-4">
                    {/* Status button */}
                    <button
                      onClick={() => {
                        const nextStatus: Record<TaskStatus, TaskStatus> = {
                          todo: "in_progress",
                          in_progress: "completed",
                          completed: "todo",
                        };
                        handleStatusChange(task.id, nextStatus[task.status]);
                      }}
                      className={cn(
                        "mt-0.5 p-1 rounded-lg transition-colors hover:bg-muted",
                        statusConfig[task.status].color
                      )}
                    >
                      <StatusIcon className="w-5 h-5" />
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3
                            className={cn(
                              "font-semibold text-base sm:text-lg truncate",
                              task.status === "completed" && "line-through"
                            )}
                          >
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTask(task);
                                setDialogOpen(true);
                              }}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              {t("tasks.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTask(task);
                                setLinkDialogOpen(true);
                              }}
                            >
                              <Link2 className="w-4 h-4 mr-2" />
                              {t("tasks.linkHours")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTask(task);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t("tasks.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
                        {client && (
                          <Badge variant="secondary" className="text-xs">
                            <div
                              className="w-2 h-2 rounded-full mr-1.5"
                              style={{ backgroundColor: client.color }}
                            />
                            {client.name}
                          </Badge>
                        )}
                        {task.due_date && (
                          <Badge
                            variant={isOverdue ? "destructive" : isDueToday ? "default" : "outline"}
                            className="text-xs"
                          >
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(task.due_date), "d MMM", { locale: getLocale() })}
                          </Badge>
                        )}
                        {task.total_seconds > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDuration(task.total_seconds)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={selectedTask}
        clients={clients}
        onSave={handleSaveTask}
        saving={saving}
      />

      <DeleteTaskDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        taskTitle={selectedTask?.title || ""}
        onConfirm={handleDeleteTask}
      />

      {selectedTask && (
        <LinkTimeEntriesDialog
          open={linkDialogOpen}
          onOpenChange={setLinkDialogOpen}
          taskId={selectedTask.id}
          taskTitle={selectedTask.title}
          onLinked={fetchData}
        />
      )}
    </DashboardLayout>
  );
}
