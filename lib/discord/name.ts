// Discord deprecated discriminators in 2023. Some legacy data and the
// Discord OAuth payload still surface "tomlit#0" — render as just "tomlit".

export function cleanDiscordUsername(
  username: string | null | undefined,
): string | null {
  if (!username) return null;
  return username.replace(/#0+$/, "");
}

export function displayHandle(
  username: string | null | undefined,
  fallback = "—",
): string {
  return cleanDiscordUsername(username) ?? fallback;
}
