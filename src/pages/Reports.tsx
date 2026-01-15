import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  Clock, 
  TrendingUp, 
  Users,
  DollarSign,
  Download,
  Mail,
  Calendar as CalendarIcon,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  PieChartIcon,
  Filter,
  X,
  ChevronDown
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SendReportDialog } from "@/components/reports/SendReportDialog";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from "date-fns";
import { it } from "date-fns/locale";
import { DateRange } from "react-day-picker";

interface Client {
  id: string;
  name: string;
  color: string;
  email: string | null;
  hourly_rate: number | null;
}

interface TimeEntry {
  id: string;
  client_id: string | null;
  duration_seconds: number | null;
  date: string;
  description: string | null;
}

const periodOptions = [
  { label: "Oggi", value: "today" },
  { label: "Settimana", value: "week" },
  { label: "Mese", value: "month" },
  { label: "Anno", value: "year" },
  { label: "Personalizzato", value: "custom" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl p-3 shadow-xl">
        <p className="font-medium text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}h</span>
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
          <span className="font-semibold text-foreground">{data.hours.toFixed(1)}h</span> ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

export default function Reports() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredClient, setHoveredClient] = useState<string | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  
  const [clients, setClients] = useState<Client[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      
      const [clientsRes, entriesRes] = await Promise.all([
        supabase.from('clients').select('*').eq('user_id', user.id),
        supabase.from('time_entries').select('*').eq('user_id', user.id)
      ]);

      if (clientsRes.data) setClients(clientsRes.data);
      if (entriesRes.data) setTimeEntries(entriesRes.data);
      
      setLoading(false);
    };

    fetchData();
  }, [user]);

  // Calculate date range based on period
  const getDateRange = () => {
    const today = new Date();
    
    if (selectedPeriod === "custom" && dateRange?.from) {
      return {
        start: dateRange.from,
        end: dateRange.to || dateRange.from
      };
    }

    switch (selectedPeriod) {
      case "today":
        return { start: today, end: today };
      case "week":
        return { start: startOfWeek(today, { locale: it }), end: endOfWeek(today, { locale: it }) };
      case "month":
        return { start: startOfMonth(today), end: endOfMonth(today) };
      case "year":
        return { start: startOfYear(today), end: endOfYear(today) };
      default:
        return { start: startOfMonth(today), end: endOfMonth(today) };
    }
  };

  // Filter entries
  const filteredEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    const { start, end } = getDateRange();
    
    const isInRange = isWithinInterval(entryDate, { start, end });
    const matchesClient = selectedClient === "all" || entry.client_id === selectedClient;
    
    return isInRange && matchesClient;
  });

  // Calculate stats
  const totalSeconds = filteredEntries.reduce((acc, entry) => acc + (entry.duration_seconds || 0), 0);
  const totalHours = totalSeconds / 3600;
  
  const { start, end } = getDateRange();
  const daysDiff = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const avgHoursPerDay = totalHours / daysDiff;

  // Calculate client distribution
  const clientStats = clients.map(client => {
    const clientEntries = filteredEntries.filter(e => e.client_id === client.id);
    const clientSeconds = clientEntries.reduce((acc, e) => acc + (e.duration_seconds || 0), 0);
    const hours = clientSeconds / 3600;
    const value = client.hourly_rate ? hours * client.hourly_rate : 0;
    return {
      ...client,
      hours,
      value,
      percentage: totalHours > 0 ? Math.round((hours / totalHours) * 100) : 0
    };
  }).filter(c => c.hours > 0).sort((a, b) => b.hours - a.hours);

  const topClient = clientStats[0];
  const totalValue = clientStats.reduce((acc, c) => acc + c.value, 0);

  // Weekly chart data
  const weekDays = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
  const weeklyData = weekDays.map((day, index) => {
    const dayEntries = filteredEntries.filter(e => {
      const entryDate = new Date(e.date);
      return entryDate.getDay() === (index + 1) % 7;
    });
    const hours = dayEntries.reduce((acc, e) => acc + (e.duration_seconds || 0), 0) / 3600;
    return { day, hours, target: index < 5 ? 8 : index === 5 ? 4 : 0 };
  });

  // Monthly trend data
  const monthlyTrend = [1, 2, 3, 4].map(week => {
    const weekStart = new Date(start);
    weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekEntries = filteredEntries.filter(e => {
      const entryDate = new Date(e.date);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });
    const hours = weekEntries.reduce((acc, e) => acc + (e.duration_seconds || 0), 0) / 3600;
    return { week: `Sett ${week}`, hours };
  });

  const activeFiltersCount = (selectedClient !== "all" ? 1 : 0) + (selectedPeriod === "custom" && dateRange?.from ? 1 : 0);

  const clearFilters = () => {
    setSelectedClient("all");
    setSelectedPeriod("month");
    setDateRange(undefined);
  };

  const statCards = [
    {
      title: "Ore totali",
      value: `${totalHours.toFixed(1)}h`,
      icon: Clock,
      gradient: "from-primary to-purple-500",
      shadowColor: "shadow-primary/20",
    },
    {
      title: "Media/giorno",
      value: `${avgHoursPerDay.toFixed(1)}h`,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-500",
      shadowColor: "shadow-emerald-500/20",
    },
    {
      title: "Cliente top",
      value: topClient?.name || "-",
      subtitle: topClient ? `${topClient.hours.toFixed(1)} ore` : undefined,
      icon: Users,
      gradient: "from-violet-500 to-purple-600",
      shadowColor: "shadow-violet-500/20",
    },
    {
      title: "Valore generato",
      value: `€${totalValue.toLocaleString('it-IT', { maximumFractionDigits: 0 })}`,
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
              onClick={() => setReportDialogOpen(true)}
            >
              <Mail className="w-4 h-4 mr-2" />
              Invia report
            </Button>
          </div>
        </div>

        {/* Filters section */}
        <div className="mb-8 space-y-4">
          {/* Period selector */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/10 to-primary/20 rounded-2xl blur-lg opacity-30" />
              <div className="relative flex gap-1 p-1.5 bg-muted/50 backdrop-blur-sm rounded-xl border border-border/50">
                {periodOptions.map((period) => (
                  <Button
                    key={period.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPeriod(period.value)}
                    className={cn(
                      "transition-all duration-300 rounded-lg px-4",
                      selectedPeriod === period.value 
                        ? "bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg shadow-primary/30 hover:from-primary hover:to-purple-500" 
                        : "hover:bg-muted"
                    )}
                  >
                    {period.label}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "border-border/50 transition-all",
                showFilters || activeFiltersCount > 0 ? "border-primary/50 bg-primary/5" : ""
              )}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtri
              {activeFiltersCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className={cn("w-4 h-4 ml-2 transition-transform", showFilters && "rotate-180")} />
            </Button>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Cancella filtri
              </Button>
            )}
          </div>

          {/* Advanced filters panel */}
          {showFilters && (
            <div className="relative animate-fade-in">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl blur opacity-50" />
              <div className="relative p-5 rounded-xl border border-border/50 bg-gradient-to-b from-card to-card/80 backdrop-blur-sm">
                <div className="flex flex-wrap gap-6">
                  {/* Client filter */}
                  <div className="space-y-2 min-w-[200px]">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      Cliente
                    </label>
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger className="h-11 bg-muted/50 border-border/50">
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

                  {/* Custom date range */}
                  {selectedPeriod === "custom" && (
                    <div className="space-y-2 min-w-[280px]">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        Periodo personalizzato
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-11 justify-start text-left font-normal bg-muted/50 border-border/50",
                              !dateRange && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                              dateRange.to ? (
                                <>
                                  {format(dateRange.from, "d MMM", { locale: it })} - {format(dateRange.to, "d MMM yyyy", { locale: it })}
                                </>
                              ) : (
                                format(dateRange.from, "d MMM yyyy", { locale: it })
                              )
                            ) : (
                              <span>Seleziona periodo</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                            locale={it}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>

                {/* Active filters summary */}
                {(selectedClient !== "all" || (selectedPeriod === "custom" && dateRange?.from)) && (
                  <div className="mt-4 pt-4 border-t border-border/30 flex flex-wrap gap-2">
                    {selectedClient !== "all" && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm">
                        <div 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: clients.find(c => c.id === selectedClient)?.color }} 
                        />
                        <span>{clients.find(c => c.id === selectedClient)?.name}</span>
                        <button onClick={() => setSelectedClient("all")} className="hover:text-primary">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    {selectedPeriod === "custom" && dateRange?.from && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span>
                          {format(dateRange.from, "d MMM", { locale: it })}
                          {dateRange.to && ` - ${format(dateRange.to, "d MMM", { locale: it })}`}
                        </span>
                        <button onClick={() => setDateRange(undefined)} className="hover:text-primary">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
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
                {clientStats.length > 0 ? (
                  <>
                    <ResponsiveContainer width="55%" height="100%">
                      <PieChart>
                        <Pie
                          data={clientStats}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="hours"
                          onMouseEnter={(_, index) => setHoveredClient(clientStats[index].name)}
                          onMouseLeave={() => setHoveredClient(null)}
                        >
                          {clientStats.map((entry, index) => (
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
                        <text x="50%" y="45%" textAnchor="middle" className="fill-foreground font-bold text-2xl">
                          {totalHours.toFixed(1)}h
                        </text>
                        <text x="50%" y="58%" textAnchor="middle" className="fill-muted-foreground text-xs">
                          Totale
                        </text>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-3">
                      {clientStats.slice(0, 5).map((client) => (
                        <div 
                          key={client.id} 
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
                              <p className="text-xs text-muted-foreground">{client.hours.toFixed(1)}h</p>
                              <span className="text-xs text-muted-foreground">•</span>
                              <p className="text-xs font-medium" style={{ color: client.color }}>{client.percentage}%</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="w-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                      <PieChartIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Nessun dato per il periodo selezionato</p>
                  </div>
                )}
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
                <h3 className="text-lg font-semibold mb-1">Trend periodo</h3>
                <p className="text-sm text-muted-foreground">Andamento delle ore lavorate</p>
              </div>
              {totalHours > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
                  <Sparkles className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-success">{totalHours.toFixed(1)}h totali</span>
                </div>
              )}
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

      <SendReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        clients={clients}
        defaultClientId={selectedClient !== "all" ? selectedClient : undefined}
      />
    </DashboardLayout>
  );
}
