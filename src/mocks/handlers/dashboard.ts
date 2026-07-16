import { db } from "../db";
import { createRng } from "../rng";
import type { RawDashboardOverview, RawRecentActivity } from "@/features/dashboard/schemas";

const ACTIONS = [
  "signed up",
  "was reported",
  "uploaded a photo",
  "got verified",
  "was banned",
  "sent a message",
  "matched with",
  "updated profile",
];

export function overview(tenantId: string | null): RawDashboardOverview {
  const users = tenantId ? db.usersFor(tenantId) : [];
  const activeCount = users.filter((u) => u.status === "active").length;
  const rng = createRng(activeCount + 42);

  return {
    active_users: {
      label: "Active users",
      value: activeCount,
      previous_value: Math.max(0, activeCount - rng.int(2, 15)),
      trend_direction: "up",
      trend_label: `+${rng.int(2, 12)}% vs previous`,
    },
    new_matches: {
      label: "New matches",
      value: rng.int(200, 5000),
      previous_value: rng.int(150, 4800),
      trend_direction: "up",
      trend_label: `+${rng.int(1, 8)}% vs previous`,
    },
    open_reports: {
      label: "Reports open",
      value: users.filter((u) => u.report_count > 0).length,
      previous_value: rng.int(5, 30),
      trend_direction: "flat",
      trend_label: "No change",
    },
    sessions: {
      label: "Sessions",
      value: rng.int(10000, 80000),
      previous_value: rng.int(10000, 80000),
      trend_direction: "down",
      trend_label: `-${rng.int(1, 4)}% vs previous`,
    },
  };
}

export function activity(tenantId: string | null): RawRecentActivity {
  const users = tenantId ? db.usersFor(tenantId).slice(0, 30) : [];
  const rng = createRng(777);

  const items = Array.from({ length: Math.min(10, users.length) }, (_, i) => {
    const actor = users[rng.int(0, Math.min(users.length - 1, 29))];
    const target = users[rng.int(0, Math.min(users.length - 1, 29))];
    return {
      id: `act_${i + 1}`,
      actor_name: actor.display_name,
      actor_avatar_url: actor.avatar_url,
      action: rng.pick(ACTIONS),
      target_name: target.display_name,
      occurred_at: new Date(Date.now() - rng.int(1, 72) * 3_600_000).toISOString(),
    };
  });

  return { items };
}
