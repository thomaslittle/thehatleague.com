import { Link } from "@tanstack/react-router";
import { DiscordIcon, TwitchIcon } from "@/components/icons";

const TWITCH_URL = "https://www.twitch.tv/thehatleague";
const DISCORD_INVITE = "https://discord.gg/6KAYkCkzJH";

type InternalPath =
  | "/the-draft"
  | "/standings"
  | "/leaderboards"
  | "/schedule"
  | "/captains"
  | "/mvp"
  | "/replays"
  | "/clips"
  | "/about"
  | "/rules";

const FOOTER_GROUPS: {
  title: string;
  links: { label: string; to?: InternalPath; href?: string; hash?: string }[];
}[] = [
  {
    title: "League",
    links: [
      { label: "The Draft", to: "/the-draft" },
      { label: "Standings", to: "/standings" },
      { label: "Leaderboards", to: "/leaderboards" },
      { label: "Schedule", to: "/schedule" },
      { label: "Captains", to: "/captains" },
      { label: "MVP vote", to: "/mvp" },
    ],
  },
  {
    title: "Watch",
    links: [
      { label: "Twitch · Live", href: TWITCH_URL },
      { label: "Replays", to: "/replays" },
      { label: "Clips & highlights", to: "/clips" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "What is THL", to: "/about" },
      { label: "Ruleset", to: "/rules" },
      { label: "Code of conduct", to: "/rules", hash: "conduct" },
      { label: "Captains' handbook", to: "/captains" },
      { label: "Discord", href: DISCORD_INVITE },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-6 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-10">
        <div>
          <div className="flex items-center gap-3">
            <img src="/brand/thl-logo.png" alt="" className="h-10 w-10" />
            <div>
              <div className="font-marker text-xl">The Hat League</div>
              <div className="text-[10px] font-bold tracking-[0.22em] text-neutral-500 uppercase">
                Est. 2020 · MMXXVI
              </div>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-neutral-400">
            A draft-style Rocket League tournament series for the hat dads, the
            night-shifters, and anyone who measures rank in years not hours.
          </p>
          <div className="mt-6 flex items-center gap-2">
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-800 transition hover:border-[#5865F2] hover:text-[#5865F2]"
              aria-label="Join the Discord"
            >
              <DiscordIcon className="h-5 w-5" />
            </a>
            <a
              href={TWITCH_URL}
              target="_blank"
              rel="noopener"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-800 transition hover:border-[#9146ff] hover:text-[#9146ff]"
              aria-label="Watch on Twitch"
            >
              <TwitchIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
        {FOOTER_GROUPS.map((g) => (
          <div key={g.title}>
            <div className="mb-4 text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
              {g.title}
            </div>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              {g.links.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener"
                      className="transition hover:text-white"
                    >
                      {link.label}
                    </a>
                  ) : link.to ? (
                    <Link
                      to={link.to}
                      hash={link.hash}
                      className="transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-neutral-900">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-6 py-5 text-xs text-neutral-600 md:px-10">
          <span>© 2026 The Hat League</span>
          <span className="font-marker text-base text-thl-orange/80">
            More than mid, less than pro.
          </span>
        </div>
      </div>
    </footer>
  );
}
