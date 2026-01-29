import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { it, enUS, es, fr, de } from "date-fns/locale";

type TaskStatus = "todo" | "in_progress" | "completed";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  client_id: string | null;
}

interface Client {
  id: string;
  name: string;
  color: string;
}

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  clients: Client[];
  onSave: (data: {
    title: string;
    description: string;
    status: TaskStatus;
    due_date: Date | null;
    client_id: string | null;
  }) => Promise<void>;
  saving: boolean;
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  clients,
  onSave,
  saving,
}: TaskDialogProps) {
  const { t, language } = useLanguage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [clientId, setClientId] = useState<string>("");

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
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
      setClientId(task.client_id || "");
    } else {
      setTitle("");
      setDescription("");
      setStatus("todo");
      setDueDate(undefined);
      setClientId("");
    }
  }, [task, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onSave({
      title: title.trim(),
      description: description.trim(),
      status,
      due_date: dueDate || null,
      client_id: clientId || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {task ? t("tasks.editTask") : t("tasks.newTask")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t("tasks.titleLabel")}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("tasks.titlePlaceholder")}
              className="rounded-xl"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("tasks.descriptionLabel")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("tasks.descriptionPlaceholder")}
              className="rounded-xl resize-none"
              rows={3}
            />
          </div>

          {/* Client */}
          <div className="space-y-2">
            <Label>{t("tasks.clientLabel")}</Label>
            <Select 
              value={clientId || "none"} 
              onValueChange={(v) => setClientId(v === "none" ? "" : v)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={t("tasks.selectClient")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("tasks.noClient")}</SelectItem>
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

          {/* Status */}
          <div className="space-y-2">
            <Label>{t("tasks.statusLabel")}</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">{t("tasks.status.todo")}</SelectItem>
                <SelectItem value="in_progress">{t("tasks.status.inProgress")}</SelectItem>
                <SelectItem value="completed">{t("tasks.status.completed")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>{t("tasks.dueDateLabel")}</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal rounded-xl",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate
                      ? format(dueDate, "PPP", { locale: getLocale() })
                      : t("tasks.selectDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    locale={getLocale()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {dueDate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDueDate(undefined)}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              {t("tasks.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={saving || !title.trim()}
              className="btn-gradient rounded-xl"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {task ? t("tasks.save") : t("tasks.create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
