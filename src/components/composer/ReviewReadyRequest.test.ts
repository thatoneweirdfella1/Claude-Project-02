import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ReviewReadyRequest } from "./ReviewReadyRequest";

const destination = { providerId: "universal", modelId: "universal" } as const;

describe("ReviewReadyRequest terminal actions", () => {
  it("labels a no-review manual route as Copy & Open, not as already handed off", () => {
    const markup = renderToStaticMarkup(createElement(ReviewReadyRequest, {
      initialText: "Prepared request",
      originalText: "Original request",
      destination,
      reviewRequired: false,
      onCancel: () => {},
      onHandoff: () => {},
    }));

    expect(markup).toContain("Copy &amp; Open AI-ready request");
    expect(markup).toContain("Copy &amp; Choose AI");
    expect(markup).not.toContain("Send to AI");
  });

  it("keeps the connected paid route as explicit Review first", () => {
    const markup = renderToStaticMarkup(createElement(ReviewReadyRequest, {
      mode: "send",
      initialText: "Prepared request",
      originalText: "Original request",
      destination,
      onCancel: () => {},
      onSend: () => {},
    }));

    expect(markup).toContain("Review AI-ready request");
    expect(markup).toContain("Send automatically next time");
    expect(markup).toContain("Send to AI");
  });
});
