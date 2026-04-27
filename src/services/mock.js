import { defaultActivityConfig } from "../config.js";

const mockUid = "guest-demo-001";

export function getMockActivityConfig() {
  return Promise.resolve(defaultActivityConfig);
}

export function getMockEnv() {
  return Promise.resolve({
    platform: "web_mock",
    appVersion: "mock-1.0.0",
    webviewVersion: "browser",
    bridgeReady: true
  });
}

export function getMockLoginResult() {
  return Promise.resolve({
    uid: mockUid,
    token: "mock-token",
    nickname: "吧友 001"
  });
}

export function getMockLatestResult(uid) {
  const raw = window.localStorage.getItem(`wfti_mock_latest_result_${uid}`);
  return Promise.resolve(raw ? JSON.parse(raw) : { uid, hasResult: false, latestResult: null });
}

export function saveMockResult(payload) {
  const response = {
    uid: payload.uid,
    hasResult: true,
    latestResult: {
      ...payload,
      updatedAt: new Date().toISOString()
    }
  };
  window.localStorage.setItem(`wfti_mock_latest_result_${payload.uid}`, JSON.stringify(response));
  return Promise.resolve({
    success: true,
    version: Date.now().toString(),
    updatedAt: response.latestResult.updatedAt
  });
}

export function getMockQrConfig(personalityCode) {
  return Promise.resolve({
    link: `${defaultActivityConfig.qrLandingUrl}&personality=${personalityCode}`,
    imageUrl: ""
  });
}
