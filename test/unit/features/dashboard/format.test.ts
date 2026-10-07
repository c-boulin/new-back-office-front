import { describe, it, expect } from "vitest";
import { activitySentence, chartSeries, formatVariation } from "@/features/dashboard/format";
import type { RecentActivityItem } from "@/features/dashboard/types";

const actor = { id: 1, name: "Alice", initials: "A" };
const target = { id: 2, name: "Bruno", initials: "B" };

function item(type: RecentActivityItem["type"], withTarget: boolean): RecentActivityItem {
  return { id: "x", type, occurredAt: "2026-10-07T10:00:00Z", actor, target: withTarget ? target : null };
}

describe("formatVariation", () => {
  it("multiplies the ratio by 100 with one decimal and a sign", () => {
    expect(formatVariation(-0.041, "No change")).toEqual({ direction: "down", label: "-4.1%" });
    expect(formatVariation(0.053, "No change")).toEqual({ direction: "up", label: "+5.3%" });
  });

  it("treats zero as flat with the no-change label", () => {
    expect(formatVariation(0, "No change")).toEqual({ direction: "flat", label: "No change" });
  });
});

describe("chartSeries", () => {
  const series = [{ date: "2026-10-01", count: 3 }];

  it("prefers activeUsers.series", () => {
    expect(
      chartSeries({
        sessions: { value: 1, variation: 0, series: [{ date: "2026-10-01", count: 9 }] },
        activeUsers: { value: 1, variation: 0, series },
      }),
    ).toBe(series);
  });

  it("falls back to the first KPI with a non-empty series", () => {
    expect(
      chartSeries({
        activeUsers: { value: 1, variation: 0, series: [] },
        matches: { value: 1, variation: 0, series },
      }),
    ).toBe(series);
  });

  it("returns an empty series when nothing is available", () => {
    expect(chartSeries({ activeUsers: { value: 1, variation: 0, series: [] } })).toEqual([]);
  });
});

describe("activitySentence", () => {
  it("includes the target when present", () => {
    expect(activitySentence(item("match", true))).toEqual({
      key: "activity.match",
      values: { actor: "Alice", target: "Bruno" },
    });
  });

  it("uses the NoTarget variant when target is null", () => {
    expect(activitySentence(item("report", false))).toEqual({
      key: "activity.reportNoTarget",
      values: { actor: "Alice" },
    });
  });

  it("never includes a target for signup and verified", () => {
    expect(activitySentence(item("signup", true))).toEqual({
      key: "activity.signup",
      values: { actor: "Alice" },
    });
    expect(activitySentence(item("verified", false)).key).toBe("activity.verified");
  });
});
