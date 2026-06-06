import {
  Award,
  ClipboardCheck,
  CircleCheck,
  Target,
  Wand2,
  Shield,
  Star,
  Crosshair,
  Trophy,
  Swords,
  Flame,
  Medal,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps a patch's stored icon name (lucide identifier) to its component. Patches
 * are the hat-themed achievements players earn — we render real lucide icons,
 * never emoji. Unknown names fall back to a generic award.
 */
const ICONS: Record<string, LucideIcon> = {
  award: Award,
  "clipboard-check": ClipboardCheck,
  "circle-check": CircleCheck,
  target: Target,
  wand: Wand2,
  shield: Shield,
  star: Star,
  crosshair: Crosshair,
  trophy: Trophy,
  swords: Swords,
  flame: Flame,
  medal: Medal,
};

export function PatchIcon({
  name,
  className,
}: {
  name: string | null;
  className?: string;
}) {
  const Icon = (name && ICONS[name]) || Award;
  return <Icon className={className} aria-hidden />;
}
