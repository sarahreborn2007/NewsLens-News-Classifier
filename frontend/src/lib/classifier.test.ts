import { describe, expect, it } from "vitest";
import { normalizeModelResponse, sampleClassify } from "./classifier";

describe("normalizeModelResponse", () => {
  it("maps a 'fake' label to the fake verdict", () => {
    expect(normalizeModelResponse({ label: "FAKE", confidence: 0.91 }).verdict).toBe("fake");
  });
  it("maps a 'real' label to the real verdict", () => {
    expect(normalizeModelResponse({ prediction: "real", score: 0.8 }).verdict).toBe("real");
  });
  it("reads percentage confidence as a fraction", () => {
    expect(normalizeModelResponse({ label: "real", confidence: 87 }).confidence).toBeCloseTo(0.87);
  });
  it("falls back to uncertain for unknown labels", () => {
    expect(normalizeModelResponse({ label: "maybe" }).verdict).toBe("uncertain");
  });
});

describe("sampleClassify", () => {
  it("flags sensational clickbait as fake", () => {
    expect(sampleClassify("SHOCKING miracle cure they don't want you to know!!!").verdict).toBe("fake");
  });
  it("treats attributed, dated reporting as real", () => {
    expect(
      sampleClassify("The ministry confirmed on Monday that inflation fell to 3.2 percent, according to officials.").verdict,
    ).toBe("real");
  });
});
