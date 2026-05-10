"use client";

import { useState } from "react";

interface Props {
  /** The full URL to share. Computed by the parent so it stays in sync with state. */
  url: string;
}

export function ShareLinkButton({ url }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers / non-secure contexts.
        const ta = document.createElement("textarea");
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" className="share-button" onClick={copy} title="Copy comparison link">
      {copied ? "✓ Copied" : "🔗 Share comparison"}
    </button>
  );
}
