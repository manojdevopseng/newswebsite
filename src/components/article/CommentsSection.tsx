"use client";

import { useEffect, useState, useCallback } from "react";
import {
  MessageCircle, Send, CornerDownRight, Loader2, CheckCircle2,
  AlertCircle, ThumbsUp, Flag, Pin, ArrowUpDown, ChevronDown, ChevronUp,
} from "lucide-react";
import Image from "next/image";
import { formatRelativeDate } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Reply {
  _id:          string;
  name:         string;
  gravatarHash: string;
  content:      string;
  createdAt:    string;
  likes:        number;
}

interface Comment {
  _id:          string;
  name:         string;
  gravatarHash: string;
  content:      string;
  createdAt:    string;
  likes:        number;
  pinned:       boolean;
  replies:      Reply[];
}

interface FormState {
  name:     string;
  email:    string;
  content:  string;
  honeypot: string;
}

const EMPTY_FORM: FormState = { name: "", email: "", content: "", honeypot: "" };

const GUIDELINES = [
  "Be respectful and constructive",
  "No spam, self-promotion, or links",
  "Stay on topic with the article",
  "Do not share personal information",
];

// ─── Gravatar avatar ──────────────────────────────────────────────────────────

function Avatar({ hash, name, size = 32 }: { hash: string; name: string; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=404&s=${size * 2}`;

  if (hash && !imgError) {
    return (
      <div className="shrink-0 rounded-full overflow-hidden bg-muted" style={{ width: size, height: size }}>
        <Image
          src={gravatarUrl}
          alt={name}
          width={size}
          height={size}
          className="object-cover"
          onError={() => setImgError(true)}
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className="shrink-0 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name[0]?.toUpperCase() || "?"}
    </div>
  );
}

// ─── Like button ──────────────────────────────────────────────────────────────

function LikeButton({ commentId, initialLikes }: { commentId: string; initialLikes: number }) {
  const storageKey = `liked_${commentId}`;
  const [likes,   setLikes]   = useState(initialLikes);
  const [liked,   setLiked]   = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLiked(!!localStorage.getItem(storageKey));
  }, [storageKey]);

  async function handleLike() {
    if (liked || loading) return;
    setLoading(true);
    try {
      const res  = await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        setLikes(json.likes);
        setLiked(true);
        localStorage.setItem(storageKey, "1");
      }
    } finally { setLoading(false); }
  }

  return (
    <button
      onClick={handleLike}
      disabled={liked || loading}
      className={`flex items-center gap-1 text-xs transition-colors ${
        liked ? "text-accent" : "text-muted-fg hover:text-accent"
      } disabled:cursor-default`}
    >
      <ThumbsUp size={12} className={liked ? "fill-accent" : ""} />
      {likes > 0 && <span>{likes}</span>}
    </button>
  );
}

// ─── Report button ────────────────────────────────────────────────────────────

function ReportButton({ commentId }: { commentId: string }) {
  const storageKey = `reported_${commentId}`;
  const [reported, setReported] = useState(false);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    setReported(!!localStorage.getItem(storageKey));
  }, [storageKey]);

  async function handleReport() {
    if (reported || loading) return;
    if (!confirm("Report this comment as inappropriate?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/comments/${commentId}/report`, { method: "POST" });
      if (res.ok) {
        setReported(true);
        localStorage.setItem(storageKey, "1");
      }
    } finally { setLoading(false); }
  }

  return (
    <button
      onClick={handleReport}
      disabled={reported || loading}
      title={reported ? "Reported" : "Report comment"}
      className={`text-xs transition-colors ${
        reported ? "text-red-400 cursor-default" : "text-muted-fg hover:text-red-400"
      }`}
    >
      <Flag size={11} />
    </button>
  );
}

// ─── Comment form ─────────────────────────────────────────────────────────────

function CommentForm({ articleId, parentId, compact, onSuccess }: {
  articleId: string;
  parentId?: string;
  compact?:  boolean;
  onSuccess?: () => void;
}) {
  const [form,    setForm]    = useState<FormState>(EMPTY_FORM);
  const [status,  setStatus]  = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res  = await fetch("/api/comments", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ articleId, parentId, ...form }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(json.error || "Something went wrong");
      } else {
        setStatus("success");
        setMessage(json.message);
        setForm(EMPTY_FORM);
        onSuccess?.();
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
        <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-sm text-emerald-300">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Honeypot — hidden from humans */}
      <input
        type="text" name="website" value={form.honeypot}
        onChange={e => setForm(f => ({ ...f, honeypot: e.target.value }))}
        className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true"
      />

      {/* Name + Email */}
      <div className={`grid gap-3 ${compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
        <div>
          {!compact && <label className="block text-xs font-medium text-muted-fg mb-1">Name *</label>}
          <input
            type="text" required maxLength={60} value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Your name"
            className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border outline-none focus:border-accent/50 transition-colors placeholder:text-muted-fg"
          />
        </div>
        <div>
          {!compact && <label className="block text-xs font-medium text-muted-fg mb-1">Email * <span className="font-normal">(not shown)</span></label>}
          <input
            type="email" required value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="your@email.com"
            className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border outline-none focus:border-accent/50 transition-colors placeholder:text-muted-fg"
          />
        </div>
      </div>

      {/* Textarea */}
      <div>
        {!compact && <label className="block text-xs font-medium text-muted-fg mb-1">Comment * <span className="font-normal">(min 10 characters)</span></label>}
        <textarea
          required minLength={10} maxLength={1000}
          rows={compact ? 2 : 4} value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          placeholder={compact ? "Write a reply…" : "Share your thoughts…"}
          className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border outline-none focus:border-accent/50 transition-colors placeholder:text-muted-fg resize-none"
        />
        <p className="text-xs text-muted-fg mt-1 text-right">{form.content.length}/1000</p>
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle size={14} /> {message}
        </div>
      )}

      {/* Footer row: guidelines + submit */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {!compact && (
          <button
            type="button"
            onClick={() => setShowGuide(v => !v)}
            className="flex items-center gap-1 text-xs text-muted-fg hover:text-foreground transition-colors"
          >
            {showGuide ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            Comment guidelines
          </button>
        )}
        <button
          type="submit" disabled={status === "loading"}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-50 transition-colors ml-auto"
        >
          {status === "loading"
            ? <><Loader2 size={14} className="animate-spin" /> Submitting…</>
            : <><Send size={14} /> {compact ? "Post Reply" : "Post Comment"}</>
          }
        </button>
      </div>

      {/* Guidelines collapsible */}
      {showGuide && (
        <ul className="text-xs text-muted-fg space-y-1 p-3 rounded-lg bg-muted border border-border">
          {GUIDELINES.map(g => (
            <li key={g} className="flex items-center gap-2">
              <span className="text-accent">•</span> {g}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

// ─── Single comment ───────────────────────────────────────────────────────────

function CommentItem({ comment, articleId, onReplyPosted }: {
  comment:       Comment;
  articleId:     string;
  onReplyPosted: () => void;
}) {
  const [showReply, setShowReply] = useState(false);

  return (
    <div id={`comment-${comment._id}`} className="space-y-3 scroll-mt-24">
      <div className="flex gap-3">
        <Avatar hash={comment.gravatarHash} name={comment.name} size={34} />
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <span className="text-sm font-semibold text-foreground">{comment.name}</span>
            {comment.pinned && (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">
                <Pin size={9} /> Pinned
              </span>
            )}
            <a
              href={`#comment-${comment._id}`}
              className="text-xs text-muted-fg hover:text-foreground transition-colors"
            >
              {formatRelativeDate(comment.createdAt)}
            </a>
          </div>

          {/* Content */}
          <p className="text-sm text-foreground/90 leading-relaxed">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2">
            <LikeButton commentId={comment._id} initialLikes={comment.likes} />
            <button
              onClick={() => setShowReply(v => !v)}
              className="flex items-center gap-1 text-xs text-muted-fg hover:text-accent transition-colors"
            >
              <CornerDownRight size={12} /> Reply
            </button>
            <ReportButton commentId={comment._id} />
          </div>

          {/* Reply form */}
          {showReply && (
            <div className="mt-3">
              <CommentForm
                articleId={articleId} parentId={comment._id} compact
                onSuccess={() => { setShowReply(false); onReplyPosted(); }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="ml-11 space-y-3 border-l-2 border-border pl-4">
          {comment.replies.map(reply => (
            <div key={reply._id} id={`comment-${reply._id}`} className="flex gap-3 scroll-mt-24">
              <Avatar hash={reply.gravatarHash} name={reply.name} size={28} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground">{reply.name}</span>
                  <a href={`#comment-${reply._id}`} className="text-xs text-muted-fg hover:text-foreground transition-colors">
                    {formatRelativeDate(reply.createdAt)}
                  </a>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{reply.content}</p>
                <div className="mt-2">
                  <LikeButton commentId={reply._id} initialLikes={reply.likes} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function CommentsSection({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [sort,     setSort]     = useState<"newest" | "oldest">("newest");

  const fetchComments = useCallback(async () => {
    try {
      const res  = await fetch(`/api/comments?articleId=${articleId}&sort=${sort}`);
      const json = await res.json();
      setComments(json.comments || []);
    } catch { /* non-critical */ }
    finally { setLoading(false); }
  }, [articleId, sort]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const totalCount = comments.reduce((s, c) => s + 1 + c.replies.length, 0);

  return (
    <section className="mt-12 pt-8 border-t border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} className="text-accent" />
          <h2 className="text-lg font-bold">
            {loading ? "Comments" : `${totalCount} Comment${totalCount !== 1 ? "s" : ""}`}
          </h2>
        </div>
        {comments.length > 1 && (
          <button
            onClick={() => setSort(s => s === "newest" ? "oldest" : "newest")}
            className="flex items-center gap-1.5 text-xs text-muted-fg hover:text-foreground transition-colors"
          >
            <ArrowUpDown size={12} />
            {sort === "newest" ? "Newest first" : "Oldest first"}
          </button>
        )}
      </div>

      {/* Comment form */}
      <div className="mb-8 p-5 rounded-2xl bg-card border border-border">
        <h3 className="text-sm font-semibold mb-4">Leave a Comment</h3>
        <CommentForm articleId={articleId} onSuccess={fetchComments} />
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-32" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-fg">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="space-y-6 divide-y divide-border">
          {comments.map(comment => (
            <div key={comment._id} className="pt-6 first:pt-0">
              <CommentItem
                comment={comment}
                articleId={articleId}
                onReplyPosted={fetchComments}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
