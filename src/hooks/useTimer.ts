import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface TimerState {
  isRunning: boolean;
  elapsedTime: number;
  startTime: Date | null;
  clientId: string | null;
  description: string;
}

export function useTimer() {
  const { user } = useAuth();
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    elapsedTime: 0,
    startTime: null,
    clientId: null,
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer tick
  useEffect(() => {
    if (state.isRunning && state.startTime) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - state.startTime!.getTime()) / 1000);
        setState((prev) => ({ ...prev, elapsedTime: elapsed }));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, state.startTime]);

  // Update document title
  useEffect(() => {
    if (state.isRunning) {
      const hours = Math.floor(state.elapsedTime / 3600);
      const minutes = Math.floor((state.elapsedTime % 3600) / 60);
      const secs = state.elapsedTime % 60;
      const timeStr = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      document.title = `${timeStr} - Tempora`;
    } else {
      document.title = "Dashboard - Tempora";
    }

    return () => {
      document.title = "Tempora";
    };
  }, [state.isRunning, state.elapsedTime]);

  const start = useCallback((clientId: string | null, description: string) => {
    setState({
      isRunning: true,
      elapsedTime: 0,
      startTime: new Date(),
      clientId,
      description,
    });
  }, []);

  const stop = useCallback(async () => {
    if (!user || !state.startTime) return;

    setSaving(true);
    const endTime = new Date();
    const durationSeconds = Math.floor(
      (endTime.getTime() - state.startTime.getTime()) / 1000
    );

    try {
      const { error } = await supabase.from("time_entries").insert({
        user_id: user.id,
        client_id: state.clientId,
        description: state.description.trim() || null,
        start_time: state.startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_seconds: durationSeconds,
        entry_type: "timer",
        date: state.startTime.toISOString().split("T")[0],
      });

      if (error) throw error;

      toast({
        title: "Tempo salvato! ✓",
        description: `${Math.floor(durationSeconds / 60)} minuti registrati`,
      });

      setState({
        isRunning: false,
        elapsedTime: 0,
        startTime: null,
        clientId: null,
        description: "",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, state]);

  const reset = useCallback(() => {
    setState({
      isRunning: false,
      elapsedTime: 0,
      startTime: null,
      clientId: null,
      description: "",
    });
  }, []);

  const setDescription = useCallback((description: string) => {
    setState((prev) => ({ ...prev, description }));
  }, []);

  const setClientId = useCallback((clientId: string | null) => {
    setState((prev) => ({ ...prev, clientId }));
  }, []);

  return {
    isRunning: state.isRunning,
    elapsedTime: state.elapsedTime,
    clientId: state.clientId,
    description: state.description,
    saving,
    start,
    stop,
    reset,
    setDescription,
    setClientId,
  };
}
