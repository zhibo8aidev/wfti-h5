import assert from "node:assert/strict";
import { computePersonality, findNearestPersona, numericVectorFromRawScores } from "./personalityEngine.js";

const allA = Array(16).fill("A");
const allB = Array(16).fill("B");
const allC = Array(16).fill("C");

const allAResult = computePersonality(allA);
assert.equal(allAResult.personalityCode, "MONK");

const allBResult = computePersonality(allB);
assert.equal(allBResult.personalityCode, "YOLO");

const allCResult = computePersonality(allC);
assert.equal(allCResult.personalityCode, "VIBE");

const hiddenPriorityAnswers = ["A", "A", "A", "A", "A", "A", "C", "A", "A", "A", "A", "C", "A", "A", "A", "C"];
assert.equal(computePersonality(hiddenPriorityAnswers).personalityCode, "TROL");

const tieMatch = findNearestPersona([1, 1, 1, 1, 1, 1, 1, 2]);
assert.equal(tieMatch.code, "GURU");

const invalidResult = computePersonality(Array(16).fill("Z"));
assert.equal(invalidResult.answers.every((answer) => answer === "B"), true);
assert.deepEqual(
  numericVectorFromRawScores(invalidResult.rawScores),
  Array(8).fill(2)
);

console.log("personalityEngine tests passed");
