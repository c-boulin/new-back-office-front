import { describe, it, expect } from "vitest";
import { productConfigSchema } from "@/features/productConfig/schemas";

const valid = {
  registration: {
    email: "required",
    phone: "optional",
    same_sex: false,
    min_age: 18,
    photo_required: true,
  },
  relations: {
    max_distance_km: 50,
    inactivity_period_days: 90,
    unlimited_messages: true,
    max_propositions: 2,
    proposition_period_hours: 48,
  },
  suggestions: {
    max_propositions: 2,
    period_hours: 48,
  },
  photos: {
    max_profile_photos: 6,
    max_story_photos: 5,
    video_enabled: false,
  },
  quizz: {
    enabled: false,
    min_questions: 0,
  },
  default_content_types: {
    photo: true,
    story: true,
    event: false,
    external_link: false,
    video: false,
  },
  likes: {
    free_likes_per_day: 5,
    unlimited_likes: false,
  },
  legal_links: {
    terms_url: "",
    privacy_url: "",
    cookies_url: "",
    legal_notice_url: "",
    refund_policy_url: "",
    community_guidelines_url: "",
    safety_tips_url: "",
    anti_harassment_policy_url: "",
    data_processing_url: "",
    age_rating_url: "",
    contact_url: "",
  },
};

describe("productConfigSchema", () => {
  it("parses a well-formed config", () => {
    expect(productConfigSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid email enum value", () => {
    expect(
      productConfigSchema.safeParse({
        ...valid,
        registration: { ...valid.registration, email: "maybe" },
      }).success,
    ).toBe(false);
  });

  it("rejects a negative min_age", () => {
    expect(
      productConfigSchema.safeParse({
        ...valid,
        registration: { ...valid.registration, min_age: -1 },
      }).success,
    ).toBe(false);
  });

  it("rejects a missing legal_links field", () => {
    expect(
      productConfigSchema.safeParse({
        ...valid,
        legal_links: { ...valid.legal_links, terms_url: undefined },
      }).success,
    ).toBe(false);
  });

  it("rejects a non-object payload", () => {
    expect(productConfigSchema.safeParse("nope").success).toBe(false);
  });
});
