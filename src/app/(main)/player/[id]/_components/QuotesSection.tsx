"use client";

import { Quote, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts";
import { useCreateQuote, useDeleteQuote, useQuotes } from "@/hooks";
import type { HttpError } from "@/lib/http";

// Teammate quotes about a player. Any logged-in player (other than the subject)
// may leave one quote; authors and admins can delete. Populated with the author
// so we can show who said it.
export const QuotesSection = ({ subjectId }: { subjectId: string }) => {
  const { user, isAdmin } = useAuth();
  const quotesQuery = useQuotes({ subjectId, populations: ["author"], pageSize: 100 });
  const quotes = quotesQuery.data?.items ?? [];
  const create = useCreateQuote();
  const del = useDeleteQuote();
  const [content, setContent] = useState("");

  const myQuote = user ? quotes.find((q) => q.authorId === user.id) : undefined;
  const canWrite = !!user && user.id !== subjectId && !myQuote;

  const submit = () => {
    const text = content.trim();
    if (!text || !user) return;
    create.mutate(
      { subjectId, authorId: user.id, content: text },
      {
        onSuccess: () => {
          setContent("");
          toast.success("Đã gửi nhận xét");
        },
        onError: (e) => {
          const err = e as unknown as HttpError;
          toast.error(
            err?.status === 409 ? "Bạn đã nhận xét cầu thủ này rồi" : "Không gửi được nhận xét"
          );
        },
      }
    );
  };

  return (
    <section className="rounded-xl border bg-card p-5">
      <h2 className="mb-4 text-lg font-semibold uppercase tracking-tight">Đồng đội nói gì</h2>

      {canWrite ? (
        <div className="mb-5 flex flex-col gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết vài lời về cầu thủ này…"
            className="min-h-[72px]"
          />
          <div className="flex justify-end">
            <Button size="sm" disabled={create.isPending || !content.trim()} onClick={submit}>
              {create.isPending ? "Đang gửi…" : "Gửi nhận xét"}
            </Button>
          </div>
        </div>
      ) : null}

      {quotesQuery.isPending ? (
        <div className="text-sm text-muted-foreground">Đang tải…</div>
      ) : quotes.length === 0 ? (
        <div className="text-sm text-muted-foreground">Chưa có nhận xét nào.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {quotes.map((q) => {
            const canDelete = isAdmin || q.authorId === user?.id;
            const author = q.author;
            const avatar = author?.avatarNoBg || author?.avatarUrl || undefined;
            return (
              <figure key={q.id} className="group/q flex gap-3">
                <Avatar className="size-9 shrink-0 border">
                  <AvatarImage src={avatar} className="object-cover" />
                  <AvatarFallback className="text-xs">
                    {author?.fullName?.charAt(0) ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <blockquote className="text-sm italic text-foreground/90">
                    <Quote className="mr-1 inline size-3.5 text-primary/60" />
                    {q.content}
                  </blockquote>
                  <figcaption className="mt-1 text-xs text-muted-foreground">
                    — {author?.fullName ?? "Ẩn danh"}
                  </figcaption>
                </div>
                {canDelete ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 opacity-0 transition-opacity group-hover/q:opacity-100"
                    disabled={del.isPending}
                    onClick={() => del.mutate(q.id)}
                    aria-label="Xóa nhận xét"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                ) : null}
              </figure>
            );
          })}
        </div>
      )}
    </section>
  );
};
