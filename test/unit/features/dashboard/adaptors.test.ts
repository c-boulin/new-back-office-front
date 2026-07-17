import { describe, it, expect } from "vitest";
import { dashboardFromRaw } from "@/features/dashboard/adaptors";

describe("dashboardFromRaw", () => {
  it("passes stats & engagement through and maps activity", () => {
    const out = dashboardFromRaw({
      stats: [
        {
          id: "s1",
          label: "Users",
          value: 1,
          formatted: "1",
          hint: "",
          trend: { direction: "up", label: "+1" },
        },
      ],
      engagement: [{ label: "Mon", value: 10 }],
      recent_activity: [
        {
          id: "a1",
          actor_name: "Alice",
          action: "match",
          target: "u2",
          created_at: "2024-01-01",
        },
      ],
    });
    expect(out.stats).toHaveLength(1);
    expect(out.engagement[0]).toEqual({ label: "Mon", value: 10 });
    expect(out.recentActivity[0]).toEqual({
      id: "a1",
      actorName: "Alice",
      action: "match",
      target: "u2",
      createdAt: "2024-01-01",
    });
  });
});
