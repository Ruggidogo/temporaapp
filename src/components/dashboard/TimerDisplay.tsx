import { cn } from "@/lib/utils";

interface TimerDisplayProps {
  time: string;
  isRunning: boolean;
}

export function TimerDisplay({ time, isRunning }: TimerDisplayProps) {
  return (
    <div className="relative flex items-center justify-center py-6 sm:py-8 md:py-10">
      {/* Ambient glow effect */}
      {isRunning && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-80 h-40 sm:w-[500px] sm:h-60 rounded-full bg-success/8 blur-3xl" />
        </div>
      )}
      
      {/* Timer display */}
      <div
        className={cn(
          "relative font-mono font-bold tracking-tighter tabular-nums",
          "text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem]",
          "transition-all duration-500",
          isRunning 
            ? "text-success drop-shadow-[0_0_40px_hsl(var(--success)/0.4)]" 
            : "text-foreground"
        )}
      >
        {time}
      </div>
      
      {/* Subtle underline accent */}
      {isRunning && (
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-1 rounded-full bg-gradient-to-r from-transparent via-success/50 to-transparent" />
      )}
    </div>
  );
}
