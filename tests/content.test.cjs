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

test("hero copy stays concise, company-neutral and shared with the terminal", () => {
  const { site, about, projects } = loadContent();

  assert.ok(site.tagline.trim());
  assert.ok(site.specialty.trim());
  assert.ok(site.intro.trim());
  assert.ok(site.intro.split(/\s+/).length <= 55, "Keep the introduction brief");
  assert.equal(about, site.intro);
  for (const project of projects) {
    assert(!site.intro.includes(project.name), "Do not name projects in the introduction");
    assert(!site.intro.includes(project.org), "Keep the introduction company-neutral");
  }
});

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

test("MiTek content uses approved public-facing identifiers", () => {
  const content = loadContent();
  const project = content.projects.find(item => item.org === "MiTek");
  const role = content.experience.find(item => item.org === "MiTek");

  assert.ok(project && role, "Keep the MiTek project and experience");
  assert.equal(project.name, "Structural Fabrication Engine");
  assert.equal(project.kind, "Senior Software Engineer / Team of 5");
  assert.ok(project.summary.startsWith("A manufacturing system that"));
  assert.ok(project.contribution.includes("design, management and manufacturing systems"));
});

test("PTN projects use software engineer roles and retain their team sizes", () => {
  const projects = loadContent().projects.filter(project => project.org === "PTN Global Corp");
  const expected = new Map([
    ["CaptionConnectLive", "Software Engineer / Team of 12"],
    ["Bot App Meeting Assistant", "Software Engineer / Team of 5"],
    ["CCLV3 Desktop App", "Software Engineer / Team of 5"],
    ["Oncall Marketplace", "Software Engineer / Team of 5"],
  ]);

  assert.equal(projects.length, expected.size);
  for (const project of projects) {
    assert.equal(project.kind, expected.get(project.name), `Unexpected role or team size for ${project.name}`);
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

test("desktop uses attributed downloaded PNG icons", () => {
  const directory = path.join(root, "public/desktop");
  const attribution = JSON.parse(readFileSync(path.join(directory, "attribution.json"), "utf8"));
  const names = Object.keys(attribution.icons.files).sort();
  assert.deepEqual(names, ["automator.png", "experience.png", "facetime.png", "github.png", "mail.png", "messages.png", "profile.png", "projects.png", "quicktime.png", "stack.png", "terminal.png", "voice-memos.png"]);
  assert.equal(new URL(attribution.icons.source).hostname, "icon-icons.com");
  assert.ok(attribution.icons.author && attribution.icons.license && attribution.icons.licenseUrl);
  assert.deepEqual(readdirSync(path.join(directory, "icons")).filter(name => name.endsWith(".png")).sort(), names);

  for (const name of names) {
    assert.equal(new URL(attribution.icons.files[name]).hostname, "icon-icons.com");
    const image = readFileSync(path.join(directory, "icons", name));
    assert.equal(image.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", `Invalid PNG: ${name}`);
    assert.equal(image.readUInt32BE(16), 512, `Wrong width: ${name}`);
    assert.equal(image.readUInt32BE(20), 512, `Wrong height: ${name}`);
    assert.ok(image.length < 200_000, `Icon too large: ${name}`);
  }

  const projects = loadContent().projects;
  assert.equal(new Set(projects.map(project => project.icon)).size, projects.length, "Give each project a distinct icon");
  for (const project of projects) {
    assert.ok(attribution.icons.files[`${project.icon}.png`], `Missing icon attribution for ${project.name}`);
  }
});

test("desktop retains the full-resolution wallpaper with a lightweight mobile variant", () => {
  const directory = path.join(root, "public/desktop");
  const attribution = JSON.parse(readFileSync(path.join(directory, "attribution.json"), "utf8"));
  assert.equal(attribution.wallpaper.file, "catalina-6k.webp");
  assert.equal(attribution.wallpaper.mobileFile, "catalina.webp");
  for (const [file, limit] of [[attribution.wallpaper.file, 4_000_000], [attribution.wallpaper.mobileFile, 300_000]]) {
    const image = readFileSync(path.join(directory, file));
    assert.equal(image.subarray(0, 4).toString(), "RIFF");
    assert.equal(image.subarray(8, 12).toString(), "WEBP");
    assert.ok(image.length < limit, `Wallpaper exceeds its transfer budget: ${file}`);
  }
  assert.equal(attribution.wallpaper.source, "User-provided local wallpaper");
  assert.ok(attribution.wallpaper.creator && attribution.wallpaper.changes);
});