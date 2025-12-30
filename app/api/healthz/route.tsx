import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET() {
    try {
        await redis.set("healthz:test", "ok", { ex: 10 });
        const value = await redis.get("healthz:test");
        return NextResponse.json({ ok: value === "ok" });
    } catch (err) {
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}