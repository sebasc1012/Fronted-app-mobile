import fs from "fs";
import path from "path";

// HU-05b: los colores salen de src/constants/colors.json. Se excluyen los tokens y los
// logos de marca (icons/), que deben conservar sus colores oficiales.
const SRC = path.join(__dirname, "..");
const ALLOWED = [path.join("constants", "colors."), path.join("components", "ui", "icons")];
const LOOSE_COLOR =
  /\b(?:bg|text|border|fill|stroke|ring|divide|placeholder)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})\b|#[0-9A-Fa-f]{3,8}\b|rgba?\(/g;

const files = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "__tests__" ? [] : files(full);
    return /\.(tsx?|jsx?)$/.test(entry.name) ? [full] : [];
  });

it("there are no palette classes or loose hex colors outside the tokens", () => {
  const found = files(SRC)
    .filter((file) => !ALLOWED.some((allowed) => file.includes(allowed)))
    .flatMap((file) =>
      fs
        .readFileSync(file, "utf8")
        .split("\n")
        .flatMap((line, i) =>
          (line.match(LOOSE_COLOR) ?? []).map((match) => `${path.relative(SRC, file)}:${i + 1} ${match}`),
        ),
    );
  expect(found).toEqual([]);
});
