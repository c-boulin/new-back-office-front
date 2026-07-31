import { describe, it, expect } from "vitest";
import {
  productConfigFromRaw,
  productConfigToRaw,
} from "@/features/productConfig/adaptors";
import type { RawProductConfig } from "@/features/productConfig/schemas";

const raw: RawProductConfig = {
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
    terms_url: "https://example.com/terms",
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

describe("productConfigFromRaw", () => {
  it("renames snake_case fields to camelCase", () => {
    const out = productConfigFromRaw(raw);
    expect(out.registration.sameSex).toBe(false);
    expect(out.registration.minAge).toBe(18);
    expect(out.registration.photoRequired).toBe(true);
    expect(out.relations.maxDistanceKm).toBe(50);
    expect(out.relations.inactivityPeriodDays).toBe(90);
    expect(out.relations.unlimitedMessages).toBe(true);
    expect(out.relations.propositionPeriodHours).toBe(48);
    expect(out.photos.maxProfilePhotos).toBe(6);
    expect(out.photos.videoEnabled).toBe(false);
    expect(out.quizz.minQuestions).toBe(0);
    expect(out.defaultContentTypes.externalLink).toBe(false);
    expect(out.likes.freeLikesPerDay).toBe(5);
    expect(out.likes.unlimitedLikes).toBe(false);
    expect(out.legalLinks.termsUrl).toBe("https://example.com/terms");
  });
});

describe("productConfigToRaw", () => {
  it("round-trips through productConfigFromRaw", () => {
    const domain = productConfigFromRaw(raw);
    expect(productConfigToRaw(domain)).toEqual(raw);
  });
});
