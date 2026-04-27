import { DRAFT_TTL_MS, PENDING_RESULT_KEY, QUIZ_DRAFT_KEY } from "../config.js";
import { safeJsonParse } from "../utils/helpers.js";

function getStorage() {
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
}

export function saveDraft(draft) {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.setItem(QUIZ_DRAFT_KEY, JSON.stringify(draft));
}

export function loadDraft(uid) {
  const storage = getStorage();
  if (!storage) {
    return null;
  }
  const draft = safeJsonParse(storage.getItem(QUIZ_DRAFT_KEY), null);
  if (!draft || draft.uid !== uid) {
    return null;
  }
  if (Date.now() - new Date(draft.draftUpdatedAt).getTime() > DRAFT_TTL_MS) {
    storage.removeItem(QUIZ_DRAFT_KEY);
    return null;
  }
  return draft;
}

export function clearDraft() {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.removeItem(QUIZ_DRAFT_KEY);
}

export function savePendingResult(queue) {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.setItem(PENDING_RESULT_KEY, JSON.stringify(queue));
}

export function loadPendingResultQueue() {
  const storage = getStorage();
  if (!storage) {
    return [];
  }
  return safeJsonParse(storage.getItem(PENDING_RESULT_KEY), []);
}
