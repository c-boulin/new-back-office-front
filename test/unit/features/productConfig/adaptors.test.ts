import { describe, it, expect } from "vitest";
import {
  productConfigFromRaw,
  productConfigToWriteBody,
} from "@/features/productConfig/adaptors";
import type { RawProductConfig } from "@/features/productConfig/schemas";

const raw: RawProductConfig = {
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
    cgu: "https://example.com/cgu",
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

describe("productConfigFromRaw", () => {
  it("maps fields correctly", () => {
    const out = productConfigFromRaw(raw);
    expect(out.productId).toBe(69);
    expect(out.isDefault).toBe(false);
    expect(out.registration.identificationEmail).toBe("required");
    expect(out.registration.identificationPhoneNumber).toBe("not_required");
    expect(out.registration.allowSameSexRelationship).toBe(false);
    expect(out.relations.defaultDistance).toBe(-1);
    expect(out.relations.activePresentationDuration).toBe(90);
    expect(out.relations.maxPropositionRequestPerUser).toBe(99);
    expect(out.suggestions.periodMin).toBe(48);
    expect(out.suggestions.periodMax).toBe(96);
    expect(out.likes.freeLikes).toBe(5);
    expect(out.likes.unlimitedLikes).toBe(false);
    expect(out.photos.maxProfilePhotos).toBe(5);
    expect(out.photos.maxStoryPhotos).toBe(6);
    expect(out.quizz.required).toBe(false);
    expect(out.defaultTypes).toEqual(["story"]);
    expect(out.legalLinks.cgu).toBe("https://example.com/cgu");
    expect(out.legalLinks.legal).toBeNull();
  });

  it("sanitizes legal link strings", () => {
    const withScript: RawProductConfig = {
      ...raw,
      legalLinks: { ...raw.legalLinks, cgu: '<script>alert("x")</script>link' },
    };
    const out = productConfigFromRaw(withScript);
    expect(out.legalLinks.cgu).not.toContain("<script>");
  });

  it("preserves null legal link values", () => {
    const out = productConfigFromRaw(raw);
    expect(out.legalLinks.legal).toBeNull();
  });
});

describe("productConfigToWriteBody", () => {
  it("strips productId and isDefault", () => {
    const domain = productConfigFromRaw(raw);
    const body = productConfigToWriteBody(domain);
    expect(body).not.toHaveProperty("productId");
    expect(body).not.toHaveProperty("isDefault");
    expect(body.registration.identificationEmail).toBe("required");
    expect(body.defaultTypes).toEqual(["story"]);
  });
});
