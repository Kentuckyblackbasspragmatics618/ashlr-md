import { describe, expect, it } from "vitest";
import { wrapRichTextBody } from "./copyRichText";
import { cloneWithoutInjectedChrome } from "./export";

describe("cloneWithoutInjectedChrome", () => {
  it("strips the injected review card but keeps document content", () => {
    const body = document.createElement("div");
    body.className = "markdown-body";
    body.innerHTML =
      '<aside class="review-card">SUMMARY</aside><h1>Real Title</h1><p>Body text</p>';
    const cleaned = cloneWithoutInjectedChrome(body);
    expect(cleaned.querySelector(".review-card")).toBeNull();
    expect(cleaned.innerHTML).toContain("<h1>Real Title</h1>");
    expect(cleaned.innerHTML).toContain("Body text");
    // The original element is untouched (we clone, not mutate in place).
    expect(body.querySelector(".review-card")).not.toBeNull();
  });

  it("is a no-op for a body with no injected chrome", () => {
    const body = document.createElement("div");
    body.innerHTML = "<h1>Doc</h1><p>x</p>";
    expect(cloneWithoutInjectedChrome(body).innerHTML).toBe("<h1>Doc</h1><p>x</p>");
  });
});

describe("wrapRichTextBody", () => {
  it("wraps body markup in an inline-styled div", () => {
    const html = wrapRichTextBody("<h1>Title</h1><p>Hello <strong>world</strong></p>");
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<strong>world</strong>");
    expect(html.startsWith('<div style="')).toBe(true);
    expect(html.endsWith("</div>")).toBe(true);
    // Inline typographic styles travel with the wrapper for style-stripping clients.
    expect(html).toContain("font-family");
  });

  it("preserves rich constructs verbatim: lists, links, code, and tables", () => {
    const body = [
      "<ul><li>one</li><li>two</li></ul>",
      '<a href="https://example.com">link</a>',
      "<pre><code>const a = 1;</code></pre>",
      "<table><thead><tr><th>h</th></tr></thead><tbody><tr><td>c</td></tr></tbody></table>",
    ].join("");
    const html = wrapRichTextBody(body);
    expect(html).toContain("<ul><li>one</li><li>two</li></ul>");
    expect(html).toContain('<a href="https://example.com">link</a>');
    expect(html).toContain("<code>const a = 1;</code>");
    expect(html).toContain("<td>c</td>");
  });

  it("returns an empty string when the body is empty or whitespace", () => {
    expect(wrapRichTextBody("")).toBe("");
    expect(wrapRichTextBody("   \n  ")).toBe("");
  });

  it("trims surrounding whitespace before wrapping", () => {
    expect(wrapRichTextBody("\n  <p>x</p>\n")).toBe(wrapRichTextBody("<p>x</p>"));
  });
});
