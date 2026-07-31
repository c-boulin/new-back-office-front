export type RequiredLevel = "required" | "optional";

export type RegistrationConfig = {
  email: RequiredLevel;
  phone: RequiredLevel;
  sameSex: boolean;
  minAge: number;
  photoRequired: boolean;
};

export type RelationsConfig = {
  maxDistanceKm: number;
  inactivityPeriodDays: number;
  unlimitedMessages: boolean;
  maxPropositions: number;
  propositionPeriodHours: number;
};

export type SuggestionsConfig = {
  maxPropositions: number;
  periodHours: number;
};

export type PhotosConfig = {
  maxProfilePhotos: number;
  maxStoryPhotos: number;
  videoEnabled: boolean;
};

export type QuizzConfig = {
  enabled: boolean;
  minQuestions: number;
};

export type DefaultContentTypes = {
  photo: boolean;
  story: boolean;
  event: boolean;
  externalLink: boolean;
  video: boolean;
};

export type LikesConfig = {
  freeLikesPerDay: number;
  unlimitedLikes: boolean;
};

export type LegalLinks = {
  termsUrl: string;
  privacyUrl: string;
  cookiesUrl: string;
  legalNoticeUrl: string;
  refundPolicyUrl: string;
  communityGuidelinesUrl: string;
  safetyTipsUrl: string;
  antiHarassmentPolicyUrl: string;
  dataProcessingUrl: string;
  ageRatingUrl: string;
  contactUrl: string;
};

export type ProductConfig = {
  registration: RegistrationConfig;
  relations: RelationsConfig;
  suggestions: SuggestionsConfig;
  photos: PhotosConfig;
  quizz: QuizzConfig;
  defaultContentTypes: DefaultContentTypes;
  likes: LikesConfig;
  legalLinks: LegalLinks;
};

export type ProductConfigWrite = ProductConfig;
