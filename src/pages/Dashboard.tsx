import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Play, 
  Square, 
  Clock, 
  Plus, 
  ChevronDown,
  RotateCcw,
  Keyboard,
  Edit2,
  Trash2,
  Copy
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { cn } from "@/lib/utils";

// Mock data for demo
const mockClients = [
  { id: "1", name: "Acme Corp", color: "violet" },
  { id: "2", name: "TechStart", color: "blue" },
  { id: "3", name: "Design Studio", color: "pink" },
];

const mockTodayEntries = [
  { 
    id: "1", 
    client: mockClients[0], 
    description: "Sviluppo landing page", 
    duration: 7200, 
    startTime: "09:00",
    endTime: "11:00"
  },
  { 
    id: "2", 
    client: mockClients[1], 
    description: "Meeting kickoff progetto", 
    duration: 3600, 
    startTime: "11:30",
    endTime: "12:30"
  },
  { 
    id: "3", 
    client: mockClients[2], 
    description: "Review wireframes", 
    duration: 5400, 
    startTime: "14:00",
    endTime: "15:30"
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

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export default function Dashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedClient, setSelectedClient] = useState(mockClients[0]);
  const [description, setDescription] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Update document title when timer is running
  useEffect(() => {
    if (isRunning) {
      document.title = `${formatTime(elapsedTime)} - Tempora`;
    } else {
      document.title = "Dashboard - Tempora";
    }
    return () => {
      document.title = "Tempora";
    };
  }, [isRunning, elapsedTime]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        setIsRunning((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleStartStop = useCallback(() => {
    if (isRunning) {
      // Stop timer - would save entry here
      setIsRunning(false);
      setElapsedTime(0);
      setDescription("");
    } else {
      setIsRunning(true);
    }
  }, [isRunning]);

  const totalTodaySeconds = mockTodayEntries.reduce((acc, entry) => acc + entry.duration, 0);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
        {/* Timer Card */}
        <Card 
          variant={isRunning ? "timer-active" : "timer"}
          className={cn(
            "relative overflow-hidden transition-all duration-500",
            isRunning && "timer-pulse"
          )}
        >
          {/* Client color bar */}
          <div className={cn("absolute top-0 left-0 right-0 h-1", colorClasses[selectedClient.color])} />
          
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center">
              {/* Client selector */}
              <div className="relative mb-6">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-sm"
                  onClick={() => setShowClientDropdown(!showClientDropdown)}
                >
                  <div className={cn("w-3 h-3 rounded-full", colorClasses[selectedClient.color])} />
                  <span>{selectedClient.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
                
                {showClientDropdown && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-card border rounded-lg shadow-lg py-2 z-10 animate-scale-in">
                    {mockClients.map((client) => (
                      <button
                        key={client.id}
                        className="w-full px-4 py-2 flex items-center gap-3 hover:bg-muted transition-colors text-sm"
                        onClick={() => {
                          setSelectedClient(client);
                          setShowClientDropdown(false);
                        }}
                      >
                        <div className={cn("w-3 h-3 rounded-full", colorClasses[client.color])} />
                        {client.name}
                      </button>
                    ))}
                    <div className="border-t my-2" />
                    <button className="w-full px-4 py-2 flex items-center gap-3 hover:bg-muted transition-colors text-sm text-primary">
                      <Plus className="w-4 h-4" />
                      Nuovo cliente
                    </button>
                  </div>
                )}
              </div>

              {/* Timer display */}
              <div className={cn(
                "font-mono text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 transition-all",
                isRunning ? "text-success" : "text-foreground"
              )}>
                {formatTime(elapsedTime)}
              </div>

              {/* Description input */}
              <Input
                placeholder="Su cosa stai lavorando?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="max-w-md text-center border-dashed mb-8"
              />

              {/* Action buttons */}
              <div className="flex gap-4">
                <Button
                  variant={isRunning ? "timer-stop" : "timer"}
                  size="lg"
                  onClick={handleStartStop}
                  className="min-w-[140px]"
                >
                  {isRunning ? (
                    <>
                      <Square className="w-5 h-5 fill-current" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      Start
                    </>
                  )}
                </Button>
                <Button variant="timer-manual" size="lg">
                  <Clock className="w-5 h-5" />
                  Manuale
                </Button>
              </div>

              {/* Keyboard hint */}
              <p className="mt-6 text-xs text-muted-foreground flex items-center gap-2">
                <Keyboard className="w-3 h-3" />
                Premi Spazio per start/stop
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" className="text-xs">
            <RotateCcw className="w-3 h-3 mr-1" />
            Riprendi ultimo
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            Sviluppo landing page
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            Meeting kickoff
          </Button>
        </div>

        {/* Today's entries */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Oggi</h2>
              <p className="text-sm text-muted-foreground">
                Totale: <span className="font-medium text-foreground">{formatDuration(totalTodaySeconds)}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {mockClients.map((client) => {
                const clientTime = mockTodayEntries
                  .filter((e) => e.client.id === client.id)
                  .reduce((acc, e) => acc + e.duration, 0);
                const percentage = (clientTime / totalTodaySeconds) * 100;
                if (percentage === 0) return null;
                return (
                  <div 
                    key={client.id}
                    className="flex items-center gap-1 text-xs"
                    title={`${client.name}: ${formatDuration(clientTime)}`}
                  >
                    <div 
                      className={cn("h-2 rounded-full", colorClasses[client.color])}
                      style={{ width: `${Math.max(percentage * 0.8, 8)}px` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            {mockTodayEntries.length === 0 ? (
              <Card variant="default" className="text-center py-12">
                <p className="text-muted-foreground mb-2">Nessuna attività oggi.</p>
                <p className="text-sm text-muted-foreground">Pronto a iniziare? 🚀</p>
              </Card>
            ) : (
              mockTodayEntries.map((entry) => (
                <Card 
                  key={entry.id} 
                  variant="interactive"
                  className="group"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Color indicator */}
                      <div className={cn("w-1 h-12 rounded-full", colorClasses[entry.client.color])} />
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium truncate">{entry.client.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {entry.description}
                        </p>
                      </div>

                      {/* Time info */}
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatDuration(entry.duration)}</div>
                        <div className="text-xs text-muted-foreground">
                          {entry.startTime} - {entry.endTime}
                        </div>
                      </div>

                      {/* Actions (visible on hover) */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon-sm">
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon-sm">
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="text-destructive">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
