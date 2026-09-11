import { describe, it, expect } from "vitest";
import { messageThreadSchema } from "@/features/messages/schemas";

const valid = {
  id: "t1",
  participant_a: "Alice",
  participant_b: "Bob",
  last_message_preview: "hi",
  last_message_at: "2024-01-01",
  message_count: 1,
  flag: null,
};

describe("messageThreadSchema", () => {
  it("parses valid", () => {
    expect(() => messageThreadSchema.parse(valid)).not.toThrow();
  });

  it("rejects negative message_count", () => {
    expect(() => messageThreadSchema.parse({ ...valid, message_count: -1 })).toThrow();
  });

  it("rejects unknown flag", () => {
    expect(() => messageThreadSchema.parse({ ...valid, flag: "abuse" })).toThrow();
  });
});
