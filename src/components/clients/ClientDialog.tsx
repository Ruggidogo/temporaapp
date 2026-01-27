import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { z } from "zod";

export interface ClientFormData {
  name: string;
  email: string;
  hourly_rate: number | null;
  notes: string;
  color: string;
}

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ClientFormData) => void;
  initialData?: ClientFormData;
  isLoading?: boolean;
}

export function ClientDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: ClientDialogProps) {
  const { t } = useLanguage();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState("#8B5CF6");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const colorOptions = useMemo(() => [
    { value: "#8B5CF6", name: t("clientDialog.colorViolet") },
    { value: "#3B82F6", name: t("clientDialog.colorBlue") },
    { value: "#EC4899", name: t("clientDialog.colorPink") },
    { value: "#10B981", name: t("clientDialog.colorGreen") },
    { value: "#F97316", name: t("clientDialog.colorOrange") },
    { value: "#F59E0B", name: t("clientDialog.colorAmber") },
  ], [t]);

  const clientSchema = useMemo(() => z.object({
    name: z.string().trim().min(1, t("clientDialog.nameRequired")).max(100),
    email: z.string().trim().email(t("clientDialog.emailInvalid")).max(255).optional().or(z.literal("")),
    hourly_rate: z.number().min(0, t("clientDialog.hourlyRateInvalid")).optional(),
    notes: z.string().max(500).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, t("clientDialog.colorInvalid")),
  }), [t]);

  useEffect(() => {
    if (open && initialData) {
      setName(initialData.name);
      setEmail(initialData.email || "");
      setHourlyRate(initialData.hourly_rate?.toString() || "");
      setNotes(initialData.notes || "");
      setColor(initialData.color);
    } else if (open) {
      setName("");
      setEmail("");
      setHourlyRate("");
      setNotes("");
      setColor("#8B5CF6");
    }
    setErrors({});
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: name.trim(),
      email: email.trim() || undefined,
      hourly_rate: hourlyRate ? parseFloat(hourlyRate) : undefined,
      notes: notes.trim() || undefined,
      color,
    };

    const result = clientSchema.safeParse(data);
    
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
      name: data.name,
      email: data.email || "",
      hourly_rate: data.hourly_rate ?? null,
      notes: data.notes || "",
      color: data.color,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? t("clientDialog.titleEdit") : t("clientDialog.titleNew")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("clientDialog.nameLabel")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("clientDialog.namePlaceholder")}
              maxLength={100}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("clientDialog.emailLabel")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("clientDialog.emailPlaceholder")}
              maxLength={255}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourlyRate">{t("clientDialog.hourlyRateLabel")}</Label>
            <Input
              id="hourlyRate"
              type="number"
              min="0"
              step="0.01"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder={t("clientDialog.hourlyRatePlaceholder")}
            />
            {errors.hourly_rate && (
              <p className="text-sm text-destructive">{errors.hourly_rate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("clientDialog.colorLabel")}</Label>
            <div className="flex gap-2">
              {colorOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`w-8 h-8 rounded-lg transition-all ${
                    color === opt.value
                      ? "ring-2 ring-offset-2 ring-primary scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: opt.value }}
                  onClick={() => setColor(opt.value)}
                  title={opt.name}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("clientDialog.notesLabel")}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("clientDialog.notesPlaceholder")}
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("common.saving") : initialData ? t("common.save") : t("common.create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
