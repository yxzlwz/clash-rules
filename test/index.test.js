import assert from "node:assert/strict";
import test from "node:test";
import { renderConfig } from "../src/render.js";

const template = "proxy-providers:\n  $$NAME$$:\n    url: '$$URL$$'\n    path: ./providers/$$NAME$$.yaml\n";

test("replaces provider name and URL", () => {
  const output = renderConfig(template, "my_airport", "https://example.com/sub?token=a&foo=b");
  assert.match(output, /my_airport:/);
  assert.match(output, /url: 'https:\/\/example\.com\/sub\?token=a&foo=b'/);
  assert.match(output, /path: \.\/providers\/my_airport\.yaml/);
  assert.doesNotMatch(output, /\$\$NAME\$\$|\$\$URL\$\$/);
});

test("rejects unsafe name and non-HTTP URL", () => {
  assert.throws(() => renderConfig(template, "bad: name", "https://example.com/sub"));
  assert.throws(() => renderConfig(template, "airport", "file:///etc/passwd"));
});
