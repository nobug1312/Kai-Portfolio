const assert = require("node:assert/strict");
const { existsSync, readFileSync, readdirSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const contentPath = path.join(root, "lib/content.ts");
const compiledContent = ts.transpileModule(readFileSync(contentPath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function loadContent(environment = {}) {
  const exports = {};
  vm.runInNewContext(compiledContent, { exports, process: { env: environment } }, { filename: contentPath });
  return exports;
}

const iconPath = path.join(root, "components/SkillIcon.tsx");
const iconSource = ts.createSourceFile(iconPath, readFileSync(iconPath, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

function readIconMap(name) {
  const declaration = iconSource.statements
    .filter(ts.isVariableStatement)
    .flatMap(statement => [...statement.declarationList.declarations])
    .find(item => ts.isIdentifier(item.name) && item.name.text === name);

  assert.ok(declaration && ts.isObjectLiteralExpression(declaration.initializer), `Missing ${name} icon map`);
  return new Map(declaration.initializer.properties.map(property => {
    assert.ok(ts.isPropertyAssignment(property), `Unexpected property in ${name}`);
    assert.ok(ts.isIdentifier(property.name) || ts.isStringLiteral(property.name), `Unexpected icon name in ${name}`);
    return [property.name.text, property.initializer];
  }));
}

test("site URL resolves local, preview, production and explicit overrides", () => {
  const cases = [
    [{}, "http://localhost:3000"],
    [{ VERCEL_URL: "preview.example.com" }, "https://preview.example.com"],
    [{ VERCEL_PROJECT_PRODUCTION_URL: "production.example.com", VERCEL_URL: "preview.example.com" }, "https://production.example.com"],
    [{ NEXT_PUBLIC_SITE_URL: "https://custom.example.com", VERCEL_PROJECT_PRODUCTION_URL: "production.example.com" }, "https://custom.example.com"],
  ];

  for (const [environment, expected] of cases) {
    const actual = loadContent(environment).site.url;
    assert.equal(actual, expected);
    assert.ok(new URL(actual));
  }
});

test("every skill has an explicit icon and every mapped logo exists", () => {
  const names = [...loadContent().skills.flatMap(group => group.items)];
  const logos = readIconMap("logos");
  const symbols = readIconMap("symbols");
  assert.equal(new Set(names).size, names.length, "Duplicate skill label");
  assert.deepEqual([...logos.keys(), ...symbols.keys()].sort(), names.sort());

  for (const [name, expression] of logos) {
    assert.ok(ts.isStringLiteral(expression), `Invalid logo path for ${name}`);
    assert.ok(existsSync(path.join(root, "public/icons", `${expression.text}.svg`)), `Missing logo for ${name}`);
  }
});

test("public icon inventory has no unused SVGs", () => {
  const iconDirectory = path.join(root, "public/icons");
  const used = new Set([
    ...[...readIconMap("logos").values()].map(expression => `${expression.text}.svg`),
    "devicon/github.svg",
    "devicon/linkedin.svg",
  ]);

  for (const file of readdirSync(iconDirectory, { recursive: true })) {
    if (!file.endsWith(".svg")) continue;
    const relativePath = file.split(path.sep).join("/");
    assert.ok(used.has(relativePath), `Unused public icon: ${relativePath}`);
  }
  assert.ok(existsSync(path.join(iconDirectory, "devicon/LICENSE.txt")), "Keep the vendored icon license");
});