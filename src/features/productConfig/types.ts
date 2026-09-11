export type IdentificationLevel = "required" | "not_required";

export type ContentType = "photo" | "story" | "event" | "externallink";

export type RegistrationConfig = {
  identificationEmail: IdentificationLevel;
  identificationPhoneNumber: IdentificationLevel;
  allowSameSexRelationship: boolean;
};

export type RelationsConfig = {
  matchUnlimitedMessages: boolean;
  defaultDistance: number;
  activePresentationDuration: number;
  maxPropositionRequestPerUser: number;
};

export type SuggestionsConfig = {
  periodMin: number;
  periodMax: number;
};

export type LikesConfig = {
  freeLikes: number;
  unlimitedLikes: boolean;
};

export type PhotosConfig = {
  maxProfilePhotos: number;
  maxStoryPhotos: number;
};

export type QuizzConfig = {
  required: boolean;
};

export type LegalLinks = {
  cgu: string | null;
  legal: string | null;
  subscription: string | null;
  selfcare: string | null;
  personalData: string | null;
  cookies: string | null;
  unsubscribe: string | null;
  contact: string | null;
  myAccount: string | null;
  downloadCgu: string | null;
  pricing: string | null;
  supportEmail: string | null;
};

export type ProductConfig = {
  productId: number;
  isDefault: boolean;
  registration: RegistrationConfig;
  relations: RelationsConfig;
  suggestions: SuggestionsConfig;
  likes: LikesConfig;
  photos: PhotosConfig;
  quizz: QuizzConfig;
  defaultTypes: ContentType[];
  legalLinks: LegalLinks;
};

export type ProductConfigWrite = Omit<ProductConfig, "productId" | "isDefault">;
