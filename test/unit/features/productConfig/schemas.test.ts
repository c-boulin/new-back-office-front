import { describe, it, expect } from "vitest";
import { productConfigSchema } from "@/features/productConfig/schemas";

const valid = {
  productId: 69,
  isDefault: false,
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

describe("productConfigSchema", () => {
  it("parses a well-formed config", () => {
    expect(productConfigSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts identification enum not_required", () => {
    const input = {
      ...valid,
      registration: { ...valid.registration, identificationEmail: "not_required" },
    };
    expect(productConfigSchema.safeParse(input).success).toBe(true);
  });

  it("rejects an invalid identification enum value", () => {
    const input = {
      ...valid,
      registration: { ...valid.registration, identificationEmail: "optional" },
    };
    expect(productConfigSchema.safeParse(input).success).toBe(false);
  });

  it("accepts externallink in defaultTypes", () => {
    const input = { ...valid, defaultTypes: ["photo", "externallink"] };
    expect(productConfigSchema.safeParse(input).success).toBe(true);
  });

  it("rejects video in defaultTypes", () => {
    const input = { ...valid, defaultTypes: ["video"] };
    expect(productConfigSchema.safeParse(input).success).toBe(false);
  });

  it("accepts null legal link values", () => {
    expect(productConfigSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts string legal link values", () => {
    const input = {
      ...valid,
      legalLinks: { ...valid.legalLinks, cgu: "https://example.com/cgu" },
    };
    expect(productConfigSchema.safeParse(input).success).toBe(true);
  });

  it("rejects activePresentationDuration of 0", () => {
    const input = {
      ...valid,
      relations: { ...valid.relations, activePresentationDuration: 0 },
    };
    expect(productConfigSchema.safeParse(input).success).toBe(false);
  });

  it("accepts activePresentationDuration of -1", () => {
    const input = {
      ...valid,
      relations: { ...valid.relations, activePresentationDuration: -1 },
    };
    expect(productConfigSchema.safeParse(input).success).toBe(true);
  });

  it("rejects periodMin of 0", () => {
    const input = {
      ...valid,
      suggestions: { ...valid.suggestions, periodMin: 0 },
    };
    expect(productConfigSchema.safeParse(input).success).toBe(false);
  });

  it("accepts defaultDistance of 0", () => {
    const input = {
      ...valid,
      relations: { ...valid.relations, defaultDistance: 0 },
    };
    expect(productConfigSchema.safeParse(input).success).toBe(true);
  });

  it("accepts freeLikes of -1 when unlimited", () => {
    const input = {
      ...valid,
      likes: { freeLikes: -1, unlimitedLikes: true },
    };
    expect(productConfigSchema.safeParse(input).success).toBe(true);
  });

  it("rejects a non-object payload", () => {
    expect(productConfigSchema.safeParse("nope").success).toBe(false);
  });
});
