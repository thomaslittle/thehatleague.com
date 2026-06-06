# Friday Nite Fights — How It Works

A weekly **2v2 Swiss tournament** that any Discord-connected member can enter.
The site auto-builds rank-balanced teams, runs a Swiss bracket, then seeds the
top teams into single-elimination playoffs. Players report their own scores and
each new round is created automatically — like Challonge, but native to the
site.

Live at **/friday-nite-fights** (also promoted on the landing page).

---

## 1. Registration

- Anyone **signed in with Discord** can hit **Enter** to register. No invite or
  approval needed.
- We snapshot their **current 2v2 rank** at the moment they register — that
  number is what seeds the teams. (If their 2v2 rank is Unranked, we fall back
  to their peak rank.)
- Players can **drop out** any time before the admin generates teams. Once teams
  are generated, registration is locked.

## 2. Team generation (rank-balanced)

When the admin clicks **Auto-generate teams**, every registrant is sorted by
rank (best → worst) and paired so the teams are as even as possible:

- The **highest-ranked player anchors Team 1** and is paired with the
  **lowest-ranked** available player.
- The 2nd-highest anchors Team 2 with the 2nd-lowest, and so on.
- The result: the top-seeded teams have the widest rank spread (a star carrying
  a lower-ranked partner), and the **bottom-seeded teams are the most evenly
  matched internally** (e.g. two mid-tier players together).
- Team numbers (#1, #2, …) reflect anchor strength — **#1 is the team with the
  strongest single player**.
- If an **odd number** of people register, the leftover middle player is parked
  on a "Bench" the admin can place by hand.

**Manual override:** after auto-generating, the admin can **drag and drop**
players between teams to fine-tune anything they don't like, then **Save
rosters**. Nothing is locked until the admin starts the Swiss stage.

## 3. Swiss stage

When the admin clicks **Lock rosters & start Swiss**, Round 1 is paired and the
tournament goes live.

- **Default: 5 Swiss rounds** (configurable — see below).
- **Pairing:** each round, teams are ranked by their current record and paired
  against the nearest team they **haven't already played**. The system avoids
  rematches entirely whenever it's mathematically possible.
- **Byes:** with an odd number of teams, the lowest-standing team that hasn't
  had a bye yet gets one each round (counts as a free win).
- **Standings tiebreakers**, in order:
  1. Wins
  2. **Strength of schedule** (Buchholz — the combined win total of the teams
     you've faced)
  3. Game differential (games won minus games lost)
  4. Team seed

## 4. Reporting scores (auto-advancing rounds)

- **Either team in a matchup** (or an admin) can report the final score directly
  on the match card.
- As soon as **every match in a round is reported**, the **next round is paired
  and created automatically**. No admin action needed between rounds.
- After the **final Swiss round** is reported, the tournament flips to
  **"Swiss complete"** and the standings show who qualified.

## 5. Playoffs

- The admin clicks **Generate playoff bracket**. The **top teams by final Swiss
  standings** (default **top 8**) are seeded into a **single-elimination
  bracket**.
- Standard seeding (1 plays the lowest seed, etc.). If the qualifier count isn't
  a power of two, the top seeds get first-round byes.
- Reporting works the same way — when a playoff match is reported, the **winner
  automatically advances** to the next round until a champion is crowned.

---

## Who can do what (permissions)

| Action | Who |
|---|---|
| Enter / drop out | Any Discord-signed-in member |
| Report a match score | Either team in that matchup, or an admin |
| **Auto-generate teams** | **Admins only** |
| **Drag/drop roster editing + Save** | **Admins only** (others see read-only teams) |
| **Start Swiss / Generate playoffs** | **Admins only** |

**Yes — only admins see the auto-generate, start, and playoff buttons, and only
admins can drag players around.** This is enforced two ways: the buttons are
hidden in the UI for non-admins, **and** every team/round/bracket operation is
re-checked on the server, so it can't be triggered by anyone who isn't an admin
even outside the UI. "Admin" = a profile with the `is_admin` flag (the same
league-ops role used elsewhere on the site).

---

## Settings the organizer may want to change

These live on the tournament record and currently default to:

| Setting | Default | What it controls |
|---|---|---|
| `swiss_rounds` | **5** | How many Swiss rounds before playoffs |
| `playoff_cut` | **8** | How many teams make the playoff bracket |
| `best_of` | **5** | Series length label per matchup (Bo5) |
| `starts_at` | (set per week) | Shown on the page + landing CTA |

If the previous Challonge events used a different number of Swiss rounds or a
different playoff cut, those are the two values to confirm. Right now they can be
changed directly on the tournament record; if you'd like a small admin settings
form to edit them from the site, that's a quick add.

---

## Notes / open questions for the organizer

- **Score confirmation:** today the first report from either team is taken as
  final (an admin can correct it). If you want both teams to *confirm* a score
  before it locks (to handle disputes), that's a follow-up we can add.
- **Best-of:** matches store a "best of 5" label but we record the final series
  score as reported — we don't track individual game results within a series.
- **One tournament at a time:** the page shows the most recent tournament. Each
  Friday is a fresh tournament record.
