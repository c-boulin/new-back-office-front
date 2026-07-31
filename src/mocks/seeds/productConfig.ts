import type { RawProductConfig } from "@/features/productConfig/schemas";

export function buildProductConfig(): RawProductConfig {
  return {
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
}
