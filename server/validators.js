const allowedAnswers = new Set(["A", "B", "C"]);
const scoreKeys = ["F1", "F2", "E1", "E2", "S1", "S2", "A1", "A2"];
const levelKeys = new Set(["L", "M", "H"]);

function validateUidQuery(uid) {
  if (typeof uid !== "string" || uid.trim() === "") {
    return { ok: false, errors: ["uid is required"] };
  }
  return { ok: true, value: uid.trim() };
}

function validateResultPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== "object") {
    return { ok: false, errors: ["payload must be an object"] };
  }

  const uid = typeof payload.uid === "string" ? payload.uid.trim() : "";
  if (!uid) {
    errors.push("uid is required");
  }

  if (typeof payload.personality_code !== "string" || !payload.personality_code.trim()) {
    errors.push("personality_code is required");
  }

  if (typeof payload.personality_name !== "string" || !payload.personality_name.trim()) {
    errors.push("personality_name is required");
  }

  if (!Array.isArray(payload.answers) || payload.answers.length !== 16) {
    errors.push("answers must contain 16 items");
  } else if (payload.answers.some((answer) => !allowedAnswers.has(answer))) {
    errors.push("answers must only contain A/B/C");
  }

  if (!payload.raw_scores || typeof payload.raw_scores !== "object") {
    errors.push("raw_scores is required");
  } else {
    for (const key of scoreKeys) {
      const value = payload.raw_scores[key];
      if (!Number.isInteger(value) || value < 2 || value > 6) {
        errors.push(`raw_scores.${key} must be an integer between 2 and 6`);
      }
    }
  }

  if (!Array.isArray(payload.level_vector) || payload.level_vector.length !== 8) {
    errors.push("level_vector must contain 8 items");
  } else if (payload.level_vector.some((value) => !levelKeys.has(value))) {
    errors.push("level_vector must only contain L/M/H");
  }

  if (!payload.client_env || typeof payload.client_env !== "object") {
    errors.push("client_env is required");
  }

  if (typeof payload.computed_at !== "string" || !payload.computed_at.trim()) {
    errors.push("computed_at is required");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      uid,
      personality_code: payload.personality_code.trim(),
      personality_name: payload.personality_name.trim(),
      answers: payload.answers,
      raw_scores: payload.raw_scores,
      level_vector: payload.level_vector,
      client_env: payload.client_env,
      computed_at: payload.computed_at.trim(),
    },
  };
}

module.exports = {
  validateResultPayload,
  validateUidQuery,
};
