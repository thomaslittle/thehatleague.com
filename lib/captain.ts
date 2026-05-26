/**
 * Shared captain-application constants. Both the server action that
 * validates the pitch and the client form that renders the live counter
 * import from here — keeping the bounds in one place prevents the two
 * sides from drifting (e.g. server tightens the cap and the counter still
 * shows the old number).
 */

export const CAPTAIN_PITCH_MIN = 40;
export const CAPTAIN_PITCH_MAX = 1200;
