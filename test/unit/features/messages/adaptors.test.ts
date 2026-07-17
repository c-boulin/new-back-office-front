import { describe, it, expect } from "vitest";
import { messageThreadFromRaw } from "@/features/messages/adaptors";

describe("messageThreadFromRaw", () => {
  it("sanitizes participant names and preview", () => {
    const out = messageThreadFromRaw({
      id: "t1",
      participant_a: " Alice ",
      participant_b: "<b>Bob</b>",
      last_message_preview: " hi ",
      last_message_at: "2024-01-01",
      message_count: 3,
      flag: null,
    });
    expect(out.participantA).toBe("Alice");
    expect(out.participantB).toBe("Bob");
    expect(out.lastMessagePreview).toBe("hi");
    expect(out.messageCount).toBe(3);
    expect(out.flag).toBeNull();
  });
});
