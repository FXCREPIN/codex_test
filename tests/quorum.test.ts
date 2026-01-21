import { describe, expect, it } from "vitest";
import { requiredQuorum, quorumStatus } from "@/lib/quorum";

describe("quorum", () => {
  it("ceil to 70%", () => {
    expect(requiredQuorum(10)).toBe(7);
    expect(requiredQuorum(9)).toBe(7);
    expect(requiredQuorum(1)).toBe(1);
  });

  it("flags when quorum is met", () => {
    expect(quorumStatus(7, 10).ok).toBe(true);
    expect(quorumStatus(6, 10).ok).toBe(false);
  });
});
