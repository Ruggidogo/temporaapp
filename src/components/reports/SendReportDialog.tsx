import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Send, Loader2, Calendar, User, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from "date-fns";
import { it } from "date-fns/locale";

interface Client {
  id: string;
  name: string;
  email: string | null;
  color: string;
}

interface SendReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  defaultClientId?: string;
  defaultPeriod?: "today" | "yesterday" | "week" | "month" | "last7" | "last30";
  defaultDateFrom?: string;
  defaultDateTo?: string;
}

const periodOptions = [
  { label: "Oggi", value: "today" },
  { label: "Ieri", value: "yesterday" },
  { label: "Questa settimana", value: "week" },
  { label: "Questo mese", value: "month" },
  { label: "Ultimi 7 giorni", value: "last7" },
  { label: "Ultimi 30 giorni", value: "last30" },
];

export function SendReportDialog({
  open,
  onOpenChange,
  clients,
  defaultClientId,
  defaultPeriod = "week",
  defaultDateFrom,
  defaultDateTo,
}: SendReportDialogProps) {
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedClient, setSelectedClient] = useState(defaultClientId || "all");
  const [selectedPeriod, setSelectedPeriod] = useState(defaultPeriod);
  const [includePdf, setIncludePdf] = useState(true);

  const getDateRange = () => {
    const today = new Date();
    
    if (defaultDateFrom && defaultDateTo) {
      return { from: defaultDateFrom, to: defaultDateTo };
    }

    switch (selectedPeriod) {
      case "today":
        return { from: format(today, "yyyy-MM-dd"), to: format(today, "yyyy-MM-dd") };
      case "yesterday":
        const yesterday = subDays(today, 1);
        return { from: format(yesterday, "yyyy-MM-dd"), to: format(yesterday, "yyyy-MM-dd") };
      case "week":
        return { 
          from: format(startOfWeek(today, { locale: it }), "yyyy-MM-dd"), 
          to: format(endOfWeek(today, { locale: it }), "yyyy-MM-dd") 
        };
      case "month":
        return { 
          from: format(startOfMonth(today), "yyyy-MM-dd"), 
          to: format(endOfMonth(today), "yyyy-MM-dd") 
        };
      case "last7":
        return { from: format(subDays(today, 6), "yyyy-MM-dd"), to: format(today, "yyyy-MM-dd") };
      case "last30":
        return { from: format(subDays(today, 29), "yyyy-MM-dd"), to: format(today, "yyyy-MM-dd") };
      default:
        return { 
          from: format(startOfWeek(today, { locale: it }), "yyyy-MM-dd"), 
          to: format(endOfWeek(today, { locale: it }), "yyyy-MM-dd") 
        };
    }
  };

  // Auto-fill email when client is selected
  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId);
    if (clientId !== "all") {
      const client = clients.find(c => c.id === clientId);
      if (client?.email && !email) {
        setEmail(client.email);
        setRecipientName(client.name);
      }
    }
  };

  const handleSend = async () => {
    if (!email) {
      toast.error("Inserisci un indirizzo email");
      return;
    }

    setSending(true);
    const { from, to } = getDateRange();

    try {
      const { data, error } = await supabase.functions.invoke("send-report-email", {
        body: {
          recipientEmail: email,
          recipientName: recipientName || undefined,
          subject: subject || undefined,
          dateFrom: from,
          dateTo: to,
          clientId: selectedClient !== "all" ? selectedClient : undefined,
          includePdf,
        },
      });

      if (error) throw error;

      toast.success("Report inviato con successo!");
      onOpenChange(false);
      setEmail("");
      setRecipientName("");
      setSubject("");
    } catch (error: any) {
      console.error("Error sending report:", error);
      toast.error(error.message || "Errore nell'invio del report");
    } finally {
      setSending(false);
    }
  };

  const { from, to } = getDateRange();
  const periodLabel = `${format(new Date(from), "d MMM", { locale: it })} - ${format(new Date(to), "d MMM yyyy", { locale: it })}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/20">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Invia Report via Email</DialogTitle>
          </div>
          <DialogDescription>
            Invia un riepilogo delle ore lavorate direttamente via email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Period selector */}
          {!defaultDateFrom && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Periodo
              </Label>
              <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as typeof selectedPeriod)}>
                <SelectTrigger className="h-11 bg-muted/50 border-border/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{periodLabel}</p>
            </div>
          )}

          {/* Client filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <User className="w-4 h-4 text-muted-foreground" />
              Cliente (opzionale)
            </Label>
            <Select value={selectedClient} onValueChange={handleClientChange}>
              <SelectTrigger className="h-11 bg-muted/50 border-border/60">
                <SelectValue placeholder="Tutti i clienti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-purple-500" />
                    Tutti i clienti
                  </div>
                </SelectItem>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: client.color }} />
                      {client.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email destinatario *</Label>
            <Input
              id="email"
              type="email"
              placeholder="cliente@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 bg-muted/50 border-border/60"
            />
          </div>

          {/* Recipient name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Nome destinatario (opzionale)</Label>
            <Input
              id="name"
              placeholder="Mario Rossi"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="h-11 bg-muted/50 border-border/60"
            />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-medium">Oggetto (opzionale)</Label>
            <Input
              id="subject"
              placeholder={`Report ore: ${periodLabel}`}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-11 bg-muted/50 border-border/60"
            />
          </div>

          {/* PDF attachment toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div>
                <Label htmlFor="include-pdf" className="text-sm font-medium cursor-pointer">
                  Allega PDF
                </Label>
                <p className="text-xs text-muted-foreground">
                  Includi il report in formato PDF
                </p>
              </div>
            </div>
            <Switch
              id="include-pdf"
              checked={includePdf}
              onCheckedChange={setIncludePdf}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Annulla
          </Button>
          <Button onClick={handleSend} disabled={sending} className="btn-gradient">
            {sending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Invia Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
