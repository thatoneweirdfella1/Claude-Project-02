import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import ts from "typescript";

const root = process.cwd();
const normalize = (path: string) => relative(root, path).replaceAll("\\", "/");
function sources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sources(path) : /\.[cm]?[jt]sx?$/.test(path) && !/\.(test|spec)\./.test(path) ? [path] : [];
  });
}

// Report file/rule only: never print a matched key or other source contents.
const forbidden = [
  ["payment provider import", /(?:from\s*|import\s*\(|require\s*\()?["'](?:@stripe\/[^"']*|stripe|paypal[^"']*|@paypal\/[^"']*|@paddle\/[^"']*|paddle[^"']*|adyen[^"']*|@adyen\/[^"']*|braintree[^"']*|square|squareup|razorpay|mollie[^"']*)["']/i],
  ["payment credential", /\b(?:STRIPE|PAYPAL|PADDLE|ADYEN|BRAINTREE|SQUARE|RAZORPAY)_[A-Z_]*(?:KEY|SECRET|TOKEN)\b|\b[sp]k_(?:live|test)_[A-Za-z0-9]+/i],
  ["payment URL", /https?:\/\/(?:[^\s"'`/]*\.)?(?:stripe\.com|paypal\.com|paypalobjects\.com|paddle\.com|adyen\.com|braintreegateway\.com|squareup\.com|checkout\.com|razorpay\.com|mollie\.com)(?:[/:]|\b)|https?:\/\/[^\s"'`]*(?:\/checkout|\/payments?|\/billing)(?:[/?#"'`]|$)/i],
  ["live checkout path", /["'`]\/?api\/(?:[^"'`]*\/)?(?:checkout|payments?|billing|webhooks?\/(?:stripe|paypal))\b/i],
] as const;
const network = /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|axios|https?\.request|https?\.get)\s*(?:\(|\.)|\bimport\s*\(|https?:\/\/|\b(?:window\.)?open\s*\(|\blocation\.(?:href|assign|replace)\b|<(?:iframe|form)\b/i;
function violations(text: string): string[] {
  return forbidden.filter(([, pattern]) => pattern.test(text)).map(([label]) => label);
}

const paymentRoots = [
  "src/services/payment.ts", "src/services/moneySafety.ts", "src/services/moneyRuntime.ts",
  "src/components/settings/InteractivePlanControls.tsx", "src/components/credits/SubscriptionUI.tsx",
];
function modules(text: string, path: string): string[] {
  const result: string[] = [];
  const visit = (node: ts.Node) => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) result.push(node.moduleSpecifier.text);
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === "require"))) {
      const argument = node.arguments[0];
      if (argument && ts.isStringLiteral(argument)) result.push(argument.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true));
  return result;
}
function paymentGraph(): string[] {
  const found = new Set<string>();
  const visit = (path: string) => {
    if (found.has(path)) return;
    found.add(path);
    const text = readFileSync(path, "utf8");
    for (const specifier of modules(text, path).filter((module) => module.startsWith("."))) {
      const base = resolve(dirname(path), specifier);
      const dependency = [base, ...[".ts", ".tsx", ".js", "/index.ts", "/index.tsx"].map((suffix) => base + suffix)].find((candidate) => existsSync(candidate) && /\.[jt]sx?$/.test(candidate));
      expect(dependency, `unresolved payment dependency in ${normalize(path)}`).toBeDefined();
      if (dependency) visit(dependency);
    }
  };
  paymentRoots.forEach((path) => visit(resolve(root, path)));
  return [...found].sort();
}

describe("M6: checkout stays a sandbox", () => {
  it("has no payment credentials, provider integration, payment URL or live checkout route in application code", () => {
    const files = [...sources(join(root, "src")), ...sources(join(root, "api")), join(root, "package.json"), join(root, "package-lock.json")].sort();
    const failures: string[] = [];
    for (const path of files) {
      console.info(`M6 GLOBAL SCAN: ${normalize(path)}`);
      failures.push(...violations(readFileSync(path, "utf8")).map((rule) => `${normalize(path)}: ${rule}`));
      if (normalize(path).startsWith("api/") && /(?:checkout|payment|billing|stripe|paypal)/i.test(normalize(path))) failures.push(`${normalize(path)}: live payment route filename`);
    }
    expect(failures).toEqual([]);
  });

  it("has no network operation anywhere in the payment path's local dependency graph", () => {
    const failures: string[] = [];
    for (const path of paymentGraph()) {
      console.info(`M6 PAYMENT GRAPH: ${normalize(path)}`);
      const text = readFileSync(path, "utf8");
      if (network.test(text)) failures.push(normalize(path));
      // An indirect network client cannot enter the payment graph unnoticed.
      for (const module of modules(text, path).filter((module) => !module.startsWith("."))) {
        expect(["react", "lucide-react", "zustand", "idb"], `external payment dependency in ${normalize(path)}`).toContain(module);
      }
    }
    expect(failures).toEqual([]);
  });

  it("detects inert examples of provider imports, credential names, checkout URLs, routes and network clients", () => {
    for (const text of ['import Stripe from "stripe";', "process.env.STRIPE_SECRET_KEY", 'const url = "https://checkout.stripe.com/inert";', 'const route = "/api/checkout";']) expect(violations(text).length).toBeGreaterThan(0);
    for (const text of ['fetch("/anything")', 'new XMLHttpRequest()', 'navigator.sendBeacon("/anything")', 'import("./remote")', 'window.open("/checkout")']) expect(network.test(text)).toBe(true);
  });
});
