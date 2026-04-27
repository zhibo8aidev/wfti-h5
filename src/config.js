export const APP_VERSION = "0.1.0";
export const TOTAL_QUESTIONS = 16;
export const CALCULATION_DELAY_MS = 2500;
export const QUIZ_DRAFT_KEY = "wfti_quiz_draft_v1";
export const PENDING_RESULT_KEY = "wfti_pending_result_v1";
export const ACTIVITY_CONFIG_KEY = "wfti_env_cache_v1";
export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;
export const POSTER_TIMEOUT_MS = 5000;
export const POSTER_MAX_FAILURES = 3;
export const RETRY_DELAYS_MS = [2000, 4000, 8000];

export const defaultActivityConfig = {
  title: "WFTI - 世界杯球迷人格大鉴赏",
  slogan: "你不是在看世界杯，你是在演你自己。",
  summary: "16 道题，3 分钟，测出你的世界杯球迷人格密码",
  activityStatus: "online",
  startAt: "2026-06-01T00:00:00+08:00",
  endAt: "2026-07-31T23:59:59+08:00",
  qrLandingUrl: "https://example.com/wfti?source=poster",
  shareTemplate:
    "我是 {personalityName} {personalityCode}，来测测你的世界杯球迷人格。",
  featureFlags: {
    poster: true,
    share: true,
    routeJump: true
  },
  pendingNotes: {
    bridge: "【待桥接确认】登录、分享、保存相册、站内跳转均通过 adapter/mock 提供。",
    api: "【待接口确认】历史结果、结果写入、二维码与站内联动配置均通过 repository/mock 提供。"
  }
};
