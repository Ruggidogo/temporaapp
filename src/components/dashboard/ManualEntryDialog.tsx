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

interface ManualEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    date: Date;
    startTime: string;
    endTime: string;
    clientId: string | null;
    description: string;
  }) => void;
  clients: Client[];
  isLoading?: boolean;
}

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export function ManualEntryDialog({
  open,
  onOpenChange,
  onSubmit,
  clients,
  isLoading,
}: ManualEntryDialogProps) {
  const { language, t } = useLanguage();
  const locale = dateLocales[language] || enUS;

  const entrySchema = z.object({
    date: z.date(),
    startTime: z.string().regex(timeRegex, t("manualEntry.invalidTimeFormat")),
    endTime: z.string().regex(timeRegex, t("manualEntry.invalidTimeFormat")),
    clientId: z.string().nullable(),
    description: z.string().max(500).optional(),
  }).refine((data) => {
    const [startH, startM] = data.startTime.split(":").map(Number);
    const [endH, endM] = data.endTime.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return endMinutes > startMinutes;
  }, {
    message: t("manualEntry.endAfterStart"),
    path: ["endTime"],
  });

  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [clientId, setClientId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setDate(new Date());
      setStartTime("09:00");
      setEndTime("10:00");
      setClientId(clients.length > 0 ? clients[0].id : null);
      setDescription("");
      setErrors({});
    }
  }, [open, clients]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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

    onSubmit(data);
  };

  // Calculate duration preview
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
          <DialogTitle>{t("manualEntry.title")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date picker */}
          <div className="space-y-2">
            <Label>{t("manualEntry.date")}</Label>
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
                  {date ? format(date, "PPP", { locale }) : t("manualEntry.selectDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  disabled={(d) => d > new Date()}
                  initialFocus
                  locale={locale}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">{t("manualEntry.start")}</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              {errors.startTime && (
                <p className="text-sm text-destructive">{errors.startTime}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">{t("manualEntry.end")}</Label>
              <Input
                id="endTime"
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
              {t("manualEntry.duration")} <span className="font-medium text-foreground">{durationPreview}</span>
            </div>
          )}

          {/* Client selector */}
          <div className="space-y-2">
            <Label>{t("manualEntry.client")}</Label>
            <Select
              value={clientId || "none"}
              onValueChange={(v) => setClientId(v === "none" ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("manualEntry.selectClient")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("manualEntry.noClient")}</SelectItem>
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
            <Label htmlFor="description">{t("manualEntry.description")}</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("manualEntry.descriptionPlaceholder")}
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
              {t("manualEntry.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("manualEntry.saving") : t("manualEntry.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
