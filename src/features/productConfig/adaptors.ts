import type {
  DefaultContentTypes,
  LegalLinks,
  LikesConfig,
  PhotosConfig,
  ProductConfig,
  ProductConfigWrite,
  QuizzConfig,
  RegistrationConfig,
  RelationsConfig,
  SuggestionsConfig,
} from "./types";
import type {
  RawDefaultContentTypes,
  RawLegalLinks,
  RawLikes,
  RawPhotos,
  RawProductConfig,
  RawQuizz,
  RawRegistration,
  RawRelations,
  RawSuggestions,
} from "./schemas";

function registrationFromRaw(raw: RawRegistration): RegistrationConfig {
  return {
    email: raw.email,
    phone: raw.phone,
    sameSex: raw.same_sex,
    minAge: raw.min_age,
    photoRequired: raw.photo_required,
  };
}

function registrationToRaw(d: RegistrationConfig): RawRegistration {
  return {
    email: d.email,
    phone: d.phone,
    same_sex: d.sameSex,
    min_age: d.minAge,
    photo_required: d.photoRequired,
  };
}

function relationsFromRaw(raw: RawRelations): RelationsConfig {
  return {
    maxDistanceKm: raw.max_distance_km,
    inactivityPeriodDays: raw.inactivity_period_days,
    unlimitedMessages: raw.unlimited_messages,
    maxPropositions: raw.max_propositions,
    propositionPeriodHours: raw.proposition_period_hours,
  };
}

function relationsToRaw(d: RelationsConfig): RawRelations {
  return {
    max_distance_km: d.maxDistanceKm,
    inactivity_period_days: d.inactivityPeriodDays,
    unlimited_messages: d.unlimitedMessages,
    max_propositions: d.maxPropositions,
    proposition_period_hours: d.propositionPeriodHours,
  };
}

function suggestionsFromRaw(raw: RawSuggestions): SuggestionsConfig {
  return {
    maxPropositions: raw.max_propositions,
    periodHours: raw.period_hours,
  };
}

function suggestionsToRaw(d: SuggestionsConfig): RawSuggestions {
  return {
    max_propositions: d.maxPropositions,
    period_hours: d.periodHours,
  };
}

function photosFromRaw(raw: RawPhotos): PhotosConfig {
  return {
    maxProfilePhotos: raw.max_profile_photos,
    maxStoryPhotos: raw.max_story_photos,
    videoEnabled: raw.video_enabled,
  };
}

function photosToRaw(d: PhotosConfig): RawPhotos {
  return {
    max_profile_photos: d.maxProfilePhotos,
    max_story_photos: d.maxStoryPhotos,
    video_enabled: d.videoEnabled,
  };
}

function quizzFromRaw(raw: RawQuizz): QuizzConfig {
  return {
    enabled: raw.enabled,
    minQuestions: raw.min_questions,
  };
}

function quizzToRaw(d: QuizzConfig): RawQuizz {
  return {
    enabled: d.enabled,
    min_questions: d.minQuestions,
  };
}

function contentTypesFromRaw(raw: RawDefaultContentTypes): DefaultContentTypes {
  return {
    photo: raw.photo,
    story: raw.story,
    event: raw.event,
    externalLink: raw.external_link,
    video: raw.video,
  };
}

function contentTypesToRaw(d: DefaultContentTypes): RawDefaultContentTypes {
  return {
    photo: d.photo,
    story: d.story,
    event: d.event,
    external_link: d.externalLink,
    video: d.video,
  };
}

function likesFromRaw(raw: RawLikes): LikesConfig {
  return {
    freeLikesPerDay: raw.free_likes_per_day,
    unlimitedLikes: raw.unlimited_likes,
  };
}

function likesToRaw(d: LikesConfig): RawLikes {
  return {
    free_likes_per_day: d.freeLikesPerDay,
    unlimited_likes: d.unlimitedLikes,
  };
}

function legalLinksFromRaw(raw: RawLegalLinks): LegalLinks {
  return {
    termsUrl: raw.terms_url,
    privacyUrl: raw.privacy_url,
    cookiesUrl: raw.cookies_url,
    legalNoticeUrl: raw.legal_notice_url,
    refundPolicyUrl: raw.refund_policy_url,
    communityGuidelinesUrl: raw.community_guidelines_url,
    safetyTipsUrl: raw.safety_tips_url,
    antiHarassmentPolicyUrl: raw.anti_harassment_policy_url,
    dataProcessingUrl: raw.data_processing_url,
    ageRatingUrl: raw.age_rating_url,
    contactUrl: raw.contact_url,
  };
}

function legalLinksToRaw(d: LegalLinks): RawLegalLinks {
  return {
    terms_url: d.termsUrl,
    privacy_url: d.privacyUrl,
    cookies_url: d.cookiesUrl,
    legal_notice_url: d.legalNoticeUrl,
    refund_policy_url: d.refundPolicyUrl,
    community_guidelines_url: d.communityGuidelinesUrl,
    safety_tips_url: d.safetyTipsUrl,
    anti_harassment_policy_url: d.antiHarassmentPolicyUrl,
    data_processing_url: d.dataProcessingUrl,
    age_rating_url: d.ageRatingUrl,
    contact_url: d.contactUrl,
  };
}

export function productConfigFromRaw(raw: RawProductConfig): ProductConfig {
  return {
    registration: registrationFromRaw(raw.registration),
    relations: relationsFromRaw(raw.relations),
    suggestions: suggestionsFromRaw(raw.suggestions),
    photos: photosFromRaw(raw.photos),
    quizz: quizzFromRaw(raw.quizz),
    defaultContentTypes: contentTypesFromRaw(raw.default_content_types),
    likes: likesFromRaw(raw.likes),
    legalLinks: legalLinksFromRaw(raw.legal_links),
  };
}

export function productConfigToRaw(d: ProductConfigWrite): RawProductConfig {
  return {
    registration: registrationToRaw(d.registration),
    relations: relationsToRaw(d.relations),
    suggestions: suggestionsToRaw(d.suggestions),
    photos: photosToRaw(d.photos),
    quizz: quizzToRaw(d.quizz),
    default_content_types: contentTypesToRaw(d.defaultContentTypes),
    likes: likesToRaw(d.likes),
    legal_links: legalLinksToRaw(d.legalLinks),
  };
}
