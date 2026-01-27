import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

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
          <div className="w-80 h-40 sm:w-[500px] sm:h-60 rounded-full bg-success/8 blur-3xl animate-pulse" />
        </div>
      )}
      
      {/* Timer display */}
      <div className="relative flex items-center gap-1 sm:gap-2">
        {time.split("").map((char, index) => (
          char === ":" ? (
            <TimerSeparator key={index} isRunning={isRunning} />
          ) : (
            <FlipDigit 
              key={index} 
              digit={char} 
              isRunning={isRunning}
            />
          )
        ))}
      </div>
      
      {/* Subtle underline accent */}
      {isRunning && (
        <div className="absolute bottom-0 sm:bottom-2 left-1/2 -translate-x-1/2 w-24 sm:w-40 h-1 rounded-full bg-gradient-to-r from-transparent via-success/40 to-transparent" />
      )}
    </div>
  );
}

interface FlipDigitProps {
  digit: string;
  isRunning: boolean;
}

function FlipDigit({ digit, isRunning }: FlipDigitProps) {
  const [currentDigit, setCurrentDigit] = useState(digit);
  const [previousDigit, setPreviousDigit] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevDigitRef = useRef(digit);

  useEffect(() => {
    if (prevDigitRef.current !== digit) {
      setPreviousDigit(prevDigitRef.current);
      setIsFlipping(true);
      
      // Change digit at the middle of the flip
      const changeTimeout = setTimeout(() => {
        setCurrentDigit(digit);
      }, 150);

      // Reset flip state
      const resetTimeout = setTimeout(() => {
        setIsFlipping(false);
        prevDigitRef.current = digit;
      }, 300);

      return () => {
        clearTimeout(changeTimeout);
        clearTimeout(resetTimeout);
      };
    }
  }, [digit]);

  return (
    <div 
      className={cn(
        "relative",
        "w-12 h-16 sm:w-20 sm:h-28 md:w-24 md:h-32 lg:w-28 lg:h-40",
        "perspective-[500px]"
      )}
      style={{ perspective: "500px" }}
    >
      {/* Card background */}
      <div 
        className={cn(
          "absolute inset-0 rounded-lg sm:rounded-xl",
          "bg-gradient-to-b from-muted/80 to-muted/40",
          "border border-border/30",
          "shadow-lg",
          "transition-all duration-300",
          isRunning && "border-success/20 shadow-[0_4px_20px_-4px_hsl(var(--success)/0.2)]"
        )}
      />
      
      {/* Static bottom half (shows current digit) */}
      <div className="absolute inset-0 overflow-hidden rounded-lg sm:rounded-xl">
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            "font-mono font-bold tabular-nums",
            "text-4xl sm:text-6xl md:text-7xl lg:text-8xl",
            "transition-colors duration-300",
            isRunning ? "text-success" : "text-foreground"
          )}
        >
          {currentDigit}
        </div>
      </div>

      {/* Flip card - top half flipping down */}
      {isFlipping && (
        <>
          {/* Top half - old digit flipping down */}
          <div 
            className={cn(
              "absolute inset-x-0 top-0 h-1/2 overflow-hidden rounded-t-lg sm:rounded-t-xl",
              "bg-gradient-to-b from-muted/90 to-muted/60",
              "border-x border-t border-border/30",
              "origin-bottom",
              "animate-flip-top"
            )}
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            <div 
              className={cn(
                "absolute inset-0 flex items-end justify-center pb-0",
                "font-mono font-bold tabular-nums",
                "text-4xl sm:text-6xl md:text-7xl lg:text-8xl",
                isRunning ? "text-success" : "text-foreground"
              )}
              style={{ 
                height: "200%",
              }}
            >
              {previousDigit}
            </div>
          </div>

          {/* Bottom half - new digit flipping up */}
          <div 
            className={cn(
              "absolute inset-x-0 bottom-0 h-1/2 overflow-hidden rounded-b-lg sm:rounded-b-xl",
              "bg-gradient-to-t from-muted/90 to-muted/60",
              "border-x border-b border-border/30",
              "origin-top",
              "animate-flip-bottom"
            )}
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            <div 
              className={cn(
                "absolute inset-0 flex items-start justify-center pt-0",
                "font-mono font-bold tabular-nums",
                "text-4xl sm:text-6xl md:text-7xl lg:text-8xl",
                isRunning ? "text-success" : "text-foreground"
              )}
              style={{ 
                height: "200%",
                marginTop: "-100%",
              }}
            >
              {currentDigit}
            </div>
          </div>
        </>
      )}

      {/* Center line */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-border/50 -translate-y-px z-10" />
      
      {/* Shine effect */}
      <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
    </div>
  );
}

interface TimerSeparatorProps {
  isRunning: boolean;
}

function TimerSeparator({ isRunning }: TimerSeparatorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 px-1 sm:px-2">
      <div
        className={cn(
          "w-2 h-2 sm:w-3 sm:h-3 rounded-full",
          "transition-all duration-300",
          isRunning 
            ? "bg-success shadow-[0_0_10px_hsl(var(--success)/0.6)] animate-pulse" 
            : "bg-muted-foreground/30"
        )}
      />
      <div
        className={cn(
          "w-2 h-2 sm:w-3 sm:h-3 rounded-full",
          "transition-all duration-300",
          isRunning 
            ? "bg-success shadow-[0_0_10px_hsl(var(--success)/0.6)] animate-pulse" 
            : "bg-muted-foreground/30"
        )}
      />
    </div>
  );
}
