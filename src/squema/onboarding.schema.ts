import { z } from "zod";
import { GENDERS } from "../../types/genders";

export const onboardingSchema = z.object({
  fullName: z
    .string()
    .trim()
    .max(100, "El nombre no puede superar los 100 caracteres")
    .optional()
    .or(z.literal("")),

  gender: z.enum(GENDERS).nullable().optional(),

  country: z
    .string()
    .trim()
    .toUpperCase()
    .refine(
      (value) => value === "" || /^[A-Z]{2}$/.test(value),
      "Ingresa un código de país válido de 2 letras",
    ),

  phone: z
    .string()
    .trim()
    .max(20, "El teléfono no puede superar los 20 caracteres")
    .optional()
    .or(z.literal("")),

  notificationsEnabled: z.boolean(),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export type OnboardingSubmitValues = z.output<typeof onboardingSchema>;
