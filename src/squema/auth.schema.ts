import { z } from "zod";

// Los mensajes son claves i18n; la pantalla los traduce con t().
export const loginSchema = z.object({
  email: z.email("errors.emailInvalid"),
  password: z.string().min(6, "errors.passwordMin"),
});

export type LoginForm = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    email: z.email("errors.emailInvalid"),
    password: z.string().min(6, "errors.passwordMin"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "errors.passwordsMismatch",
    path: ["confirmPassword"],
  });

export type SignupForm = z.infer<typeof signupSchema>;
