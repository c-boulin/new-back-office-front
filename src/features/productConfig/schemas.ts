import { z } from "zod";

const identificationLevel = z.enum(["required", "not_required"]);

const contentType = z.enum(["photo", "story", "event", "externallink"]);

export const registrationSchema = z.object({
  identificationEmail: identificationLevel,
  identificationPhoneNumber: identificationLevel,
  allowSameSexRelationship: z.boolean(),
});

export const relationsSchema = z.object({
  matchUnlimitedMessages: z.boolean(),
  defaultDistance: z.number().int().min(-1),
  activePresentationDuration: z.number().int().min(-1).refine((v) => v !== 0, {
    message: "Value cannot be 0",
  }),
  maxPropositionRequestPerUser: z.number().int().min(-1).refine((v) => v !== 0, {
    message: "Value cannot be 0",
  }),
});

export const suggestionsSchema = z.object({
  periodMin: z.number().int().min(-1).refine((v) => v !== 0, {
    message: "Value cannot be 0",
  }),
  periodMax: z.number().int().min(-1).refine((v) => v !== 0, {
    message: "Value cannot be 0",
  }),
});

export const likesSchema = z.object({
  freeLikes: z.number().int().min(-1),
  unlimitedLikes: z.boolean(),
});

export const photosSchema = z.object({
  maxProfilePhotos: z.number().int().min(0),
  maxStoryPhotos: z.number().int().min(0),
});

export const quizzSchema = z.object({
  required: z.boolean(),
});

export const legalLinksSchema = z.object({
  cgu: z.string().nullable(),
  legal: z.string().nullable(),
  subscription: z.string().nullable(),
  selfcare: z.string().nullable(),
  personalData: z.string().nullable(),
  cookies: z.string().nullable(),
  unsubscribe: z.string().nullable(),
  contact: z.string().nullable(),
  myAccount: z.string().nullable(),
  downloadCgu: z.string().nullable(),
  pricing: z.string().nullable(),
  supportEmail: z.string().nullable(),
});

export const productConfigSchema = z.object({
  productId: z.number().int(),
  isDefault: z.boolean(),
  registration: registrationSchema,
  relations: relationsSchema,
  suggestions: suggestionsSchema,
  likes: likesSchema,
  photos: photosSchema,
  quizz: quizzSchema,
  defaultTypes: z.array(contentType),
  legalLinks: legalLinksSchema,
});

export type RawProductConfig = z.infer<typeof productConfigSchema>;
