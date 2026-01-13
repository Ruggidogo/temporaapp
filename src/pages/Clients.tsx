import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search,
  Clock,
  TrendingUp,
  MoreVertical,
  Pencil,
  Trash2
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
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const fetchClients = async () => {
    try {
      // Fetch clients with total hours from time_entries
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("*")
        .order("name");

      if (clientsError) throw clientsError;

      // Fetch total hours per client
      const { data: entriesData, error: entriesError } = await supabase
        .from("time_entries")
        .select("client_id, duration_seconds");

      if (entriesError) throw entriesError;

      // Calculate total hours per client
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

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Clienti</h1>
            <p className="text-muted-foreground">Gestisci i tuoi clienti e progetti</p>
          </div>
          <Button onClick={() => { setSelectedClient(null); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Nuovo cliente
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-sm"
          />
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12 text-muted-foreground">
            Caricamento clienti...
          </div>
        )}

        {/* Empty state */}
        {!loading && clients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Non hai ancora clienti</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crea il primo cliente
            </Button>
          </div>
        )}

        {/* Clients grid */}
        {!loading && clients.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id} variant="interactive" className="group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold text-white"
                        style={{ backgroundColor: client.color }}
                      >
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold">{client.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {client.email || "Nessuna email"}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(client)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Modifica
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(client)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {client.total_hours?.toFixed(1) || "0"}h
                        </p>
                        <p className="text-xs text-muted-foreground">Totale ore</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {client.hourly_rate ? `€${client.hourly_rate}/h` : "-"}
                        </p>
                        <p className="text-xs text-muted-foreground">Tariffa</p>
                      </div>
                    </div>
                  </div>

                  {client.notes && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {client.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Add new client card */}
            <Card
              variant="interactive"
              className="border-dashed flex items-center justify-center min-h-[200px] cursor-pointer hover:border-primary/50"
              onClick={() => { setSelectedClient(null); setDialogOpen(true); }}
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Aggiungi cliente</p>
              </div>
            </Card>
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
    </DashboardLayout>
  );
}
