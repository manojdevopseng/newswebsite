import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import NewsletterModel from "@/lib/db/models/Newsletter";
import { isValidEmail } from "@/lib/utils";
import { isRateLimited, getIP } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 attempts per hour per IP
    const ip = getIP(req)
    if (await isRateLimited(`newsletter:${ip}`, 5, 60 * 60 * 1000))
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })

    const body = await req.json();
    const email = (body.email ?? "").trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    await dbConnect();

    const existing = await NewsletterModel.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json({ message: "Already subscribed" }, { status: 409 });
    }

    await NewsletterModel.create({
      email,
      source: req.headers.get("referer") || "website",
    });

    return NextResponse.json({ message: "Subscribed successfully" }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/newsletter]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
