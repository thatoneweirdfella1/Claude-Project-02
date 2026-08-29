/* Step 7.4 verification — variable name validation, $name substitution, and
   the session-over-account merge precedence. Pure functions, no store. */

import { describe, expect, it } from "vitest";
import { isValidVariableName, mergeVariables, substituteVariables } from "./variables";

describe("isValidVariableName", () => {
  it("accepts letters, digits, underscores, not starting with a digit", () => {
    expect(isValidVariableName("project_name")).toBe(true);
    expect(isValidVariableName("_private")).toBe(true);
    expect(isValidVariableName("v2")).toBe(true);
    expect(isValidVariableName("A")).toBe(true);
  });

  it("rejects a name starting with a digit", () => {
    expect(isValidVariableName("2fast")).toBe(false);
  });

  it("rejects names with spaces, dashes, or other punctuation", () => {
    expect(isValidVariableName("project name")).toBe(false);
    expect(isValidVariableName("project-name")).toBe(false);
    expect(isValidVariableName("project.name")).toBe(false);
    expect(isValidVariableName("$project")).toBe(false); // the $ is a substitution marker, not part of the name
  });

  it("rejects an empty name", () => {
    expect(isValidVariableName("")).toBe(false);
  });
});

describe("substituteVariables", () => {
  it("replaces a single $name with its value", () => {
    expect(substituteVariables("Summarize $project's roadmap", { project: "Divergence.AI" })).toBe(
      "Summarize Divergence.AI's roadmap",
    );
  });

  it("replaces multiple distinct variables in one pass", () => {
    const text = "Compare $a and $b for the $team project.";
    const result = substituteVariables(text, { a: "Plan X", b: "Plan Y", team: "core" });
    expect(result).toBe("Compare Plan X and Plan Y for the core project.");
  });

  it("replaces every occurrence of the same variable", () => {
    expect(substituteVariables("$name and $name again", { name: "Sam" })).toBe("Sam and Sam again");
  });

  it("leaves an UNMATCHED $name exactly as typed — never blanks or drops it", () => {
    expect(substituteVariables("What about $unknown?", {})).toBe("What about $unknown?");
  });

  it("leaves plain text with no $ tokens completely unchanged", () => {
    expect(substituteVariables("nothing to substitute here", { a: "x" })).toBe(
      "nothing to substitute here",
    );
  });

  it("is case-sensitive", () => {
    expect(substituteVariables("$Name vs $name", { name: "lower" })).toBe("$Name vs lower");
  });

  it("does not treat a bare $ (no following identifier) as a token", () => {
    expect(substituteVariables("cost: $5.00", { "5": "five" })).toBe("cost: $5.00");
  });

  it("substitutes an empty string as a legitimate value (not treated as unset)", () => {
    expect(substituteVariables("before $x after", { x: "" })).toBe("before  after");
  });
});

describe("mergeVariables", () => {
  it("session variables win over account variables for the same name", () => {
    const merged = mergeVariables({ project: "old", client: "Acme" }, { project: "new" });
    expect(merged).toEqual({ project: "new", client: "Acme" });
  });

  it("returns account variables untouched when session has none", () => {
    expect(mergeVariables({ a: "1" }, {})).toEqual({ a: "1" });
  });

  it("returns session variables untouched when account has none", () => {
    expect(mergeVariables({}, { a: "1" })).toEqual({ a: "1" });
  });
});
