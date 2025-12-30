"use client";

import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setResult(null);

    if (!content.trim()) {
      setError("Content is required");
      return;
    }

    const body: any = { content };

    if (ttl) body.ttl_seconds = Number(ttl);
    if (maxViews) body.max_views = Number(maxViews);

    const res = await fetch("/api/pastes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to create paste");
      return;
    }

    setResult(data.url);
    setContent("");
    setTtl("");
    setMaxViews("");
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 600 }}>
      <h1>Create Paste</h1>

      <textarea
        rows={8}
        style={{ width: "100%", backgroundColor: "gray", padding: "5px" }}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div style={{ marginTop: "1rem" }}>
        <input
          placeholder="TTL seconds (optional)"
          style={{ width: "100%", backgroundColor: "gray", padding: "5px" }}
          value={ttl}
          onChange={(e) => setTtl(e.target.value)}
        />
      </div>

      <div style={{ marginTop: "0.5rem" }}>
        <input
          placeholder="Max views (optional)"
          style={{ width: "100%", backgroundColor: "gray", padding: "5px" }}
          value={maxViews}
          onChange={(e) => setMaxViews(e.target.value)}
        />
      </div>

      <button style={{ marginTop: "1rem" }} onClick={handleSubmit}>
        Create
      </button>

      {result && (
        <p>
          Paste URL: <a href={result}>{result}</a>
        </p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
}
