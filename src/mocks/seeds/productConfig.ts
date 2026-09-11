import type { RawProductConfig } from "@/features/productConfig/schemas";

export function buildProductConfig(productId: number): RawProductConfig {
  return {
    productId,
    isDefault: true,
    registration: {
      identificationEmail: "required",
      identificationPhoneNumber: "not_required",
      allowSameSexRelationship: false,
    },
    relations: {
      matchUnlimitedMessages: false,
      defaultDistance: -1,
      activePresentationDuration: 90,
      maxPropositionRequestPerUser: 99,
    },
    suggestions: {
      periodMin: 48,
      periodMax: 96,
    },
    likes: {
      freeLikes: 5,
      unlimitedLikes: false,
    },
    photos: {
      maxProfilePhotos: 5,
      maxStoryPhotos: 6,
    },
    quizz: { required: false },
    defaultTypes: ["story"],
    legalLinks: {
      cgu: null,
      legal: null,
      subscription: null,
      selfcare: null,
      personalData: null,
      cookies: null,
      unsubscribe: null,
      contact: null,
      myAccount: null,
      downloadCgu: null,
      pricing: null,
      supportEmail: null,
    },
  };
}
