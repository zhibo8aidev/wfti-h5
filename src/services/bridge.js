import { APP_VERSION, POSTER_TIMEOUT_MS } from "../config.js";
import { getMockEnv, getMockLoginResult } from "./mock.js";
import { logError, track } from "./tracker.js";
import { withTimeout } from "../utils/helpers.js";

function createPendingResponse(capability, detail) {
  return {
    supported: false,
    pending: detail,
    capability
  };
}

function getMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get("mode") || "mock";
}

export async function getHostEnv() {
  if (getMode() === "real") {
    return {
      platform: "app_webview",
      appVersion: APP_VERSION,
      webviewVersion: "unknown",
      bridgeReady: false,
      pending: "【待桥接确认】getEnv bridge"
    };
  }
  return getMockEnv();
}

export async function ensureLogin() {
  track("wfti_login_exposed");
  if (getMode() === "real") {
    return createPendingResponse("login", "【待桥接确认】login bridge");
  }
  return getMockLoginResult();
}

export async function shareResult({ title, text, url, file }) {
  track("wfti_share_click", { url });
  if (navigator.share) {
    try {
      await withTimeout(
        navigator.share({
          title,
          text,
          url,
          files: file ? [file] : undefined
        }),
        POSTER_TIMEOUT_MS,
        "share timeout"
      );
      track("wfti_share_success", { channel: "navigator.share" });
      return { success: true, channel: "navigator.share" };
    } catch (error) {
      logError("wfti_share_fail", { error: error.message });
    }
  }
  return createPendingResponse("share", "【待桥接确认】share bridge，当前降级为复制文案/系统分享不可用");
}

export async function savePoster(blob) {
  track("wfti_save_album_click");
  if (!blob) {
    return { success: false };
  }
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "wfti-poster.png";
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return {
    success: true,
    channel: "download",
    pending: "【待桥接确认】saveImage bridge，当前降级为浏览器下载"
  };
}

export async function openInAppRoute(route) {
  track("wfti_route_jump_click", { route });
  if (getMode() === "real") {
    return createPendingResponse("openRoute", "【待桥接确认】openRoute bridge");
  }
  window.open(route, "_blank", "noopener");
  return { success: true };
}
