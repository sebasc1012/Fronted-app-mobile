export const GENDERS = [
  "MALE",
  "FEMALE",
  "OTHER",
  "PREFER_NOT_TO_SAY",
] as const;

export type Gender = (typeof GENDERS)[number];
