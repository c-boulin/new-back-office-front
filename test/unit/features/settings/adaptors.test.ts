import { describe, it, expect } from "vitest";
import { settingsFromRaw, settingsToRaw } from "@/features/settings/adaptors";
import { tenantSettingsSchema } from "@/features/settings/schemas";

const valid = {
  tenant_name: "Luna",
  support_email: "ops@luna.io",
  timezone: "UTC",
  locale: "en",
  feature_flags: { premium: true },
  brand_primary: "1 2% 3%",
  brand_accent: "4 5% 6%",
};

describe("settingsFromRaw", () => {
  it("renames snake_case fields", () => {
    const out = settingsFromRaw(valid);
    expect(out.tenantName).toBe("Luna");
    expect(out.supportEmail).toBe("ops@luna.io");
    expect(out.brandPrimary).toBe("1 2% 3%");
    expect(out.brandAccent).toBe("4 5% 6%");
    expect(out.featureFlags).toEqual({ premium: true });
  });
});

describe("settingsToRaw", () => {
  it("only includes provided fields", () => {
    expect(settingsToRaw({ tenantName: "New" })).toEqual({ tenant_name: "New" });
  });

  it("omits undefined fields", () => {
    expect(settingsToRaw({})).toEqual({});
  });

  it("round-trips through settingsFromRaw", () => {
    const domain = settingsFromRaw(valid);
    expect(settingsToRaw(domain)).toEqual(valid);
  });
});

describe("tenantSettingsSchema", () => {
  it("parses valid", () => {
    expect(() => tenantSettingsSchema.parse(valid)).not.toThrow();
  });

  it("rejects invalid support_email", () => {
    expect(() =>
      tenantSettingsSchema.parse({ ...valid, support_email: "nope" }),
    ).toThrow();
  });
});
