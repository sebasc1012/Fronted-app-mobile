import { contrastRatio, palettes, resolvePalette, type Palette } from "../colors";

jest.mock("nativewind", () => ({ vars: (v: object) => v }));
jest.mock("../../../lib/preferences", () => ({ usePreferences: () => ({ highContrast: false }) }));

type Pair = [foreground: keyof Palette, background: keyof Palette];

// Texto sobre fondo: WCAG AA texto normal (≥ 4.5:1).
const TEXT_PAIRS: Pair[] = [
  ["text", "background"], ["text", "surface"], ["text", "surface-strong"],
  ["text-muted", "background"], ["text-muted", "surface"], ["text-muted", "surface-strong"],
  ["primary", "background"], ["primary", "surface"],
  ["danger", "background"], ["danger", "surface"],
  ["on-primary", "primary"], ["on-danger", "danger"],
];
// Íconos y bordes de controles: WCAG AA componentes de interfaz (≥ 3:1).
const UI_PAIRS: Pair[] = [
  ["border", "background"], ["border", "surface"],
  ["primary", "surface"], ["text-muted", "surface"], ["on-overlay", "overlay"],
];
// Pantallas de auth: diseño claro fijo sobre fondo beige/crema y campos blancos.
const AUTH_TEXT_PAIRS: Pair[] = [
  ["brand-ink", "brand-sand"], ["brand-ink", "brand-cream"], ["brand-ink", "background"],
  ["text-muted", "brand-sand"], ["text-muted", "background"],
  ["primary", "brand-sand"], ["danger", "brand-sand"], ["on-primary", "brand-accent"],
];
const AUTH_UI_PAIRS: Pair[] = [["border", "brand-sand"], ["primary", "background"], ["danger", "background"]];

type PaletteName = keyof typeof palettes;
const cases = (pairs: Pair[], schemes: PaletteName[]) =>
  schemes.flatMap((scheme) => pairs.map(([fg, bg]) => [`${fg} / ${bg} (${scheme})`, palettes[scheme][fg], palettes[scheme][bg]]));

describe("contrastRatio", () => {
  it("matches the WCAG reference values", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21);
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21);
    expect(contrastRatio("#4F46E5", "#4F46E5")).toBe(1);
  });
});

describe("resolvePalette", () => {
  it("returns the right palette for the 4 combinations", () => {
    expect(resolvePalette("light", false)).toBe(palettes.light);
    expect(resolvePalette("dark", false)).toBe(palettes.dark);
    expect(resolvePalette("light", true)).toBe(palettes.lightHC);
    expect(resolvePalette("dark", true)).toBe(palettes.darkHC);
  });
});

describe("high contrast (HU-07, WCAG AAA)", () => {
  it.each(cases(TEXT_PAIRS, ["lightHC", "darkHC"]).concat(cases(AUTH_TEXT_PAIRS, ["lightHC"])))(
    "text %s ≥ 7:1",
    (_name, fg, bg) => expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(7),
  );

  it.each(cases(UI_PAIRS, ["lightHC", "darkHC"]).concat(cases(AUTH_UI_PAIRS, ["lightHC"])))(
    "icon/border %s ≥ 4.5:1",
    (_name, fg, bg) => expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5),
  );
});

describe("token contrast", () => {
  it.each(cases([...TEXT_PAIRS], ["light", "dark"]).concat(cases(AUTH_TEXT_PAIRS, ["light"])))(
    "text %s ≥ 4.5:1",
    (_name, fg, bg) => expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5),
  );

  it.each(cases(UI_PAIRS, ["light", "dark"]).concat(cases(AUTH_UI_PAIRS, ["light"])))(
    "icon/border %s ≥ 3:1",
    (_name, fg, bg) => expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(3),
  );
});
