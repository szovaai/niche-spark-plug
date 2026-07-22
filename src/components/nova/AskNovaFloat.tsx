import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sparkles, Mic, MicOff, Volume2, VolumeX, X, Loader2 } from "lucide-react";
import { NovaChat } from "@/components/nova/NovaChat";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const LS_KEY = "nova.global_conversation_id";

export function AskNovaFloat() {
  const { user, session } = useAuth();
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [voiceOut, setVoiceOut] = useState(true);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [pendingInput, setPendingInput] = useState<string | undefined>();
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Ensure a global (non-project) conversation exists for this user
  useEffect(() => {
    if (!user || !open || conversationId) return;
    const cached = localStorage.getItem(`${LS_KEY}:${user.id}`);
    if (cached) {
      setConversationId(cached);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("nova_conversations")
        .insert({ user_id: user.id, project_id: null, title: "Ask Nova" })
        .select("id")
        .single();
      if (error || !data) {
        toast.error("Couldn't start Nova.");
        return;
      }
      localStorage.setItem(`${LS_KEY}:${user.id}`, data.id);
      setConversationId(data.id);
    })();
  }, [user, open, conversationId]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
  }, []);

  const speak = useCallback(
    async (text?: string) => {
      if (!voiceOut || !text || !text.trim()) return;
      try {
        stopSpeaking();
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nova-speak`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) return;
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.play().catch(() => {});
      } catch (e) {
        console.warn("[speak]", e);
      }
    },
    [voiceOut, session, stopSpeaking],
  );

  const startRecording = useCallback(async () => {
    stopSpeaking();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mime });
        if (blob.size < 1024) {
          toast.error("Didn't catch that — try again.");
          return;
        }
        setTranscribing(true);
        try {
          const form = new FormData();
          const ext = mime.includes("mp4") ? "mp4" : "webm";
          form.append("file", blob, `recording.${ext}`);
          const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nova-transcribe`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
            body: form,
          });
          const json = await res.json();
          if (!res.ok) {
            toast.error("Transcription failed.");
            console.error(json);
            return;
          }
          const text = (json.text ?? "").trim();
          if (!text) {
            toast.error("Didn't catch that — try again.");
            return;
          }
          setPendingInput(text);
        } finally {
          setTranscribing(false);
        }
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
    } catch (e) {
      console.error(e);
      toast.error("Mic access denied.");
    }
  }, [session, stopSpeaking]);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  }, []);

  if (!user) return null;

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg shadow-primary/30 backdrop-blur hover:scale-105 transition-transform"
          aria-label="Ask Nova"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Ask Nova</span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[70vh] max-h-[640px] w-[min(420px,calc(100vw-2rem))] flex-col rounded-2xl border border-border/40 bg-background/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold">Nova</div>
                <div className="text-xs text-muted-foreground">Your AI launch coach</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setVoiceOut((v) => {
                    if (v) stopSpeaking();
                    return !v;
                  });
                }}
                aria-label={voiceOut ? "Mute Nova's voice" : "Unmute Nova's voice"}
                title={voiceOut ? "Voice reply: on" : "Voice reply: off"}
              >
                {voiceOut ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {conversationId ? (
              <NovaChat
                conversationId={conversationId}
                agentType="nova_manager"
                placeholder="Ask Nova anything…"
                onAssistantFinish={(text) => void speak(text)}
                externalInput={pendingInput}
                onExternalInputConsumed={() => setPendingInput(undefined)}
                composerExtra={
                  <Button
                    type="button"
                    variant={recording ? "destructive" : "outline"}
                    size="icon"
                    onClick={recording ? stopRecording : startRecording}
                    disabled={transcribing}
                    aria-label={recording ? "Stop recording" : "Record voice"}
                    title={recording ? "Stop recording" : "Hold to speak"}
                    className={cn(recording && "animate-pulse")}
                  >
                    {transcribing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : recording ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                }
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Waking Nova…
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
