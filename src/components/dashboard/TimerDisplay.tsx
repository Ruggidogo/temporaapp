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
    <div className="flex gap-1 sm:gap-1.5">
      {value.split("").map((digit, index) => (
        <div
          key={index}
          className={cn(
            "relative flex items-center justify-center",
            "w-12 h-16 sm:w-16 sm:h-20 md:w-20 md:h-24 lg:w-24 lg:h-28",
            "rounded-xl sm:rounded-2xl",
            "bg-gradient-to-b from-muted/80 to-muted/40",
            "border border-border/50",
            "shadow-sm",
            "transition-all duration-300",
            isRunning && "border-success/30 shadow-success/10",
            isSeconds && isRunning && "animate-[pulse_1s_ease-in-out_infinite]"
          )}
        >
          {/* Inner highlight */}
          <div className="absolute inset-[1px] rounded-[10px] sm:rounded-[14px] bg-gradient-to-b from-background/80 to-transparent pointer-events-none" />
          
          {/* Digit */}
          <span
            className={cn(
              "relative font-mono font-bold tracking-tight",
              "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
              "transition-all duration-300",
              isRunning 
                ? "text-success" 
                : "text-foreground"
            )}
          >
            {digit}
          </span>
          
          {/* Bottom reflection */}
          <div className="absolute bottom-0 left-2 right-2 h-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
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
    <div className="flex flex-col gap-2 sm:gap-3 py-2">
      <div
        className={cn(
          "w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full",
          "transition-all duration-300",
          isRunning 
            ? "bg-success shadow-[0_0_8px_hsl(var(--success)/0.5)] animate-pulse" 
            : "bg-muted-foreground/40"
        )}
      />
      <div
        className={cn(
          "w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full",
          "transition-all duration-300",
          isRunning 
            ? "bg-success shadow-[0_0_8px_hsl(var(--success)/0.5)] animate-pulse" 
            : "bg-muted-foreground/40"
        )}
      />
    </div>
  );
}
