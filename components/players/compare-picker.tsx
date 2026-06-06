"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PickerPlayer {
  username: string;
  name: string;
}

/**
 * Two-slot player picker for the compare view. Selecting a player updates the
 * `?a=`/`?b=` query so the server re-renders the comparison.
 */
export function ComparePicker({
  players,
  a,
  b,
}: {
  players: PickerPlayer[];
  a: string | null;
  b: string | null;
}) {
  const router = useRouter();

  const setSlot = (slot: "a" | "b", username: string) => {
    const params = new URLSearchParams();
    if (slot === "a") {
      if (username) params.set("a", username);
      if (b) params.set("b", b);
    } else {
      if (a) params.set("a", a);
      if (username) params.set("b", username);
    }
    router.push(`/compare?${params.toString()}`);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Slot label="Player A" value={a} players={players} onChange={(u) => setSlot("a", u)} />
      <Slot label="Player B" value={b} players={players} onChange={(u) => setSlot("b", u)} />
    </div>
  );
}

function Slot({
  label,
  value,
  players,
  onChange,
}: {
  label: string;
  value: string | null;
  players: PickerPlayer[];
  onChange: (username: string) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-bold tracking-[0.22em] text-neutral-500 uppercase">
        {label}
      </div>
      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a player" />
        </SelectTrigger>
        <SelectContent>
          {players.map((p) => (
            <SelectItem key={p.username} value={p.username}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
