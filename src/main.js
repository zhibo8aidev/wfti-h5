import { CALCULATION_DELAY_MS, POSTER_MAX_FAILURES, TOTAL_QUESTIONS } from "./config.js";
import { computePersonality } from "./domains/personalityEngine.js";
import { ensureLogin, getHostEnv, openInAppRoute, savePoster, shareResult } from "./services/bridge.js";
import { generatePoster } from "./services/poster.js";
import {
  enqueuePendingResult,
  getActivityConfig,
  getLatestResult,
  getQrConfig,
  saveResult,
  syncPendingResults
} from "./services/repository.js";
import { clearDraft, loadDraft, saveDraft } from "./services/storage.js";
import { logError, track } from "./services/tracker.js";
import { renderApp } from "./ui.js";
import { formatTimeLabel, nowIso, sleep } from "./utils/helpers.js";

const app = document.querySelector("#app");

const state = {
  screen: "landing",
  activityConfig: null,
  env: null,
  auth: {
    loginStatus: "guest",
    uid: "guest-demo-001",
    token: ""
  },
  latestResult: null,
  quiz: {
    currentQuestionIndex: 0,
    answers: Array(TOTAL_QUESTIONS).fill(""),
    draftUpdatedAt: "",
    resumeEligible: false
  },
  result: {
    pendingPreview: null,
    computedResult: null,
    saveStatus: "idle"
  },
  qrConfig: null,
  poster: {
    generating: false,
    error: "",
    failureCount: 0,
    previewBlob: null,
    previewUrl: ""
  },
  ui: {
    networkMessage: ""
  }
};

function setState(patch) {
  Object.assign(state, patch);
  render();
}

function render() {
  app.innerHTML = renderApp(state);
}

function updateQuiz(patch) {
  state.quiz = { ...state.quiz, ...patch };
  render();
}

function updateResult(patch) {
  state.result = { ...state.result, ...patch };
  render();
}

function updatePoster(patch) {
  if (state.poster.previewUrl && patch.previewBlob && state.poster.previewUrl !== patch.previewUrl) {
    URL.revokeObjectURL(state.poster.previewUrl);
  }
  state.poster = { ...state.poster, ...patch };
  render();
}

async function bootstrap() {
  try {
    setState({ screen: "landing" });
    const [activityConfig, env] = await Promise.all([getActivityConfig(), getHostEnv()]);
    const activityStatus = activityConfig.activityStatus;
    const nextScreen =
      activityStatus === "upcoming" || activityStatus === "ended" ? "activity_unavailable" : "landing";
    state.activityConfig = activityConfig;
    state.env = env;
    state.screen = nextScreen;
    render();
    await hydrateLatestResult();
    syncPendingResults();
    track("wfti_page_view", { screen: state.screen, at: formatTimeLabel() });
  } catch (error) {
    logError("bootstrap_failed", { error: error.message });
    state.ui.networkMessage = error.message;
    state.screen = "network_error";
    render();
  }
}

async function hydrateLatestResult() {
  state.latestResult = await getLatestResult(state.auth.uid);
  render();
}

async function requireLogin() {
  const login = await ensureLogin();
  if (!login.uid) {
    state.auth.loginStatus = "pending_bridge";
    render();
    return false;
  }
  state.auth = {
    loginStatus: "logged",
    uid: login.uid,
    token: login.token
  };
  track("wfti_login_success", { uid: login.uid });
  await hydrateLatestResult();
  return true;
}

function persistDraft() {
  saveDraft({
    version: 1,
    uid: state.auth.uid,
    currentQuestionIndex: state.quiz.currentQuestionIndex,
    answers: state.quiz.answers,
    draftUpdatedAt: nowIso()
  });
}

async function startQuizFlow() {
  const loggedIn = await requireLogin();
  if (!loggedIn) {
    return;
  }

  const draft = loadDraft(state.auth.uid);
  if (draft && draft.answers?.some(Boolean)) {
    track("wfti_resume_prompt_show", { uid: state.auth.uid });
    updateQuiz({
      currentQuestionIndex: draft.currentQuestionIndex,
      answers: draft.answers,
      draftUpdatedAt: draft.draftUpdatedAt,
      resumeEligible: true
    });
    setState({ screen: "resume" });
    return;
  }

  resetQuiz();
  setState({ screen: "quiz" });
  track("wfti_click_start_test", { uid: state.auth.uid });
}

function resetQuiz() {
  clearDraft();
  state.quiz = {
    currentQuestionIndex: 0,
    answers: Array(TOTAL_QUESTIONS).fill(""),
    draftUpdatedAt: "",
    resumeEligible: false
  };
  state.result = {
    pendingPreview: null,
    computedResult: null,
    saveStatus: "idle"
  };
}

async function answerQuestion(answer) {
  const answers = [...state.quiz.answers];
  answers[state.quiz.currentQuestionIndex] = answer;
  const nextIndex = state.quiz.currentQuestionIndex + 1;
  updateQuiz({
    answers,
    currentQuestionIndex: Math.min(nextIndex, TOTAL_QUESTIONS - 1),
    draftUpdatedAt: nowIso()
  });
  persistDraft();
  track("wfti_answer_select", {
    uid: state.auth.uid,
    questionIndex: state.quiz.currentQuestionIndex + 1,
    answer
  });
  if (nextIndex >= TOTAL_QUESTIONS) {
    await runCalculation(answers);
  }
}

async function runCalculation(answers) {
  const computed = computePersonality(answers);
  updateResult({
    pendingPreview: computed,
    computedResult: null,
    saveStatus: "saving"
  });
  setState({ screen: "calculating" });
  await sleep(CALCULATION_DELAY_MS);
  updateResult({
    pendingPreview: computed,
    computedResult: computed,
    saveStatus: "saving"
  });
  clearDraft();
  state.qrConfig = await getQrConfig(computed.personalityCode);
  setState({ screen: "result" });
  track("wfti_result_computed", {
    uid: state.auth.uid,
    personalityCode: computed.personalityCode
  });
  void persistResult(computed);
}

async function persistResult(computed) {
  const payload = {
    uid: state.auth.uid,
    personalityCode: computed.personalityCode,
    personalityName: computed.personalityName,
    answers: computed.answers,
    rawScores: computed.rawScores,
    levelVector: computed.levelVector,
    clientEnv: state.env,
    computedAt: computed.computedAt,
    persona: computed.persona
  };
  try {
    const response = await saveResult(payload);
    if (response.success) {
      updateResult({ saveStatus: "saved" });
      await hydrateLatestResult();
      track("wfti_result_save_success", { uid: state.auth.uid, personalityCode: computed.personalityCode });
      return;
    }
    enqueuePendingResult(payload);
    updateResult({ saveStatus: "queued" });
    track("wfti_result_save_fail", {
      uid: state.auth.uid,
      personalityCode: computed.personalityCode,
      mode: "queued"
    });
  } catch (error) {
    enqueuePendingResult(payload);
    updateResult({ saveStatus: "queued" });
    logError("wfti_result_save_fail", { error: error.message });
  }
}

async function createPosterAndMaybeShare(shareAfterCreate = false) {
  if (state.poster.failureCount >= POSTER_MAX_FAILURES) {
    updatePoster({ error: "海报已连续失败 3 次，请改用系统截图。" });
    setState({ screen: "poster" });
    return;
  }
  const resultData = state.result.computedResult || state.latestResult?.latestResult;
  if (!resultData) {
    return;
  }
  setState({ screen: "poster" });
  updatePoster({ generating: true, error: "" });
  try {
    const blob = await generatePoster(resultData, state.qrConfig || { link: state.activityConfig.qrLandingUrl });
    const previewUrl = URL.createObjectURL(blob);
    updatePoster({
      generating: false,
      previewBlob: blob,
      previewUrl
    });
    if (shareAfterCreate) {
      const file = new File([blob], "wfti-poster.png", { type: "image/png" });
      await shareResult({
        title: `${resultData.personalityName} · ${resultData.personalityCode}`,
        text: resultData.persona.oneLiner,
        url: state.qrConfig?.link || state.activityConfig.qrLandingUrl,
        file
      });
    }
  } catch (error) {
    updatePoster({
      generating: false,
      error: "海报生成失败，请重试。",
      failureCount: state.poster.failureCount + 1
    });
  }
}

async function handleAction(action, target) {
  switch (action) {
    case "start-quiz":
      await startQuizFlow();
      break;
    case "open-latest-result":
      state.result.computedResult = state.latestResult.latestResult;
      state.qrConfig = await getQrConfig(state.result.computedResult.personalityCode);
      setState({ screen: "result" });
      break;
    case "resume-quiz":
      track("wfti_resume_continue", { uid: state.auth.uid });
      setState({ screen: "quiz" });
      break;
    case "restart-quiz":
      track("wfti_resume_restart", { uid: state.auth.uid });
      resetQuiz();
      setState({ screen: "quiz" });
      break;
    case "back-question":
      if (state.quiz.currentQuestionIndex > 0) {
        updateQuiz({ currentQuestionIndex: state.quiz.currentQuestionIndex - 1 });
        track("wfti_answer_back", { uid: state.auth.uid, questionIndex: state.quiz.currentQuestionIndex });
      }
      break;
    case "answer":
      await answerQuestion(target.dataset.value);
      break;
    case "retry-bootstrap":
      await bootstrap();
      break;
    case "go-landing":
      setState({ screen: "landing" });
      break;
    case "share-result":
      await createPosterAndMaybeShare(true);
      break;
    case "save-poster":
      await createPosterAndMaybeShare(false);
      break;
    case "save-poster-direct":
      if (state.poster.previewBlob) {
        await savePoster(state.poster.previewBlob);
      }
      break;
    case "close-poster":
      setState({ screen: "result" });
      break;
    default:
      break;
  }
}

document.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) {
    return;
  }
  const action = target.dataset.action;
  await handleAction(action, target);
});

document.addEventListener("keydown", async (event) => {
  if (event.key.toLowerCase() === "r" && state.screen === "result" && state.qrConfig?.link) {
    await openInAppRoute(state.qrConfig.link);
  }
});

render();
bootstrap();
