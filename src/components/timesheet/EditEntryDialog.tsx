import { useState, useEffect } from "react";
import { format, Locale } from "date-fns";
import { it, enUS, es, fr, de } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";

const dateLocales: Record<string, Locale> = { it, en: enUS, es, fr, de };

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

interface EditEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    id: string;
    date: Date;
    startTime: string;
    endTime: string;
    clientId: string | null;
    description: string;
  }) => void;
  entry: TimeEntry | null;
  clients: Client[];
  isLoading?: boolean;
}

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const entrySchema = z.object({
  date: z.date(),
  startTime: z.string().regex(timeRegex, "Formato orario non valido (HH:MM)"),
  endTime: z.string().regex(timeRegex, "Formato orario non valido (HH:MM)"),
  clientId: z.string().nullable(),
  description: z.string().max(500).optional(),
}).refine((data) => {
  const [startH, startM] = data.startTime.split(":").map(Number);
  const [endH, endM] = data.endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  return endMinutes > startMinutes;
}, {
  message: "L'orario di fine deve essere successivo all'orario di inizio",
  path: ["endTime"],
});

function formatTimeFromISO(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function EditEntryDialog({
  open,
  onOpenChange,
  onSubmit,
  entry,
  clients,
  isLoading,
}: EditEntryDialogProps) {
  const { language, t } = useLanguage();
  const locale = dateLocales[language] || enUS;

  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [clientId, setClientId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && entry) {
      setDate(new Date(entry.date));
      setStartTime(formatTimeFromISO(entry.start_time));
      setEndTime(entry.end_time ? formatTimeFromISO(entry.end_time) : "10:00");
      setClientId(entry.client_id);
      setDescription(entry.description || "");
      setErrors({});
    }
  }, [open, entry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!entry) return;

    const data = {
      date,
      startTime,
      endTime,
      clientId,
      description: description.trim(),
    };

    const result = entrySchema.safeParse(data);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    onSubmit({
      id: entry.id,
      ...data,
    });
  };

  const getDurationPreview = () => {
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) return null;
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const diff = endMinutes - startMinutes;
    if (diff <= 0) return null;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const durationPreview = getDurationPreview();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("editEntry.title")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date picker */}
          <div className="space-y-2">
            <Label>{t("editEntry.date")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale }) : t("editEntry.selectDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  disabled={(d) => d > new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editStartTime">{t("editEntry.start")}</Label>
              <Input
                id="editStartTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              {errors.startTime && (
                <p className="text-sm text-destructive">{errors.startTime}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEndTime">{t("editEntry.end")}</Label>
              <Input
                id="editEndTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
              {errors.endTime && (
                <p className="text-sm text-destructive">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Duration preview */}
          {durationPreview && (
            <div className="text-sm text-muted-foreground text-center">
              {t("editEntry.duration")}: <span className="font-medium text-foreground">{durationPreview}</span>
            </div>
          )}

          {/* Client selector */}
          <div className="space-y-2">
            <Label>{t("editEntry.client")}</Label>
            <Select
              value={clientId || "none"}
              onValueChange={(v) => setClientId(v === "none" ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("editEntry.selectClient")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("editEntry.noClient")}</SelectItem>
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="editDescription">{t("editEntry.description")}</Label>
            <Input
              id="editDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("editEntry.descriptionPlaceholder")}
              maxLength={500}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("editEntry.saving") : t("editEntry.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
