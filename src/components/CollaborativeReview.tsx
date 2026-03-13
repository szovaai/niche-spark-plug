import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Share2, Link2, Copy, Check, Clock, MessageSquare, Loader2, Send, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ReviewComment {
  id: string;
  section_key: string;
  comment_text: string;
  reviewer_name: string;
  created_at: string;
}

interface CollaborativeReviewProps {
  projectId: string;
  userId: string;
}

export default function CollaborativeReview({ projectId, userId }: CollaborativeReviewProps) {
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    fetchExistingSession();
  }, [projectId]);

  const fetchExistingSession = async () => {
    const { data } = await supabase
      .from("review_sessions")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      const session = data[0] as any;
      setSessionId(session.id);
      setShareLink(`${window.location.origin}/review/${session.share_token}`);
      setExpiresAt(session.expires_at);
      fetchComments(session.id);
    }
  };

  const fetchComments = async (sid: string) => {
    const { data } = await supabase
      .from("review_comments")
      .select("*")
      .eq("session_id", sid)
      .order("created_at", { ascending: false });
    if (data) setComments(data as ReviewComment[]);
  };

  const generateShareLink = async () => {
    setLoading(true);
    const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    const { data, error } = await supabase.from("review_sessions").insert({
      project_id: projectId,
      user_id: userId,
      share_token: token,
    } as any).select().single();

    if (error) {
      toast.error("Failed to create review link");
      setLoading(false);
      return;
    }
    const session = data as any;
    setSessionId(session.id);
    setShareLink(`${window.location.origin}/review/${token}`);
    setExpiresAt(session.expires_at);
    toast.success("Review link created! Valid for 24 hours.");
    setLoading(false);
  };

  const copyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-primary" />
          <h4 className="font-semibold text-sm">Collaborative Review</h4>
          {comments.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">{comments.length} comments</Badge>
          )}
        </div>

        {!shareLink ? (
          <div className="text-center py-4 space-y-3">
            <p className="text-xs text-muted-foreground">Share your project for feedback. Reviewers can comment without creating an account.</p>
            <Button size="sm" className="gap-1.5" onClick={generateShareLink} disabled={loading}>
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
              Generate Review Link
            </Button>
          </div>
        ) : (
          <>
            {/* Link Display */}
            <div className="flex items-center gap-2">
              <Input value={shareLink} readOnly className="text-xs h-8 font-mono" />
              <Button variant="outline" size="sm" className="h-8 gap-1 shrink-0" onClick={copyLink}>
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
            {expiresAt && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Expires {formatDistanceToNow(new Date(expiresAt), { addSuffix: true })}
              </p>
            )}

            {/* Comments */}
            {comments.length > 0 && (
              <ScrollArea className="max-h-[200px]">
                <div className="space-y-2">
                  {comments.map(c => (
                    <div key={c.id} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/50">
                      <User className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium">{c.reviewer_name}</span>
                          <Badge variant="outline" className="text-[9px]">{c.section_key}</Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{c.comment_text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
