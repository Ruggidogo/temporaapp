import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { it, enUS, es, fr, de } from "date-fns/locale";

interface TimeEntry {
  id: string;
  description: string | null;
  duration_seconds: number | null;
  start_time: string;
  date: string;
  task_id: string | null;
  client_id: string | null;
}

interface LinkTimeEntriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  taskTitle: string;
  onLinked: () => void;
}

export function LinkTimeEntriesDialog({
  open,
  onOpenChange,
  taskId,
  taskTitle,
  onLinked,
}: LinkTimeEntriesDialogProps) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (open && user) {
      fetchEntries();
    }
  }, [open, user]);

  const fetchEntries = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("time_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("start_time", { ascending: false })
        .limit(50);

      if (error) throw error;

      setEntries(data || []);
      
      // Pre-select entries already linked to this task
      const linked = new Set(
        (data || []).filter((e) => e.task_id === taskId).map((e) => e.id)
      );
      setSelectedIds(linked);
    } catch (error: any) {
      toast({
        title: t("tasks.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const toggleEntry = (entryId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(entryId)) {
        next.delete(entryId);
      } else {
        next.add(entryId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Get current linked entries
      const currentlyLinked = entries.filter((e) => e.task_id === taskId).map((e) => e.id);
      const toLink = [...selectedIds].filter((id) => !currentlyLinked.includes(id));
      const toUnlink = currentlyLinked.filter((id) => !selectedIds.has(id));

      // Link new entries
      if (toLink.length > 0) {
        const { error } = await supabase
          .from("time_entries")
          .update({ task_id: taskId })
          .in("id", toLink)
          .eq("user_id", user.id);
        
        if (error) throw error;
      }

      // Unlink removed entries
      if (toUnlink.length > 0) {
        const { error } = await supabase
          .from("time_entries")
          .update({ task_id: null })
          .in("id", toUnlink)
          .eq("user_id", user.id);
        
        if (error) throw error;
      }

      toast({
        title: t("tasks.hoursLinked"),
        description: t("tasks.hoursLinkedDesc"),
      });

      onOpenChange(false);
      onLinked();
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

  const totalSelectedSeconds = entries
    .filter((e) => selectedIds.has(e.id))
    .reduce((acc, e) => acc + (e.duration_seconds || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("tasks.linkHoursTitle")}</DialogTitle>
          <DialogDescription>
            {t("tasks.linkHoursDesc").replace("{title}", taskTitle)}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("tasks.noEntriesToLink")}
          </div>
        ) : (
          <>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {entries.map((entry) => {
                  const isSelected = selectedIds.has(entry.id);
                  const isLinkedToOther = entry.task_id && entry.task_id !== taskId;

                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        isSelected
                          ? "border-primary/50 bg-primary/5"
                          : "border-border hover:border-primary/30"
                      } ${isLinkedToOther ? "opacity-50" : ""}`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleEntry(entry.id)}
                        disabled={isLinkedToOther}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {entry.description || t("tasks.noDescription")}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {format(new Date(entry.date), "d MMM yyyy", {
                              locale: getLocale(),
                            })}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDuration(entry.duration_seconds)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {t("tasks.totalSelected")}: <strong>{formatDuration(totalSelectedSeconds)}</strong>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="rounded-xl"
                >
                  {t("tasks.cancel")}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-gradient rounded-xl"
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t("tasks.saveLinks")}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
