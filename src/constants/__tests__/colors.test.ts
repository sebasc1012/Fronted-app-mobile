import { contrastRatio, palettes, type Palette } from "../colors";

jest.mock("nativewind", () => ({ vars: (v: object) => v }));

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

const cases = (pairs: Pair[], schemes: (keyof typeof palettes)[]) =>
  schemes.flatMap((scheme) => pairs.map(([fg, bg]) => [`${fg} / ${bg} (${scheme})`, palettes[scheme][fg], palettes[scheme][bg]]));

describe("contrastRatio", () => {
  it("matches the WCAG reference values", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21);
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21);
    expect(contrastRatio("#4F46E5", "#4F46E5")).toBe(1);
  });
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
