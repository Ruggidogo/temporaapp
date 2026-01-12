import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search,
  Clock,
  TrendingUp,
  MoreVertical
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { cn } from "@/lib/utils";

const mockClients = [
  { 
    id: "1", 
    name: "Acme Corp", 
    color: "violet", 
    totalHours: 156.5,
    lastActivity: "Oggi",
    email: "contact@acme.com",
    hourlyRate: 75
  },
  { 
    id: "2", 
    name: "TechStart", 
    color: "blue", 
    totalHours: 89.25,
    lastActivity: "Ieri",
    email: "hello@techstart.io",
    hourlyRate: 60
  },
  { 
    id: "3", 
    name: "Design Studio", 
    color: "pink", 
    totalHours: 234.0,
    lastActivity: "3 giorni fa",
    email: "info@designstudio.it",
    hourlyRate: 85
  },
  { 
    id: "4", 
    name: "GreenTech", 
    color: "emerald", 
    totalHours: 45.75,
    lastActivity: "1 settimana fa",
    email: "support@greentech.com",
    hourlyRate: 70
  },
];

const colorClasses: Record<string, string> = {
  violet: "bg-client-violet",
  blue: "bg-client-blue",
  pink: "bg-client-pink",
  emerald: "bg-client-emerald",
  orange: "bg-client-orange",
  amber: "bg-client-amber",
};

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = mockClients.filter((client) =>
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
          <Button>
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

        {/* Clients grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} variant="interactive" className="group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold text-white",
                      colorClasses[client.color]
                    )}>
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{client.name}</h3>
                      <p className="text-xs text-muted-foreground">{client.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{client.totalHours}h</p>
                      <p className="text-xs text-muted-foreground">Totale ore</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">€{client.hourlyRate}/h</p>
                      <p className="text-xs text-muted-foreground">Tariffa</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Ultimo lavoro: <span className="text-foreground">{client.lastActivity}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add new client card */}
          <Card 
            variant="interactive" 
            className="border-dashed flex items-center justify-center min-h-[200px] cursor-pointer hover:border-primary/50"
          >
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Aggiungi cliente</p>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
