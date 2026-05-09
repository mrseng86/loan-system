"use client";

import { useEffect, useState } from "react";
import type { SocialReview } from "@/lib/reviews/types";

const SOURCE_LABEL: Record<string, string> = {
  youtube: "YouTube",
  reddit: "Reddit",
  twitter: "X / Twitter",
  xiaohongshu: "小红书 / 微博",
  tripadvisor: "TripAdvisor",
};

export function ReviewsPanel({ hotelName, city }: { hotelName: string; city?: string }) {
  const [reviews, setReviews] = useState<SocialReview[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ hotelName });
    if (city) params.set("city", city);
    fetch(`/api/reviews?${params.toString()}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`API ${r.status}`);
        return r.json();
      })
      .then((d) => setReviews(d.reviews))
      .catch((e) => setError(String(e.message ?? e)));
  }, [hotelName, city]);

  if (error) return <div className="alert">Failed to load reviews: {error}</div>;
  if (!reviews) return <p style={{ color: "var(--muted)" }}>Loading social reviews…</p>;
  if (reviews.length === 0) return <p style={{ color: "var(--muted)" }}>No reviews found.</p>;

  return (
    <div className="reviews">
      {reviews.map((r) => (
        <a key={r.id} className="review" href={r.url} target="_blank" rel="noreferrer">
          <div className="src">{SOURCE_LABEL[r.source] ?? r.source}</div>
          {r.title && <div className="title">{r.title}</div>}
          <div className="snippet">{r.snippet}</div>
          <div style={{ color: "var(--muted)", fontSize: 11 }}>
            {r.author && <>by {r.author} · </>}
            {r.engagement != null && <>{r.engagement} reactions · </>}
            {r.isMock && <span className="badge mock">mock</span>}
          </div>
        </a>
      ))}
    </div>
  );
}
