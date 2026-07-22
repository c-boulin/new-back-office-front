import { createRng } from "../rng";
import type { RawModerationItem } from "@/features/moderation/schemas";
import type { RawReport } from "@/features/reports/schemas";
import type { RawMessageThread } from "@/features/messages/schemas";
import type { RawTenantDashboard } from "@/features/dashboard/schemas";
import type { RawMatchesOverview } from "@/features/matches/schemas";
import type { RawSubscriptionsOverview } from "@/features/subscriptions/schemas";
import type { RawAnalyticsOverview } from "@/features/analytics/schemas";
import type { RawTenantSettings } from "@/features/settings/schemas";
import type { RawPlatformAdmin } from "@/features/superAdmin/schemas";

const FIRST_NAMES = [
  "Amelia", "Liam", "Olivia", "Noah", "Emma", "Kai", "Sophie", "Mateo",
  "Zara", "Elias", "Nora", "Ethan", "Aria", "Leo", "Mila", "Hugo",
];
const LAST_NAMES = [
  "Rivera", "Chen", "Nakamura", "Kowalski", "Bianchi", "Silva", "Andersen",
  "Okafor", "Larsen", "Dubois", "Reyes", "Adebayo",
];

function fullName(rng: ReturnType<typeof createRng>) {
  return `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`;
}

function isoAt(daysAgo: number, hoursAgo = 0): string {
  const base = Date.UTC(2025, 6, 15, 12, 0, 0);
  return new Date(base - daysAgo * 86_400_000 - hoursAgo * 3_600_000).toISOString();
}

type ModerationTemplate = {
  type: RawModerationItem["type"];
  contentKind: NonNullable<RawModerationItem["content_kind"]>;
  reason: string;
  content: string;
  previews: string[];
  weight: number;
};

const MODERATION_TEMPLATES: ModerationTemplate[] = [
  {
    type: "profile",
    contentKind: "nickname",
    reason: "Nickname flagged by classifier",
    content: "The pseudonym breaches the community guidelines.",
    previews: [
      "DirtyTalker",
      "HotMama2024",
      "XxDarkAngelxX",
      "NaughtyEmma",
      "SexyBeast92",
      "BadBoy4Life",
    ],
    weight: 3,
  },
  {
    type: "photo",
    contentKind: "profile_photo",
    reason: "Profile photo flagged by classifier",
    content: "Automated review requested — suspected NSFW content.",
    previews: [],
    weight: 3,
  },
  {
    type: "message",
    contentKind: "story",
    reason: "Story flagged by classifier",
    content: "Story preview flagged for review.",
    previews: [
      "Regardez mon nouveau spot secret...",
      "Rencontre ce soir chez moi...",
      "Vous ne devinerez jamais ce que j'ai fait...",
      "Une belle journée à la plage aujourd'hui.",
    ],
    weight: 2,
  },
  {
    type: "report",
    contentKind: "message",
    reason: "Message reported by another user",
    content: "Direct message contains policy-violating language.",
    previews: [
      "Envoie moi ton num tout de suite.",
      "Tu viens chez moi ce soir ?",
      "Je te paye si tu réponds.",
    ],
    weight: 2,
  },
];

function pickTemplate(rng: ReturnType<typeof createRng>): ModerationTemplate {
  const bag: ModerationTemplate[] = [];
  for (const t of MODERATION_TEMPLATES) {
    for (let i = 0; i < t.weight; i += 1) bag.push(t);
  }
  return rng.pick(bag);
}

export function buildModerationSeeds(tenantId: string, seed: number): RawModerationItem[] {
  const rng = createRng(seed);
  const statuses: RawModerationItem["status"][] = [
    "pending", "pending", "pending", "pending", "approved", "rejected", "escalated",
  ];
  const severities: RawModerationItem["severity"][] = ["low", "medium", "high"];
  const decisions: NonNullable<RawModerationItem["ai_decision"]>[] = [
    "refused", "refused", "refused", "accepted", "unknown",
  ];
  return Array.from({ length: 48 }, (_, i) => {
    const template = pickTemplate(rng);
    const preview =
      template.previews.length > 0 ? rng.pick(template.previews) : null;
    return {
      id: `mod_${tenantId}_${String(i + 1).padStart(3, "0")}`,
      type: template.type,
      status: rng.pick(statuses),
      reason: template.reason,
      reported_by: rng.bool(0.7) ? fullName(rng) : null,
      subject_name: fullName(rng),
      subject_id: `usr_${tenantId}_${String(rng.int(1, 120)).padStart(4, "0")}`,
      content: template.content,
      content_html: null,
      image_url:
        template.contentKind === "profile_photo"
          ? "https:/" +
            "/images.pexels.com/photos/" +
            String(1000000 + rng.int(0, 500)) +
            "/pexels-photo.jpeg?auto=compress&w=320"
          : null,
      severity: rng.pick(severities),
      created_at: isoAt(rng.int(0, 30), rng.int(0, 23)),
      ai_decision: rng.pick(decisions),
      content_kind: template.contentKind,
      content_preview: preview,
    };
  });
}

export function buildReportSeeds(tenantId: string, seed: number): RawReport[] {
  const rng = createRng(seed);
  const categories: RawReport["category"][] = [
    "harassment", "spam", "impersonation", "inappropriate_content", "underage", "other",
  ];
  const statuses: RawReport["status"][] = [
    "open", "open", "in_review", "resolved", "dismissed",
  ];
  return Array.from({ length: 64 }, (_, i) => {
    const status = rng.pick(statuses);
    const resolved = status === "resolved" || status === "dismissed";
    return {
      id: `rpt_${tenantId}_${String(i + 1).padStart(3, "0")}`,
      reporter_name: fullName(rng),
      reporter_id: `usr_${tenantId}_${String(rng.int(1, 120)).padStart(4, "0")}`,
      subject_name: fullName(rng),
      subject_id: `usr_${tenantId}_${String(rng.int(1, 120)).padStart(4, "0")}`,
      category: rng.pick(categories),
      status,
      description: rng.pick([
        "User sending unsolicited explicit content.",
        "Profile appears to impersonate a public figure.",
        "Repeated harassment via direct messages.",
        "Suspected spam / bot behaviour.",
        "Underage user - please review.",
      ]),
      created_at: isoAt(rng.int(0, 45), rng.int(0, 23)),
      resolved_at: resolved ? isoAt(rng.int(0, 15)) : null,
      resolver_name: resolved ? "Operator" : null,
    };
  });
}

export function buildMessageThreadSeeds(tenantId: string, seed: number): RawMessageThread[] {
  const rng = createRng(seed);
  const flags: RawMessageThread["flag"][] = [
    null, null, null, null, null, "harassment", "spam", "explicit", "underage",
  ];
  return Array.from({ length: 80 }, (_, i) => ({
    id: `thr_${tenantId}_${String(i + 1).padStart(3, "0")}`,
    participant_a: fullName(rng),
    participant_b: fullName(rng),
    last_message_preview: rng.pick([
      "Hey, how was your weekend?",
      "Coffee tomorrow?",
      "See you at 8.",
      "I'm running late.",
      "That was fun, let's do it again.",
      "Can you share your number?",
    ]),
    last_message_at: isoAt(rng.int(0, 20), rng.int(0, 23)),
    message_count: rng.int(1, 240),
    flag: rng.pick(flags),
  }));
}

export function buildDashboard(tenantId: string, seed: number): RawTenantDashboard {
  const rng = createRng(seed);
  const dau = rng.int(4_000, 22_000);
  const matches = rng.int(800, 3_200);
  const reportsOpen = rng.int(2, 40);
  const sessions = rng.int(20_000, 60_000);

  return {
    stats: [
      {
        id: "dau",
        label: "Active users",
        value: dau,
        formatted: dau.toLocaleString(),
        hint: "Last 24 hours",
        trend: {
          direction: rng.bool(0.7) ? "up" : "down",
          label: `${rng.bool() ? "+" : "-"}${(rng.next() * 10).toFixed(1)}% vs previous`,
        },
      },
      {
        id: "matches",
        label: "New matches",
        value: matches,
        formatted: matches.toLocaleString(),
        hint: "Rolling 24h",
        trend: { direction: "up", label: `+${(rng.next() * 6 + 1).toFixed(1)}%` },
      },
      {
        id: "reports_open",
        label: "Reports open",
        value: reportsOpen,
        formatted: reportsOpen.toString(),
        hint: "Requires attention",
        trend: { direction: "flat", label: "No change" },
      },
      {
        id: "sessions",
        label: "Sessions",
        value: sessions,
        formatted: sessions.toLocaleString(),
        hint: "Rolling 24h",
        trend: {
          direction: rng.bool(0.6) ? "up" : "down",
          label: `${rng.bool() ? "+" : "-"}${(rng.next() * 4).toFixed(1)}%`,
        },
      },
    ],
    engagement: Array.from({ length: 14 }, (_, i) => ({
      label: isoAt(13 - i).slice(0, 10),
      value: rng.int(3_000, 18_000),
    })),
    recent_activity: Array.from({ length: 8 }, (_, i) => ({
      id: `evt_${tenantId}_${i + 1}`,
      actor_name: fullName(rng),
      action: rng.pick(["match", "message", "report", "signup", "verify", "ban"]),
      target: fullName(rng),
      created_at: isoAt(0, i + 1),
    })),
  };
}

export function buildMatches(_tenantId: string, seed: number): RawMatchesOverview {
  const rng = createRng(seed);
  const days = 14;
  return {
    total_matches: rng.int(20_000, 90_000),
    match_rate_pct: Number((rng.next() * 10 + 15).toFixed(1)),
    average_quality: Number((rng.next() * 2 + 3).toFixed(2)),
    median_messages_per_match: rng.int(6, 22),
    matches_by_day: Array.from({ length: days }, (_, i) => ({
      date: isoAt(days - 1 - i).slice(0, 10),
      value: rng.int(1_200, 4_800),
    })),
    quality_distribution: [
      { bucket: "0-1", count: rng.int(200, 800) },
      { bucket: "1-2", count: rng.int(500, 1_400) },
      { bucket: "2-3", count: rng.int(1_400, 3_200) },
      { bucket: "3-4", count: rng.int(2_200, 4_200) },
      { bucket: "4-5", count: rng.int(1_200, 3_000) },
    ],
    geo_distribution: [
      { country: "FR", count: rng.int(4_000, 12_000) },
      { country: "DE", count: rng.int(3_000, 9_000) },
      { country: "ES", count: rng.int(2_500, 8_000) },
      { country: "IT", count: rng.int(2_000, 7_000) },
      { country: "NL", count: rng.int(1_800, 5_000) },
      { country: "PT", count: rng.int(1_200, 3_500) },
    ],
  };
}

export function buildSubscriptions(_tenantId: string, seed: number): RawSubscriptionsOverview {
  const rng = createRng(seed);
  const plans = [
    { id: "plan_basic", name: "Basic", monthly_price_cents: 999, active_count: rng.int(4_000, 12_000) },
    { id: "plan_plus", name: "Plus", monthly_price_cents: 1_999, active_count: rng.int(1_500, 6_000) },
    { id: "plan_gold", name: "Gold", monthly_price_cents: 4_999, active_count: rng.int(400, 1_800) },
  ];
  const enriched = plans.map((p) => ({
    ...p,
    currency: "EUR",
    churn_rate_pct: Number((rng.next() * 3 + 1).toFixed(2)),
  }));
  const active = enriched.reduce((s, p) => s + p.active_count, 0);
  const mrr = enriched.reduce((s, p) => s + p.active_count * p.monthly_price_cents, 0);
  return {
    active_count: active,
    monthly_recurring_revenue_cents: mrr,
    currency: "EUR",
    churn_rate_pct: Number((rng.next() * 2 + 1.5).toFixed(2)),
    arpu_cents: Math.round(mrr / Math.max(1, active)),
    plans: enriched,
    revenue_by_month: Array.from({ length: 12 }, (_, i) => ({
      month: `2025-${String(i + 1).padStart(2, "0")}`,
      cents: rng.int(80_000_000, 160_000_000),
    })),
  };
}

export function buildAnalytics(_tenantId: string, seed: number): RawAnalyticsOverview {
  const rng = createRng(seed);
  const dau = rng.int(6_000, 28_000);
  const mau = dau * rng.int(4, 8);
  return {
    daily_active_users: dau,
    monthly_active_users: mau,
    stickiness_ratio: Number((dau / mau).toFixed(3)),
    retention: [1, 7, 14, 30, 60, 90].map((day) => ({
      day,
      percentage: Number((100 * Math.pow(0.85, day / 7)).toFixed(1)),
    })),
    funnel: [
      { step: "Visit", count: 100_000, conversion: 1 },
      { step: "Sign up", count: 42_000, conversion: 0.42 },
      { step: "Complete profile", count: 33_000, conversion: 0.33 },
      { step: "First match", count: 24_500, conversion: 0.245 },
      { step: "First message", count: 18_800, conversion: 0.188 },
    ],
    activity_by_hour: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      value: rng.int(400, 3_800),
    })),
  };
}

export function buildSettings(tenantId: string): RawTenantSettings {
  return {
    tenant_name: tenantId === "tnt_luna" ? "Luna" : tenantId === "tnt_orbit" ? "Orbit" : "Tenant",
    support_email: `support@${tenantId.replace("tnt_", "")}.app`,
    timezone: "Europe/Paris",
    locale: "en",
    feature_flags: { premium: true, moderation: true, video: false, ai_matching: true },
    brand_primary: "199 89% 55%",
    brand_accent: "174 72% 48%",
  };
}

export function buildPlatformAdmins(): RawPlatformAdmin[] {
  return [
    {
      id: "adm_1",
      name: "Alex Chen",
      email: "alex.chen@platform.io",
      role: "owner",
      last_active_at: isoAt(0, 2),
      created_at: isoAt(320),
    },
    {
      id: "adm_2",
      name: "Priya Patel",
      email: "priya.patel@platform.io",
      role: "admin",
      last_active_at: isoAt(1),
      created_at: isoAt(240),
    },
    {
      id: "adm_3",
      name: "Marcus Reed",
      email: "marcus.reed@platform.io",
      role: "admin",
      last_active_at: isoAt(3),
      created_at: isoAt(180),
    },
    {
      id: "adm_4",
      name: "Sofia Rossi",
      email: "sofia.rossi@platform.io",
      role: "read_only",
      last_active_at: isoAt(12),
      created_at: isoAt(90),
    },
  ];
}
