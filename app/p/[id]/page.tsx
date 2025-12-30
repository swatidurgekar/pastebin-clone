import { notFound } from "next/navigation";
import { redis } from "@/lib/redis";
import { getNow } from "@/lib/time";
import type { Paste } from "@/lib/types";

export default async function PastePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const key = `paste:${id}`;

    const paste = (await redis.get(key)) as Paste | null;

    if (!paste) {
        notFound();
    }

    const now = getNow(new Request("http://localhost"));

    // TTL check
    if (paste.expires_at !== null && now >= paste.expires_at) {
        await redis.del(key);
        notFound();
    }

    // View limit check
    if (paste.max_views !== null && paste.views >= paste.max_views) {
        await redis.del(key);
        notFound();
    }

    // Increment views
    paste.views += 1;
    await redis.set(key, paste);

    return (
        <main style={{ padding: "2rem", whiteSpace: "pre-wrap" }}>
            {paste.content}
        </main>
    );
}
