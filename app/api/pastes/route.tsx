import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { redis } from "@/lib/redis";
import { getNow } from "@/lib/time";
import type { Paste } from "@/lib/types";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { content, ttl_seconds, max_views } = body;

        // Validation
        if (typeof content !== "string" || content.trim().length === 0) {
            return NextResponse.json(
                { error: "content is required" },
                { status: 400 }
            );
        }

        if (
            ttl_seconds !== undefined &&
            (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)
        ) {
            return NextResponse.json(
                { error: "ttl_seconds must be integer >= 1" },
                { status: 400 }
            );
        }

        if (
            max_views !== undefined &&
            (!Number.isInteger(max_views) || max_views < 1)
        ) {
            return NextResponse.json(
                { error: "max_views must be integer >= 1" },
                { status: 400 }
            );
        }

        const id = nanoid(8);
        const now = Date.now();

        const paste: Paste = {
            content,
            created_at: now,
            expires_at: ttl_seconds ? now + ttl_seconds * 1000 : null,
            max_views: max_views ?? null,
            views: 0,
        };

        await redis.set(`paste:${id}`, paste);

        const url = `${new URL(req.url).origin}/p/${id}`;

        return NextResponse.json(
            { id, url },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 }
        );
    }
}
