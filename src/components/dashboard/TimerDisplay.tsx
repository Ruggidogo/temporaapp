import { cn } from "@/lib/utils";

interface TimerDisplayProps {
  time: string;
  isRunning: boolean;
}

export function TimerDisplay({ time, isRunning }: TimerDisplayProps) {
  const [hours, minutes, seconds] = time.split(":");

  return (
    <div className="relative flex items-center justify-center py-4 sm:py-6">
      {/* Ambient glow effect */}
      {isRunning && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-success/10 blur-3xl animate-pulse" />
        </div>
      )}
      
      {/* Timer digits container */}
      <div className="relative flex items-center gap-2 sm:gap-3 md:gap-4">
        {/* Hours */}
        <TimerDigitGroup value={hours} isRunning={isRunning} />
        
        {/* Separator */}
        <TimerSeparator isRunning={isRunning} />
        
        {/* Minutes */}
        <TimerDigitGroup value={minutes} isRunning={isRunning} />
        
        {/* Separator */}
        <TimerSeparator isRunning={isRunning} />
        
        {/* Seconds */}
        <TimerDigitGroup value={seconds} isRunning={isRunning} isSeconds />
      </div>
    </div>
  );
}

interface TimerDigitGroupProps {
  value: string;
  isRunning: boolean;
  isSeconds?: boolean;
}

function TimerDigitGroup({ value, isRunning, isSeconds }: TimerDigitGroupProps) {
  return (
    <div className="flex gap-1.5 sm:gap-2 md:gap-3">
      {value.split("").map((digit, index) => (
        <div
          key={index}
          className={cn(
            "relative flex items-center justify-center",
            "w-16 h-24 sm:w-24 sm:h-32 md:w-28 md:h-40 lg:w-32 lg:h-44",
            "rounded-2xl sm:rounded-3xl",
            "bg-gradient-to-b from-muted/60 to-muted/30",
            "border border-border/40",
            "shadow-lg",
            "transition-all duration-300",
            isRunning && "border-success/40 shadow-[0_8px_30px_-8px_hsl(var(--success)/0.3)]",
            isSeconds && isRunning && "animate-[pulse_1s_ease-in-out_infinite]"
          )}
        >
          {/* Inner highlight */}
          <div className="absolute inset-[2px] rounded-[14px] sm:rounded-[22px] bg-gradient-to-b from-background/90 to-background/50 pointer-events-none" />
          
          {/* Digit */}
          <span
            className={cn(
              "relative font-mono font-bold tracking-tight",
              "text-5xl sm:text-7xl md:text-8xl lg:text-9xl",
              "transition-all duration-300",
              isRunning 
                ? "text-success drop-shadow-[0_0_20px_hsl(var(--success)/0.5)]" 
                : "text-foreground"
            )}
          >
            {digit}
          </span>
          
          {/* Bottom reflection */}
          <div className="absolute bottom-2 left-3 right-3 h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
        </div>
      ))}
    </div>
  );
}

interface TimerSeparatorProps {
  isRunning: boolean;
}

function TimerSeparator({ isRunning }: TimerSeparatorProps) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 py-2">
      <div
        className={cn(
          "w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full",
          "transition-all duration-300",
          isRunning 
            ? "bg-success shadow-[0_0_12px_hsl(var(--success)/0.6)] animate-pulse" 
            : "bg-muted-foreground/30"
        )}
      />
      <div
        className={cn(
          "w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full",
          "transition-all duration-300",
          isRunning 
            ? "bg-success shadow-[0_0_12px_hsl(var(--success)/0.6)] animate-pulse" 
            : "bg-muted-foreground/30"
        )}
      />
    </div>
  );
}
