import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  CheckCircle2,
  Clock,
  Circle,
  Calendar,
  ListTodo,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
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
  total_seconds: number;
}

interface ClientTasksSectionProps {
  clientId: string;
}

const statusConfig: Record<TaskStatus, { icon: typeof Circle; color: string }> = {
  todo: { icon: Circle, color: "text-muted-foreground" },
  in_progress: { icon: Clock, color: "text-warning" },
  completed: { icon: CheckCircle2, color: "text-success" },
};

export function ClientTasksSection({ clientId }: ClientTasksSectionProps) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const getLocale = () => {
    switch (language) {
      case "it": return it;
      case "es": return es;
      case "fr": return fr;
      case "de": return de;
      default: return enUS;
    }
  };

  useEffect(() => {
    if (user && clientId) {
      fetchTasks();
    }
  }, [user, clientId]);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      const [tasksRes, entriesRes] = await Promise.all([
        supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .eq("client_id", clientId)
          .order("created_at", { ascending: false }),
        supabase
          .from("time_entries")
          .select("task_id, duration_seconds")
          .eq("user_id", user.id)
          .eq("client_id", clientId)
          .not("task_id", "is", null),
      ]);

      if (tasksRes.error) throw tasksRes.error;
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
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="card-premium p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="space-y-3">
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-premium p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
        <div className="flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-primary flex-shrink-0" />
          <h3 className="font-semibold text-base sm:text-lg">{t("clientDetail.tasks")}</h3>
          {tasks.length > 0 && (
            <Badge variant="secondary" className="ml-1 sm:ml-2">
              {tasks.length}
            </Badge>
          )}
        </div>
        <Link to="/tasks">
          <Button variant="ghost" size="sm" className="text-primary w-full sm:w-auto">
            {t("clientDetail.viewAllTasks")}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted/50 flex items-center justify-center">
            <ListTodo className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {t("clientDetail.noTasks")}
          </p>
          <Link to="/tasks">
            <Button variant="outline" size="sm" className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              {t("clientDetail.createTask")}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.slice(0, 5).map((task) => {
            const StatusIcon = statusConfig[task.status].icon;
            const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== "completed";
            const isDueToday = task.due_date && isToday(new Date(task.due_date));

            return (
              <div
                key={task.id}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-xl border bg-card/50 hover:bg-card transition-colors",
                  task.status === "completed" && "opacity-60"
                )}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <StatusIcon className={cn("w-4 h-4 flex-shrink-0", statusConfig[task.status].color)} />
                  <p className={cn(
                    "font-medium text-sm truncate",
                    task.status === "completed" && "line-through"
                  )}>
                    {task.title}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-6 sm:ml-0">
                  {task.due_date && (
                    <Badge
                      variant={isOverdue ? "destructive" : isDueToday ? "default" : "outline"}
                      className="text-[10px] sm:text-xs"
                    >
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(new Date(task.due_date), "d MMM", { locale: getLocale() })}
                    </Badge>
                  )}
                  {task.total_seconds > 0 && (
                    <Badge variant="outline" className="text-[10px] sm:text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDuration(task.total_seconds)}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}

          {tasks.length > 5 && (
            <Link to="/tasks" className="block">
              <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
                {t("clientDetail.viewMore")} ({tasks.length - 5})
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}