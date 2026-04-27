import test from "node:test";
import assert from "node:assert/strict";
import { validateResultPayload } from "./validators.js";
import { buildLinkagePayload, getActivityConfig } from "./wfti-config.js";

test("validateResultPayload accepts a valid payload", () => {
  const result = validateResultPayload({
    uid: "1001",
    personality_code: "COMMANDER",
    personality_name: "热血掌旗官",
    answers: ["A", "B", "C", "A", "B", "C", "A", "B", "C", "A", "B", "C", "A", "B", "C", "A"],
    raw_scores: { F1: 2, F2: 3, E1: 4, E2: 5, S1: 6, S2: 5, A1: 4, A2: 3 },
    level_vector: ["L", "L", "M", "H", "H", "H", "M", "L"],
    client_env: { platform: "app_webview", app_version: "1.0.0" },
    computed_at: "2026-04-27T10:20:00+08:00",
  });
  assert.equal(result.ok, true);
});

test("validateResultPayload rejects incomplete payload", () => {
  const result = validateResultPayload({
    uid: "",
    answers: ["A"],
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.length >= 2);
});

test("getActivityConfig returns stable mock/service config", () => {
  const config = getActivityConfig("1001");
  assert.equal(config.activity.id, "wfti-h5");
  assert.match(config.share.link, /uid=1001/);
});

test("buildLinkagePayload exposes minimum consumer fields", () => {
  const payload = buildLinkagePayload({
    uid: "1001",
    personality_code: "COMMANDER",
    personality_name: "热血掌旗官",
    updated_at: "2026-04-27T10:30:00+08:00",
    level_vector: ["M", "M", "H", "H", "H", "H", "H", "M"],
    raw_scores: { F1: 3, F2: 4, E1: 6, E2: 5, S1: 6, S2: 5, A1: 5, A2: 4 },
  });
  assert.deepEqual(payload.consume_scenarios, [
    "worldcup_topic_card",
    "personalized_push",
    "jinx_easter_egg",
    "community_floating_entry",
    "profile_personality_tag",
  ]);
});
