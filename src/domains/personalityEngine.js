import { dimensions, questions } from "../data/questions.js";
import { personas, personaOrder, personaVectors } from "../data/personas.js";
import { nowIso } from "../utils/helpers.js";

const answerScoreMap = { A: 1, B: 2, C: 3 };
const levelThresholds = [
  { max: 3, level: "L", value: 1 },
  { max: 4, level: "M", value: 2 },
  { max: Infinity, level: "H", value: 3 }
];

export function normalizeAnswers(answers) {
  return questions.map((question, index) => {
    const value = answers[index];
    return answerScoreMap[value] ? value : "B";
  });
}

export function detectHiddenPersona(answers) {
  const normalized = normalizeAnswers(answers);
  const isTrol = normalized[2] === "A" && normalized[11] === "C" && normalized[8] === "A";
  const isHero = normalized[12] === "A" && normalized[15] === "C" && normalized[6] === "C";
  if (isTrol) {
    return personas.TROL;
  }
  if (isHero) {
    return personas.HERO;
  }
  return null;
}

export function computeRawScores(answers) {
  const normalized = normalizeAnswers(answers);
  return dimensions.reduce((accumulator, dimension) => {
    const score = dimension.questionIds.reduce((sum, questionId) => {
      return sum + answerScoreMap[normalized[questionId - 1]];
    }, 0);
    accumulator[dimension.key] = score;
    return accumulator;
  }, {});
}

export function mapLevels(rawScores) {
  return dimensions.map((dimension) => {
    const score = rawScores[dimension.key];
    return levelThresholds.find((item) => score <= item.max);
  });
}

export function levelVectorFromRawScores(rawScores) {
  return mapLevels(rawScores).map((item) => item.level);
}

export function numericVectorFromRawScores(rawScores) {
  return mapLevels(rawScores).map((item) => item.value);
}

export function findNearestPersona(vector) {
  let bestCode = "MOOD";
  let bestDistance = Number.POSITIVE_INFINITY;

  personaOrder.forEach((code) => {
    const distance = vector.reduce((sum, value, index) => {
      return sum + Math.abs(value - personaVectors[code][index]);
    }, 0);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestCode = code;
    }
  });

  return { code: bestCode, distance: bestDistance, persona: personas[bestCode] };
}

export function computePersonality(answers) {
  const normalized = normalizeAnswers(answers);
  const rawScores = computeRawScores(normalized);
  const levelVector = levelVectorFromRawScores(rawScores);
  const numericVector = numericVectorFromRawScores(rawScores);
  const hidden = detectHiddenPersona(normalized);
  const matched = hidden ? { persona: hidden, distance: 0 } : findNearestPersona(numericVector);
  const persona = matched.persona || personas.MOOD;

  return {
    personalityCode: persona.code,
    personalityName: persona.name,
    isHidden: Boolean(persona.isHidden),
    rawScores,
    levelVector,
    numericVector,
    answers: normalized,
    computedAt: nowIso(),
    persona
  };
}
