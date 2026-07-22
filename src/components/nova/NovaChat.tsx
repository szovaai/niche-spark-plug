import { useEffect, useRef, useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  conversationId: string;
  projectId?: string | null;
  initialMessages?: UIMessage[];
  agentType?: string;
  placeholder?: string;
  onAssistantFinish?: (assistantText?: string) => void;
  composerExtra?: React.ReactNode;
  externalInput?: string;
  onExternalInputConsumed?: () => void;
};

function messageText(m: UIMessage): string {
  return (m.parts as { type: string; text?: string }[])
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("");
}

export function NovaChat({
  conversationId,
  projectId,
  initialMessages = [],
  agentType = "nova_manager",
  placeholder = "Reply to Nova…",
  onAssistantFinish,
  composerExtra,
  externalInput,
  onExternalInputConsumed,
}: Props) {
  const { session } = useAuth();
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const endpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-with-nova`;

  const transport = new DefaultChatTransport({
    api: endpoint,
    headers: () => ({
      Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    }),
    body: () => ({ conversationId, projectId: projectId ?? null, agent_type: agentType }),
  });

  const { messages, sendMessage, status, stop, error } = useChat({
    id: conversationId,
    messages: initialMessages,
    transport,
    onFinish: ({ message }) => {
      const text = (message?.parts as { type: string; text?: string }[] | undefined)
        ?.filter((p) => p.type === "text")
        .map((p) => p.text ?? "")
        .join("\n");
      onAssistantFinish?.(text);
      supabase.functions.invoke("summarize-conversation", { body: { conversationId } }).catch(() => {});
    },
    onError: (e) => {
      console.error("[NovaChat]", e);
      toast.error("Nova hit a snag. Try again in a moment.");
    },
  });

  const isBusy = status === "submitted" || status === "streaming";

  const submit = useCallback(async () => {
    const text = input.trim();
    if (!text || isBusy) return;
    setInput("");
    await sendMessage({ text });
  }, [input, isBusy, sendMessage]);

  // Keep textarea focused
  useEffect(() => {
    textareaRef.current?.focus();
  }, [conversationId]);
  useEffect(() => {
    if (!isBusy) textareaRef.current?.focus();
  }, [isBusy, messages.length]);

  // Auto-scroll to bottom on new content
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
            <Sparkles className="mb-2 h-4 w-4 text-primary" />
            Nova is ready. Say hi to get started.
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex",
              m.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/40 border border-border/30 text-foreground",
              )}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1">
                  <ReactMarkdown>{messageText(m)}</ReactMarkdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{messageText(m)}</div>
              )}
            </div>
          </div>
        ))}
        {status === "submitted" && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-border/30 bg-muted/40 px-4 py-2.5 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {error.message}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="border-t border-border/30 bg-background/60 p-3 backdrop-blur"
      >
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="min-h-[52px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submit();
              }
            }}
          />
          {isBusy ? (
            <Button type="button" variant="outline" onClick={stop}>
              Stop
            </Button>
          ) : (
            <Button type="submit" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
