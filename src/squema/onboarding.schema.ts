import { z } from "zod";
import { GENDERS } from "../../types/genders";

export const onboardingSchema = z.object({
  fullName: z
    .string()
    .trim()
    .max(100, "errors.nameMax")
    .optional()
    .or(z.literal("")),

  gender: z.enum(GENDERS).nullable().optional(),

  country: z
    .string()
    .trim()
    .toUpperCase()
    .refine(
      (value) => value === "" || /^[A-Z]{2}$/.test(value),
      "errors.countryInvalid",
    ),

  phone: z
    .string()
    .trim()
    .max(20, "errors.phoneMax")
    .optional()
    .or(z.literal("")),

  notificationsEnabled: z.boolean(),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export type OnboardingSubmitValues = z.output<typeof onboardingSchema>;
