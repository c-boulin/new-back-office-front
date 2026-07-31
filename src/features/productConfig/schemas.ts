import { z } from "zod";

const requiredLevel = z.enum(["required", "optional"]);

export const registrationSchema = z.object({
  email: requiredLevel,
  phone: requiredLevel,
  same_sex: z.boolean(),
  min_age: z.number().int().nonnegative(),
  photo_required: z.boolean(),
});

export const relationsSchema = z.object({
  max_distance_km: z.number().int().nonnegative(),
  inactivity_period_days: z.number().int().nonnegative(),
  unlimited_messages: z.boolean(),
  max_propositions: z.number().int().nonnegative(),
  proposition_period_hours: z.number().int().nonnegative(),
});

export const suggestionsSchema = z.object({
  max_propositions: z.number().int().nonnegative(),
  period_hours: z.number().int().nonnegative(),
});

export const photosSchema = z.object({
  max_profile_photos: z.number().int().nonnegative(),
  max_story_photos: z.number().int().nonnegative(),
  video_enabled: z.boolean(),
});

export const quizzSchema = z.object({
  enabled: z.boolean(),
  min_questions: z.number().int().nonnegative(),
});

export const defaultContentTypesSchema = z.object({
  photo: z.boolean(),
  story: z.boolean(),
  event: z.boolean(),
  external_link: z.boolean(),
  video: z.boolean(),
});

export const likesSchema = z.object({
  free_likes_per_day: z.number().int().nonnegative(),
  unlimited_likes: z.boolean(),
});

export const legalLinksSchema = z.object({
  terms_url: z.string(),
  privacy_url: z.string(),
  cookies_url: z.string(),
  legal_notice_url: z.string(),
  refund_policy_url: z.string(),
  community_guidelines_url: z.string(),
  safety_tips_url: z.string(),
  anti_harassment_policy_url: z.string(),
  data_processing_url: z.string(),
  age_rating_url: z.string(),
  contact_url: z.string(),
});

export const productConfigSchema = z.object({
  registration: registrationSchema,
  relations: relationsSchema,
  suggestions: suggestionsSchema,
  photos: photosSchema,
  quizz: quizzSchema,
  default_content_types: defaultContentTypesSchema,
  likes: likesSchema,
  legal_links: legalLinksSchema,
});

export type RawProductConfig = z.infer<typeof productConfigSchema>;
export type RawRegistration = z.infer<typeof registrationSchema>;
export type RawRelations = z.infer<typeof relationsSchema>;
export type RawSuggestions = z.infer<typeof suggestionsSchema>;
export type RawPhotos = z.infer<typeof photosSchema>;
export type RawQuizz = z.infer<typeof quizzSchema>;
export type RawDefaultContentTypes = z.infer<typeof defaultContentTypesSchema>;
export type RawLikes = z.infer<typeof likesSchema>;
export type RawLegalLinks = z.infer<typeof legalLinksSchema>;
