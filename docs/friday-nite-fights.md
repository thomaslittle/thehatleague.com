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
- Team seeding uses each player's **current 2v2 rank** (read live, so if someone
  updates their rank before teams are generated it's reflected). If their 2v2
  rank is Unranked, we fall back to their peak rank.
- Players can **drop out** any time before the admin generates teams. Once teams
  are generated, registration is locked (the admin can reopen it — see Reset).

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
  on a "Bench" the admin can place by hand (find a sub, or move them onto a
  team).

**Manual override:** after auto-generating, the admin can **drag and drop**
players between teams to fine-tune anything they don't like, then **Save
rosters**. They can also **Re-generate** to reshuffle. Nothing is locked until
the admin starts the Swiss stage.

## 3. Swiss stage — fixed 2-game series, 3-1-0 points

When the admin clicks **Lock rosters & start Swiss**, Round 1 is paired and the
tournament goes live.

- Each Swiss matchup is a **fixed 2-game series** (configurable) — both games
  are always played; there's no "best of." Scoring is **3-1-0**:
  - **2-0 sweep → 3 points** to the winner, 0 to the loser.
  - **1-1 split → 1 point each** (a draw — fully supported, no winner needed).
- **Default: 5 Swiss rounds** (configurable).
- **Pairing:** each round, teams are ranked by current points and paired against
  the nearest team they **haven't already played**. The system avoids rematches
  entirely whenever it's mathematically possible.
- **Byes:** with an odd number of teams, the lowest-standing team that hasn't had
  a bye yet gets one each round (counts as a 3-point win; no team gets two byes
  while another has none).
- **Standings tiebreakers**, in order:
  1. **Points** (3-1-0)
  2. Game differential (games won minus games lost)
  3. **Strength of schedule** (Buchholz — combined points of the teams you've
     faced)
  4. Team seed

## 4. Reporting scores (auto-advancing rounds)

- **Either team in a matchup** (or an admin) can report the series result on the
  match card. Swiss results can be **2-0, 1-1, or 0-2**.
- As soon as **every match in a round is reported**, the **next round is paired
  and created automatically**. No admin action needed between rounds.
- After the **final Swiss round**, the tournament flips to **"Swiss complete"**
  and the standings show who qualified.
- **Once a result is submitted it locks.** A player can't silently change it
  afterward (the round may have already advanced) — only an admin can correct a
  reported match.

## 5. Playoffs — best-of bracket

- The admin clicks **Generate playoff bracket**. The **top teams by final Swiss
  standings** (default **top 8**) are seeded into a **single-elimination
  bracket**.
- Playoffs are **best-of** (a winner is required — no draws):
  - **Playoff rounds:** default **best of 3**.
  - **Final:** its own setting, default **best of 3** (set it higher, e.g. Bo5,
    for a longer championship).
- Standard seeding (1 plays the lowest seed, etc.). If the qualifier count isn't
  a power of two, the top seeds get first-round byes.
- Reporting works the same way — when a playoff match is reported, the **winner
  automatically advances** until a champion is crowned.

## 6. Reset / undo (the "oh no" button)

If anything looks wrong at any point — bad team generation, a wrong start, a
broken bracket — the admin can **Reset** from the League ops panel. Reset:

- Clears the generated teams and **every match** (Swiss + playoffs), and
  **reopens registration**.
- **Keeps all the signups**, so you can immediately **Auto-generate** again from
  scratch.
- Asks for confirmation first, and is admin-only.

This is the safety net: nothing about a live tournament is unrecoverable.

---

## Who can do what (permissions)

| Action | Who |
|---|---|
| Enter / drop out | Any Discord-signed-in member |
| Report a match score (first time) | Either team in that matchup, or an admin |
| Correct an already-reported match | **Admins only** |
| **Auto-generate / re-generate teams** | **Admins only** |
| **Drag/drop roster editing + Save** | **Admins only** (others see read-only teams) |
| **Start Swiss / Generate playoffs / Reset** | **Admins only** |
| **Change settings** | **Admins only** |

Only admins see the League ops controls and settings. This is enforced two ways:
the buttons are hidden in the UI for non-admins, **and** every team / round /
bracket / reset / settings operation is re-checked on the server, so it can't be
triggered by anyone who isn't an admin even outside the UI. "Admin" = a profile
with the `is_admin` flag (the same league-ops role used elsewhere on the site).

---

## Settings (admin → League ops → Settings)

The **Settings** button opens a dialog. All values default sensibly and can be
changed any time (changes apply going forward):

| Setting | Default | What it controls |
|---|---|---|
| Name | "Friday Nite Fights" | Tournament name |
| Swiss rounds | **5** | How many Swiss rounds before the cut |
| Swiss games / series | **2** | Games each Swiss match plays (the 2-0 / 1-1 series) |
| Playoff best of | **3** | Series length for playoff rounds |
| Finals best of | **3** | Series length for the championship match |
| Playoff cut | **8** | How many teams make the playoff bracket |
| Starts at | (set per week) | Start time — **the admin sets it in their own local time; every player sees it converted to theirs** |

---

## Notes for the organizer

- **Score confirmation:** the first report from either team is taken as final
  (locked; an admin can correct it). If you later want both teams to *confirm* a
  score before it locks, that's a follow-up we can add.
- **What we record:** the series result (e.g. 2-0 or 1-1 in Swiss, 2-1 in a
  Bo3), not individual goal counts within each game.
- **One tournament at a time:** the page shows the most recent tournament. Each
  Friday is a fresh tournament record.
- **Smoke test:** a full end-to-end test (`pnpm fnf:smoke`, with
  `FNF_SMOKE_DB_URL` set) runs mock tournaments through every path — draws,
  byes, rematch avoidance, the no-tie / no-double-report guards, playoffs, and
  reset — without touching real data. Run it after any change.
