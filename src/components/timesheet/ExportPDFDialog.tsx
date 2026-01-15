import { useState, useMemo } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Loader2, Clock, User, Calendar, Building2 } from "lucide-react";
import { exportToPDF } from "@/lib/export-timesheet";
import { toast } from "@/hooks/use-toast";

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

interface ExportPDFDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: TimeEntry[];
  clients: Client[];
  dateRange: { start: Date; end: Date };
  userName: string;
  logoUrl?: string | null;
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

export function ExportPDFDialog({
  open,
  onOpenChange,
  entries,
  clients,
  dateRange,
  userName,
  logoUrl,
}: ExportPDFDialogProps) {
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [exporting, setExporting] = useState(false);

  const filteredEntries = useMemo(() => {
    if (selectedClientId === "all") return entries;
    return entries.filter((e) => e.client_id === selectedClientId);
  }, [entries, selectedClientId]);

  const totalSeconds = useMemo(() => {
    return filteredEntries.reduce((acc, e) => acc + (e.duration_seconds || 0), 0);
  }, [filteredEntries]);

  const selectedClient = useMemo(() => {
    if (selectedClientId === "all") return null;
    return clients.find((c) => c.id === selectedClientId) || null;
  }, [selectedClientId, clients]);

  const getClientName = (clientId: string | null) =>
    clients.find((c) => c.id === clientId)?.name || "Senza cliente";

  const handleExport = async () => {
    if (filteredEntries.length === 0) {
      toast({
        title: "Nessun dato",
        description: "Non ci sono registrazioni da esportare.",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);

    try {
      await exportToPDF({
        entries,
        clients,
        dateRange,
        userName,
        logoUrl,
        selectedClientId,
      });

      toast({
        title: "PDF esportato",
        description: "Il file è stato scaricato con successo.",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'esportazione.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Esporta PDF
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Client selector */}
          <div className="space-y-2">
            <Label>Filtra per cliente</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i clienti</SelectItem>
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

          <Separator />

          {/* Preview header */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Anteprima documento</h3>
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-8 w-auto object-contain"
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{userName}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  {format(dateRange.start, "d MMM", { locale: it })} -{" "}
                  {format(dateRange.end, "d MMM yyyy", { locale: it })}
                </span>
              </div>
              {selectedClient && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span>{selectedClient.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-semibold">{formatDuration(totalSeconds)}</span>
              </div>
            </div>
          </div>

          {/* Preview entries */}
          <div className="flex-1 min-h-0">
            <Label className="mb-2 block">
              Registrazioni ({filteredEntries.length})
            </Label>
            <ScrollArea className="h-[200px] border rounded-lg">
              {filteredEntries.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Nessuna registrazione nel periodo selezionato
                </div>
              ) : (
                <div className="divide-y">
                  {filteredEntries.map((entry) => {
                    const entryDate = new Date(entry.date);
                    return (
                      <div
                        key={entry.id}
                        className="p-3 flex items-center gap-3 hover:bg-muted/50"
                      >
                        <div className="text-xs text-muted-foreground w-20 flex-shrink-0">
                          {format(entryDate, "dd/MM")}
                        </div>
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor:
                              clients.find((c) => c.id === entry.client_id)?.color ||
                              "#94a3b8",
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {getClientName(entry.client_id)}
                          </div>
                          {entry.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {entry.description}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimeOfDay(entry.start_time)}
                          {entry.end_time && ` - ${formatTimeOfDay(entry.end_time)}`}
                        </div>
                        <div className="text-sm font-medium w-16 text-right">
                          {formatDuration(entry.duration_seconds || 0)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting || filteredEntries.length === 0}
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Esportazione...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Esporta PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
