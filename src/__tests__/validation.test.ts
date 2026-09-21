import { loginSchema, signupSchema } from "@/squema/auth.schema";
import { onboardingSchema } from "@/squema/onboarding.schema";
import en from "@/locales/en.json";
import es from "@/locales/es.json";

const firstMessage = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.error?.issues[0].message;

const keys = (obj: object, prefix = ""): string[] =>
  Object.entries(obj).flatMap(([k, v]) =>
    typeof v === "object" ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );

describe("auth schemas", () => {
  it("accepts valid login", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "123456" }).success).toBe(true);
  });

  it("returns i18n keys as messages", () => {
    expect(firstMessage(loginSchema.safeParse({ email: "x", password: "123456" }))).toBe("errors.emailInvalid");
    expect(firstMessage(loginSchema.safeParse({ email: "a@b.co", password: "123" }))).toBe("errors.passwordMin");
    expect(
      firstMessage(signupSchema.safeParse({ email: "a@b.co", password: "123456", confirmPassword: "654321" })),
    ).toBe("errors.passwordsMismatch");
  });
});

describe("onboarding schema", () => {
  const base = { fullName: "", gender: null, country: "", phone: "", notificationsEnabled: true };

  it("accepts empty optional fields", () => {
    expect(onboardingSchema.safeParse(base).success).toBe(true);
  });

  it("returns i18n key for bad country", () => {
    expect(firstMessage(onboardingSchema.safeParse({ ...base, country: "COL" }))).toBe("errors.countryInvalid");
  });
});

describe("locales", () => {
  it("en and es have the same keys", () => {
    expect(keys(es).sort()).toEqual(keys(en).sort());
  });

  it("every schema message key exists", () => {
    const all = keys(en);
    ["errors.emailInvalid", "errors.passwordMin", "errors.passwordsMismatch", "errors.nameMax",
      "errors.phoneMax", "errors.countryInvalid"].forEach((k) => expect(all).toContain(k));
  });
});
