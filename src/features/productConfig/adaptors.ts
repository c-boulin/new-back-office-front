import { sanitizeText } from "@/lib/sanitize";
import type { ProductConfig, ProductConfigWrite } from "./types";
import type { RawProductConfig } from "./schemas";

function sanitizeNullableString(value: string | null): string | null {
  if (value === null) return null;
  return sanitizeText(value);
}

export function productConfigFromRaw(raw: RawProductConfig): ProductConfig {
  return {
    productId: raw.productId,
    isDefault: raw.isDefault,
    registration: {
      identificationEmail: raw.registration.identificationEmail,
      identificationPhoneNumber: raw.registration.identificationPhoneNumber,
      allowSameSexRelationship: raw.registration.allowSameSexRelationship,
    },
    relations: {
      matchUnlimitedMessages: raw.relations.matchUnlimitedMessages,
      defaultDistance: raw.relations.defaultDistance,
      activePresentationDuration: raw.relations.activePresentationDuration,
      maxPropositionRequestPerUser: raw.relations.maxPropositionRequestPerUser,
    },
    suggestions: {
      periodMin: raw.suggestions.periodMin,
      periodMax: raw.suggestions.periodMax,
    },
    likes: {
      freeLikes: raw.likes.freeLikes,
      unlimitedLikes: raw.likes.unlimitedLikes,
    },
    photos: {
      maxProfilePhotos: raw.photos.maxProfilePhotos,
      maxStoryPhotos: raw.photos.maxStoryPhotos,
    },
    quizz: {
      required: raw.quizz.required,
    },
    defaultTypes: [...raw.defaultTypes],
    legalLinks: {
      cgu: sanitizeNullableString(raw.legalLinks.cgu),
      legal: sanitizeNullableString(raw.legalLinks.legal),
      subscription: sanitizeNullableString(raw.legalLinks.subscription),
      selfcare: sanitizeNullableString(raw.legalLinks.selfcare),
      personalData: sanitizeNullableString(raw.legalLinks.personalData),
      cookies: sanitizeNullableString(raw.legalLinks.cookies),
      unsubscribe: sanitizeNullableString(raw.legalLinks.unsubscribe),
      contact: sanitizeNullableString(raw.legalLinks.contact),
      myAccount: sanitizeNullableString(raw.legalLinks.myAccount),
      downloadCgu: sanitizeNullableString(raw.legalLinks.downloadCgu),
      pricing: sanitizeNullableString(raw.legalLinks.pricing),
      supportEmail: sanitizeNullableString(raw.legalLinks.supportEmail),
    },
  };
}

export function productConfigToWriteBody(config: ProductConfigWrite): ProductConfigWrite {
  return {
    registration: config.registration,
    relations: config.relations,
    suggestions: config.suggestions,
    likes: config.likes,
    photos: config.photos,
    quizz: config.quizz,
    defaultTypes: config.defaultTypes,
    legalLinks: config.legalLinks,
  };
}
