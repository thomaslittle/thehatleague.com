// Combine role options. Kept in a plain module (NOT the "use server" action
// file) so client components can import the array — a "use server" module may
// only export async functions, which would proxy this const and break `.map`.
export const COMBINE_ROLES = ["Striker", "Playmaker", "Defender", "Flex"] as const;

export type CombineRole = (typeof COMBINE_ROLES)[number];
