import { defaultActivityConfig, RETRY_DELAYS_MS } from "../config.js";
import { getMockActivityConfig, getMockLatestResult, getMockQrConfig, saveMockResult } from "./mock.js";
import { loadPendingResultQueue, savePendingResult } from "./storage.js";
import { logError, track } from "./tracker.js";

function getMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get("mode") || "mock";
}

export async function getActivityConfig() {
  if (getMode() === "real") {
    return defaultActivityConfig;
  }
  return getMockActivityConfig();
}

export async function getLatestResult(uid) {
  if (getMode() === "real") {
    return { uid, hasResult: false, latestResult: null, pending: "【待接口确认】latest result API" };
  }
  return getMockLatestResult(uid);
}

export async function saveResult(payload) {
  if (getMode() === "real") {
    return {
      success: false,
      pending: "【待接口确认】save result API"
    };
  }
  return saveMockResult(payload);
}

export async function getQrConfig(personalityCode) {
  if (getMode() === "real") {
    return {
      link: `${defaultActivityConfig.qrLandingUrl}&personality=${personalityCode}`,
      imageUrl: "",
      pending: "【待接口确认】qr config API"
    };
  }
  return getMockQrConfig(personalityCode);
}

export async function syncPendingResults() {
  const queue = loadPendingResultQueue();
  if (!queue.length) {
    return;
  }
  const nextQueue = [];
  for (const item of queue) {
    let synced = false;
    for (let index = 0; index < RETRY_DELAYS_MS.length; index += 1) {
      try {
        if (index > 0) {
          await new Promise((resolve) => window.setTimeout(resolve, RETRY_DELAYS_MS[index]));
        }
        const response = await saveResult(item.payload);
        if (response.success) {
          track("wfti_result_save_success", {
            uid: item.payload.uid,
            personalityCode: item.payload.personalityCode,
            retryIndex: index
          });
          synced = true;
          break;
        }
      } catch (error) {
        logError("wfti_result_save_fail", {
          uid: item.payload.uid,
          retryIndex: index,
          error: error.message
        });
      }
    }
    if (!synced) {
      nextQueue.push(item);
    }
  }
  savePendingResult(nextQueue);
}

export function enqueuePendingResult(payload) {
  const queue = loadPendingResultQueue();
  queue.push({ payload, queuedAt: new Date().toISOString() });
  savePendingResult(queue);
}
