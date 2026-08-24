import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

function filesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : /\.tsx$/.test(entry.name) ? [path] : [];
  });
}

function attributeNames(node: ts.JsxOpeningLikeElement): Set<string> {
  return new Set(node.attributes.properties.flatMap((property) => ts.isJsxAttribute(property) ? [property.name.getText()] : ["..."]));
}

describe("Layer 2 visible-control contract", () => {
  it("gives every native button a handler, submit action, or disabled state", () => {
    const failures: string[] = [];
    for (const file of [...filesUnder("src/components"), ...filesUnder("src/screens")]) {
      const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const visit = (node: ts.Node) => {
        if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText() === "button") {
          const names = attributeNames(node);
          const type = node.attributes.properties.find((property) => ts.isJsxAttribute(property) && property.name.getText() === "type");
          const submits = type && ts.isJsxAttribute(type) && type.initializer?.getText().includes("submit");
          if (!names.has("onClick") && !names.has("disabled") && !names.has("...") && !submits) {
            const position = source.getLineAndCharacterOfPosition(node.getStart());
            failures.push(`${file}:${position.line + 1}`);
          }
        }
        if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText() === "a") {
          const names = attributeNames(node);
          if (!names.has("href") && !names.has("onClick")) {
            const position = source.getLineAndCharacterOfPosition(node.getStart());
            failures.push(`${file}:${position.line + 1} anchor`);
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
    }
    expect(failures).toEqual([]);
  });
});
