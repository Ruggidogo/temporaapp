import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search,
  Clock,
  TrendingUp,
  MoreVertical,
  Pencil,
  Trash2,
  Users,
  Loader2,
  Mail
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ClientDialog, ClientFormData } from "@/components/clients/ClientDialog";
import { DeleteClientDialog } from "@/components/clients/DeleteClientDialog";
import { SendReportDialog } from "@/components/reports/SendReportDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  email: string | null;
  color: string;
  hourly_rate: number | null;
  notes: string | null;
  total_hours?: number;
}

export default function Clients() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [reportClientId, setReportClientId] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const fetchClients = async () => {
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("*")
        .order("name");

      if (clientsError) throw clientsError;

      const { data: entriesData, error: entriesError } = await supabase
        .from("time_entries")
        .select("client_id, duration_seconds");

      if (entriesError) throw entriesError;

      const hoursMap: Record<string, number> = {};
      entriesData?.forEach((entry) => {
        if (entry.client_id && entry.duration_seconds) {
          hoursMap[entry.client_id] = (hoursMap[entry.client_id] || 0) + entry.duration_seconds;
        }
      });

      const clientsWithHours = (clientsData || []).map((client) => ({
        ...client,
        total_hours: hoursMap[client.id] ? hoursMap[client.id] / 3600 : 0,
      }));

      setClients(clientsWithHours);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Errore nel caricamento dei clienti");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: ClientFormData) => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase.from("clients").insert({
        user_id: user.id,
        name: data.name,
        email: data.email || null,
        hourly_rate: data.hourly_rate,
        notes: data.notes || null,
        color: data.color,
      });

      if (error) throw error;

      toast.success("Cliente creato");
      setDialogOpen(false);
      fetchClients();
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error("Errore nella creazione del cliente");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data: ClientFormData) => {
    if (!selectedClient) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("clients")
        .update({
          name: data.name,
          email: data.email || null,
          hourly_rate: data.hourly_rate,
          notes: data.notes || null,
          color: data.color,
        })
        .eq("id", selectedClient.id);

      if (error) throw error;

      toast.success("Cliente aggiornato");
      setDialogOpen(false);
      setSelectedClient(null);
      fetchClients();
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Errore nell'aggiornamento del cliente");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClient) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", selectedClient.id);

      if (error) throw error;

      toast.success("Cliente eliminato");
      setDeleteDialogOpen(false);
      setSelectedClient(null);
      fetchClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Errore nell'eliminazione del cliente");
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (client: Client) => {
    setSelectedClient(client);
    setDialogOpen(true);
  };

  const openDeleteDialog = (client: Client) => {
    setSelectedClient(client);
    setDeleteDialogOpen(true);
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="p-6 lg:p-8 max-w-6xl mx-auto tempora-animate-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clienti</h1>
            <p className="text-muted-foreground mt-1">Gestisci i tuoi clienti e progetti</p>
          </div>
          <Button 
            onClick={() => { setSelectedClient(null); setDialogOpen(true); }}
            className="btn-gradient rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuovo cliente
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 max-w-sm rounded-xl h-12 bg-card/50 border-border/60"
          />
        </div>

        {/* Empty state */}
        {clients.length === 0 && (
          <div className="card-premium text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg font-medium mb-2">Non hai ancora clienti</p>
            <p className="text-sm text-muted-foreground mb-6">Crea il tuo primo cliente per iniziare</p>
            <Button onClick={() => setDialogOpen(true)} className="btn-gradient rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Crea il primo cliente
            </Button>
          </div>
        )}

        {/* Clients grid */}
        {clients.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {filteredClients.map((client) => (
              <div key={client.id} className="card-premium group hover-lift p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white shadow-lg"
                      style={{ 
                        background: `linear-gradient(135deg, ${client.color}, ${client.color}cc)`,
                        boxShadow: `0 8px 24px -4px ${client.color}40`
                      }}
                    >
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{client.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {client.email || "Nessuna email"}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => openEditDialog(client)} className="rounded-lg">
                        <Pencil className="w-4 h-4 mr-2" />
                        Modifica
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setReportClientId(client.id);
                          setReportDialogOpen(true);
                        }}
                        className="rounded-lg"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Invia report
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(client)}
                        className="text-destructive focus:text-destructive rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Elimina
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        {client.total_hours?.toFixed(1) || "0"}h
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Ore totali</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        {client.hourly_rate ? `€${client.hourly_rate}` : "-"}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Tariffa/h</p>
                    </div>
                  </div>
                </div>

                {client.notes && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {client.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Add new client card */}
            <div
              className="card-premium border-dashed border-2 flex items-center justify-center min-h-[220px] cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
              onClick={() => { setSelectedClient(null); setDialogOpen(true); }}
            >
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold">Aggiungi cliente</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <ClientDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedClient(null);
        }}
        onSubmit={selectedClient ? handleUpdate : handleCreate}
        initialData={
          selectedClient
            ? {
                name: selectedClient.name,
                email: selectedClient.email || "",
                hourly_rate: selectedClient.hourly_rate,
                notes: selectedClient.notes || "",
                color: selectedClient.color,
              }
            : undefined
        }
        isLoading={saving}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteClientDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setSelectedClient(null);
        }}
        onConfirm={handleDelete}
        clientName={selectedClient?.name || ""}
        isLoading={saving}
      />

      {/* Send Report Dialog */}
      <SendReportDialog
        open={reportDialogOpen}
        onOpenChange={(open) => {
          setReportDialogOpen(open);
          if (!open) setReportClientId(undefined);
        }}
        clients={clients}
        defaultClientId={reportClientId}
      />
    </DashboardLayout>
  );
}
