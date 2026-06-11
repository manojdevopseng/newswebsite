import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/admin/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });

  const { title, excerpt, content } = await req.json();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

  // Strip HTML tags for cleaner input
  const plainContent = (content || excerpt || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 3000);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":         "application/json",
        "x-api-key":            apiKey,
        "anthropic-version":    "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-haiku-4-5-20251001",
        max_tokens: 200,
        messages: [
          {
            role:    "user",
            content: `Write a concise 2-3 sentence AI-style summary for this article. Be factual, informative, and engaging. Do not start with "This article". Output only the summary text, no quotes or labels.

Title: ${title}
Content: ${plainContent}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: (err as any)?.error?.message || "API error" }, { status: 500 });
    }

    const json = await res.json();
    const summary = json.content?.[0]?.text?.trim() || "";
    return NextResponse.json({ summary });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
