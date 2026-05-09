"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export interface SearchFormDefaults {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
}

export function SearchForm({ defaults }: { defaults?: SearchFormDefaults }) {
  const router = useRouter();
  const [destination, setDestination] = useState(defaults?.destination ?? "Tokyo");
  const [checkIn, setCheckIn] = useState(defaults?.checkIn ?? todayPlus(14));
  const [checkOut, setCheckOut] = useState(defaults?.checkOut ?? todayPlus(17));
  const [guests, setGuests] = useState(defaults?.guests ?? 2);
  const [rooms, setRooms] = useState(defaults?.rooms ?? 1);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      destination,
      checkIn,
      checkOut,
      guests: String(guests),
      rooms: String(rooms),
    });
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <label>
        Destination
        <input
          type="text"
          required
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="City or hotel name"
        />
      </label>
      <label>
        Check-in
        <input type="date" required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
      </label>
      <label>
        Check-out
        <input type="date" required value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
      </label>
      <label>
        Guests
        <input
          type="number"
          min={1}
          max={20}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
        />
      </label>
      <label>
        Rooms
        <input
          type="number"
          min={1}
          max={10}
          value={rooms}
          onChange={(e) => setRooms(Number(e.target.value))}
        />
      </label>
      <button type="submit" className="primary">
        Compare
      </button>
    </form>
  );
}
