"use client";

import { INTENT_MODES, type IntentId } from "@/lib/intent";

interface Props {
  value: IntentId;
  onChange: (id: IntentId) => void;
}

export function IntentSelector({ value, onChange }: Props) {
  return (
    <div className="intent">
      <span className="intent-label">Travel mode</span>
      <div className="intent-options" role="radiogroup" aria-label="Travel mode">
        {Object.values(INTENT_MODES).map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={m.id === value}
            className={`intent-pill${m.id === value ? " intent-pill--on" : ""}`}
            onClick={() => onChange(m.id)}
          >
            <span className="intent-emoji" aria-hidden>
              {m.emoji}
            </span>
            {m.label}
          </button>
        ))}
      </div>
      <p className="intent-blurb">{INTENT_MODES[value].blurb}</p>
    </div>
  );
}
