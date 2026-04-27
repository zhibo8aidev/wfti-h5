export function track(event, payload = {}) {
  const tracker = window.__WFTI_TRACKER__;
  if (typeof tracker === "function") {
    tracker(event, payload);
    return;
  }
  console.info("[tracker]", event, payload);
}

export function logError(event, payload = {}) {
  console.error("[wfti:error]", event, payload);
  track(event, { ...payload, level: "error" });
}
