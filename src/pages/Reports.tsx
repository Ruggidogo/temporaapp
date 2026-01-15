import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  TrendingUp, 
  Users,
  DollarSign,
  Download,
  Mail,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  PieChartIcon
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { cn } from "@/lib/utils";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart,
  Area,
  CartesianGrid
} from "recharts";

const periodOptions = [
  { label: "Oggi", value: "today" },
  { label: "Settimana", value: "week" },
  { label: "Mese", value: "month" },
  { label: "Anno", value: "year" },
];

const mockStats = {
  totalHours: 142.5,
  avgHoursPerDay: 7.2,
  topClient: "Acme Corp",
  totalValue: 10687.5,
  hoursChange: 12.5,
  valueChange: 8.3,
};

const clientData = [
  { name: "Acme Corp", hours: 56, color: "#8B5CF6", percentage: 39 },
  { name: "TechStart", hours: 38, color: "#3B82F6", percentage: 27 },
  { name: "Design Studio", hours: 32, color: "#EC4899", percentage: 22 },
  { name: "GreenTech", hours: 16.5, color: "#10B981", percentage: 12 },
];

const weeklyData = [
  { day: "Lun", hours: 8.5, target: 8 },
  { day: "Mar", hours: 7.2, target: 8 },
  { day: "Mer", hours: 9.1, target: 8 },
  { day: "Gio", hours: 6.8, target: 8 },
  { day: "Ven", hours: 8.0, target: 8 },
  { day: "Sab", hours: 2.5, target: 4 },
  { day: "Dom", hours: 0, target: 0 },
];

const monthlyTrend = [
  { week: "Sett 1", hours: 38 },
  { week: "Sett 2", hours: 42 },
  { week: "Sett 3", hours: 35 },
  { week: "Sett 4", hours: 48 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl p-3 shadow-xl">
        <p className="font-medium text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value}h</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl p-3 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
          <p className="font-medium text-sm">{data.name}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{data.hours}h</span> ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [hoveredClient, setHoveredClient] = useState<string | null>(null);

  const statCards = [
    {
      title: "Ore totali",
      value: `${mockStats.totalHours}h`,
      change: mockStats.hoursChange,
      icon: Clock,
      gradient: "from-primary to-purple-500",
      shadowColor: "shadow-primary/20",
    },
    {
      title: "Media/giorno",
      value: `${mockStats.avgHoursPerDay}h`,
      change: 5.2,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-500",
      shadowColor: "shadow-emerald-500/20",
    },
    {
      title: "Cliente top",
      value: mockStats.topClient,
      subtitle: "56 ore",
      icon: Users,
      gradient: "from-violet-500 to-purple-600",
      shadowColor: "shadow-violet-500/20",
    },
    {
      title: "Valore generato",
      value: `€${mockStats.totalValue.toLocaleString()}`,
      change: mockStats.valueChange,
      icon: DollarSign,
      gradient: "from-amber-500 to-orange-500",
      shadowColor: "shadow-amber-500/20",
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Report</h1>
            </div>
            <p className="text-muted-foreground">Analizza dove va il tuo tempo e massimizza la produttività</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              Esporta
            </Button>
            <Button 
              variant="outline"
              className="border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
            >
              <Mail className="w-4 h-4 mr-2" />
              Invia report
            </Button>
          </div>
        </div>

        {/* Period selector */}
        <div className="relative mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/10 to-primary/20 rounded-2xl blur-lg opacity-30" />
          <div className="relative flex gap-2 p-1.5 bg-muted/50 backdrop-blur-sm rounded-xl border border-border/50 w-fit">
            {periodOptions.map((period) => (
              <Button
                key={period.value}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPeriod(period.value)}
                className={cn(
                  "transition-all duration-300 rounded-lg",
                  selectedPeriod === period.value 
                    ? "bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg shadow-primary/30 hover:from-primary hover:to-purple-500" 
                    : "hover:bg-muted"
                )}
              >
                <Calendar className={cn("w-4 h-4 mr-2", selectedPeriod === period.value ? "text-white" : "text-muted-foreground")} />
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <div 
              key={stat.title} 
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn("absolute -inset-0.5 bg-gradient-to-r rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500", stat.gradient)} />
              <div className="relative p-5 rounded-xl border border-border/50 bg-gradient-to-b from-card to-card/80 backdrop-blur-sm hover:border-border transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("p-3 rounded-xl bg-gradient-to-r shadow-lg", stat.gradient, stat.shadowColor)}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  {stat.change !== undefined && (
                    <div className={cn(
                      "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                      stat.change >= 0 
                        ? "bg-success/10 text-success" 
                        : "bg-destructive/10 text-destructive"
                    )}>
                      {stat.change >= 0 ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {Math.abs(stat.change)}%
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold mb-1 truncate">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly bar chart */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative p-6 rounded-xl border border-border/50 bg-gradient-to-b from-card to-card/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Ore per giorno</h3>
                  <p className="text-sm text-muted-foreground">Confronto con il target giornaliero</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-purple-500" />
                    <span className="text-muted-foreground">Ore lavorate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted" />
                    <span className="text-muted-foreground">Target</span>
                  </div>
                </div>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} barGap={8}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="hsl(var(--border))" 
                      vertical={false}
                    />
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
                      tickFormatter={(value) => `${value}h`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                    <Bar 
                      dataKey="target" 
                      fill="hsl(var(--muted))" 
                      radius={[6, 6, 0, 0]}
                      name="Target"
                    />
                    <Bar 
                      dataKey="hours" 
                      fill="url(#barGradient)" 
                      radius={[6, 6, 0, 0]}
                      name="Ore"
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="#A855F7" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Client pie chart */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative p-6 rounded-xl border border-border/50 bg-gradient-to-b from-card to-card/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Distribuzione clienti</h3>
                  <p className="text-sm text-muted-foreground">Ore lavorate per cliente</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <PieChartIcon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="h-[280px] flex items-center">
                <ResponsiveContainer width="55%" height="100%">
                  <PieChart>
                    <Pie
                      data={clientData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="hours"
                      onMouseEnter={(_, index) => setHoveredClient(clientData[index].name)}
                      onMouseLeave={() => setHoveredClient(null)}
                    >
                      {clientData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="transparent"
                          style={{
                            filter: hoveredClient === entry.name ? 'brightness(1.2)' : 'none',
                            transform: hoveredClient === entry.name ? 'scale(1.05)' : 'scale(1)',
                            transformOrigin: 'center',
                            transition: 'all 0.3s ease',
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    {/* Center text */}
                    <text x="50%" y="45%" textAnchor="middle" className="fill-foreground font-bold text-2xl">
                      {mockStats.totalHours}h
                    </text>
                    <text x="50%" y="58%" textAnchor="middle" className="fill-muted-foreground text-xs">
                      Totale
                    </text>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {clientData.map((client) => (
                    <div 
                      key={client.name} 
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg transition-all duration-300 cursor-pointer",
                        hoveredClient === client.name ? "bg-muted/50" : "hover:bg-muted/30"
                      )}
                      onMouseEnter={() => setHoveredClient(client.name)}
                      onMouseLeave={() => setHoveredClient(null)}
                    >
                      <div 
                        className="w-4 h-4 rounded-lg shadow-md" 
                        style={{ 
                          backgroundColor: client.color,
                          boxShadow: `0 4px 12px -2px ${client.color}40`
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{client.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">{client.hours}h</p>
                          <span className="text-xs text-muted-foreground">•</span>
                          <p className="text-xs font-medium" style={{ color: client.color }}>{client.percentage}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly trend chart */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
          <div className="relative p-6 rounded-xl border border-border/50 bg-gradient-to-b from-card to-card/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">Trend mensile</h3>
                <p className="text-sm text-muted-foreground">Andamento delle ore lavorate nel mese</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
                <Sparkles className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-success">+12% vs mese scorso</span>
              </div>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="hsl(var(--border))" 
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="week" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `${value}h`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    fill="url(#areaGradient)"
                    name="Ore"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
