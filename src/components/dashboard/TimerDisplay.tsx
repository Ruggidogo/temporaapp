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
      <div
        className={cn(
          "relative flex items-center font-mono font-bold tracking-tighter",
          "text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem]",
          "transition-colors duration-500",
          isRunning 
            ? "text-success drop-shadow-[0_0_40px_hsl(var(--success)/0.4)]" 
            : "text-foreground"
        )}
      >
        {time.split("").map((char, index) => (
          <AnimatedDigit 
            key={index} 
            char={char} 
            isRunning={isRunning}
            isSeparator={char === ":"}
          />
        ))}
      </div>
      
      {/* Subtle underline accent */}
      {isRunning && (
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-1 rounded-full bg-gradient-to-r from-transparent via-success/50 to-transparent" />
      )}
    </div>
  );
}

interface AnimatedDigitProps {
  char: string;
  isRunning: boolean;
  isSeparator: boolean;
}

function AnimatedDigit({ char, isRunning, isSeparator }: AnimatedDigitProps) {
  const [displayChar, setDisplayChar] = useState(char);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevCharRef = useRef(char);

  useEffect(() => {
    if (prevCharRef.current !== char && !isSeparator) {
      setIsAnimating(true);
      
      // Short delay before changing the character
      const timeout = setTimeout(() => {
        setDisplayChar(char);
        prevCharRef.current = char;
      }, 75);

      // Reset animation state
      const resetTimeout = setTimeout(() => {
        setIsAnimating(false);
      }, 200);

      return () => {
        clearTimeout(timeout);
        clearTimeout(resetTimeout);
      };
    } else {
      setDisplayChar(char);
      prevCharRef.current = char;
    }
  }, [char, isSeparator]);

  if (isSeparator) {
    return (
      <span 
        className={cn(
          "mx-1 sm:mx-2 transition-opacity duration-300",
          isRunning ? "opacity-100 animate-pulse" : "opacity-60"
        )}
      >
        {char}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "relative inline-block tabular-nums transition-all duration-200 ease-out",
        isAnimating && "scale-110 opacity-70"
      )}
      style={{
        transform: isAnimating ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      {displayChar}
    </span>
  );
}
