import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { getNow } from "@/lib/time";
import type { Paste } from "@/lib/types";

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const key = `paste:${id}`;

    const paste = (await redis.get(key)) as Paste | null;

    if (!paste) {
        return NextResponse.json(
            { error: "Paste not found" },
            { status: 404 }
        );
    }

    const now = getNow(req);

    // TTL check
    if (paste.expires_at !== null && now >= paste.expires_at) {
        console.log("now", now, "expirytime", paste.expires_at)
        await redis.del(key);
        return NextResponse.json(
            { error: "Paste expired" },
            { status: 404 }
        );
    }

    // View limit check
    if (paste.max_views !== null && paste.views >= paste.max_views) {
        await redis.del(key);
        return NextResponse.json(
            { error: "View limit exceeded" },
            { status: 404 }
        );
    }

    // Increment views
    paste.views += 1;

    await redis.set(key, paste);

    const remainingViews =
        paste.max_views !== null
            ? Math.max(paste.max_views - paste.views, 0)
            : null;

    return NextResponse.json({
        content: paste.content,
        remaining_views: remainingViews,
        expires_at: paste.expires_at
            ? new Date(paste.expires_at).toISOString()
            : null,
    });
}
