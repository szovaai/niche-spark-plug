import { describe, it, expect } from "vitest";
import { nextBestAction, stageIndexFromProgress } from "./businessHQ";

describe("stageIndexFromProgress", () => {
  it("maps progress to Discover→Grow", () => {
    expect(stageIndexFromProgress(0)).toBe(0);
    expect(stageIndexFromProgress(20)).toBe(1);
    expect(stageIndexFromProgress(99)).toBe(5);
    expect(stageIndexFromProgress(100)).toBe(5);
  });
});

describe("nextBestAction", () => {
  const base = { hasProject: true, projectId: "p1", pendingApprovals: 0, failedTasks: 0 };
  it("asks to choose an idea when there is no business", () => {
    expect(nextBestAction({ ...base, hasProject: false }).label).toBe("Choose your business idea");
  });
  it("puts approvals before failed tasks", () => {
    expect(nextBestAction({ ...base, pendingApprovals: 2, failedTasks: 1 }).href).toBe("#approvals");
  });
  it("puts failed tasks before continuing", () => {
    expect(nextBestAction({ ...base, failedTasks: 1 }).label).toBe("Fix 1 failed task");
  });
  it("continues the current mission otherwise", () => {
    expect(nextBestAction({ ...base, currentMissionId: "m3", currentMissionLabel: "Concept" }).href).toBe("/project/p1/m/m3");
  });
});
