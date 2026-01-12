import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Clock, 
  TrendingUp, 
  Users,
  DollarSign,
  Download,
  Mail
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

const periodOptions = ["Oggi", "Settimana", "Mese", "Anno"];

const mockStats = {
  totalHours: 142.5,
  avgHoursPerDay: 7.2,
  topClient: "Acme Corp",
  totalValue: 10687.5,
};

const clientData = [
  { name: "Acme Corp", hours: 56, color: "hsl(270, 85%, 60%)" },
  { name: "TechStart", hours: 38, color: "hsl(220, 85%, 58%)" },
  { name: "Design Studio", hours: 32, color: "hsl(330, 80%, 60%)" },
  { name: "GreenTech", hours: 16.5, color: "hsl(160, 70%, 42%)" },
];

const weeklyData = [
  { day: "Lun", hours: 8.5 },
  { day: "Mar", hours: 7.2 },
  { day: "Mer", hours: 9.1 },
  { day: "Gio", hours: 6.8 },
  { day: "Ven", hours: 8.0 },
  { day: "Sab", hours: 2.5 },
  { day: "Dom", hours: 0 },
];

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("Mese");

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Report</h1>
            <p className="text-muted-foreground">Analizza dove va il tuo tempo</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Esporta
            </Button>
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Invia report
            </Button>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex gap-2 mb-8 p-1 bg-muted rounded-lg w-fit">
          {periodOptions.map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className={cn(
                "transition-all",
                selectedPeriod === period && "shadow-sm"
              )}
            >
              {period}
            </Button>
          ))}
        </div>

        {/* Stats cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockStats.totalHours}h</p>
                  <p className="text-sm text-muted-foreground">Ore totali</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockStats.avgHoursPerDay}h</p>
                  <p className="text-sm text-muted-foreground">Media/giorno</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-client-violet/10">
                  <Users className="w-5 h-5 text-client-violet" />
                </div>
                <div>
                  <p className="text-2xl font-bold truncate">{mockStats.topClient}</p>
                  <p className="text-sm text-muted-foreground">Cliente top</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <DollarSign className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">€{mockStats.totalValue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Valore generato</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weekly bar chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ore per giorno</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar 
                      dataKey="hours" 
                      fill="hsl(var(--primary))" 
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Client pie chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribuzione clienti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center">
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie
                      data={clientData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="hours"
                    >
                      {clientData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {clientData.map((client) => (
                    <div key={client.name} className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: client.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.hours}h</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
