const http = require("node:http");
const { URL } = require("node:url");
const { createResultRepository } = require("./result-repository");
const { getActivityConfig, buildPosterPayload, buildLinkagePayload } = require("./wfti-config");
const {
  badRequest,
  json,
  methodNotAllowed,
  notFound,
  readJsonBody,
  sendError,
} = require("./http-utils");
const { validateResultPayload, validateUidQuery } = require("./validators");

const port = Number(process.env.PORT || 8787);
const repository = createResultRepository();

function route(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = requestUrl.pathname;

  if (req.method === "GET" && pathname === "/healthz") {
    return json(res, 200, {
      ok: true,
      service: "wfti-backend",
      mode: "mock-service-adapter",
      now: new Date().toISOString(),
    });
  }

  if (req.method === "POST" && pathname === "/api/wfti/result") {
    return handleSaveResult(req, res);
  }

  if (req.method === "GET" && pathname === "/api/wfti/result/latest") {
    return handleGetLatestResult(requestUrl, res);
  }

  if (req.method === "GET" && pathname === "/api/wfti/config") {
    return handleGetConfig(requestUrl, res);
  }

  if (req.method === "GET" && pathname === "/api/wfti/linkage/latest") {
    return handleGetLinkagePayload(requestUrl, res);
  }

  const allowedRoutes = new Set([
    "GET /healthz",
    "POST /api/wfti/result",
    "GET /api/wfti/result/latest",
    "GET /api/wfti/config",
    "GET /api/wfti/linkage/latest",
  ]);
  const routeKey = `${req.method} ${pathname}`;
  if ([...allowedRoutes].some((item) => item.endsWith(` ${pathname}`))) {
    return methodNotAllowed(res, pathname);
  }
  return notFound(res, routeKey);
}

async function handleSaveResult(req, res) {
  try {
    const body = await readJsonBody(req);
    const validation = validateResultPayload(body);
    if (!validation.ok) {
      return badRequest(res, "INVALID_RESULT_PAYLOAD", validation.errors);
    }

    const saved = repository.saveResult(validation.value);
    return json(res, 200, {
      success: true,
      mode: "mock-service-adapter",
      data: {
        uid: saved.uid,
        version: saved.version,
        stored_at: saved.updated_at,
        computed_at: saved.computed_at,
        personality_code: saved.personality_code,
        personality_name: saved.personality_name,
        overwrite: saved.overwrite,
        idempotent_hit: saved.idempotent_hit,
      },
      meta: {
        note: "【待接口确认】当前为本地文件仓 mock/service adapter，实现了覆盖写入与幂等去重语义。",
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
}

function handleGetLatestResult(requestUrl, res) {
  const uid = requestUrl.searchParams.get("uid");
  const validation = validateUidQuery(uid);
  if (!validation.ok) {
    return badRequest(res, "INVALID_UID", validation.errors);
  }

  const result = repository.getLatestResult(uid);
  return json(res, 200, {
    uid,
    has_result: Boolean(result),
    latest_result: result,
    meta: {
      mode: "mock-service-adapter",
      note: result
        ? "返回当前 uid 最新结果，供落地页和结果页联调。"
        : "当前 uid 暂无结果，前端可据此展示未测试态。",
    },
  });
}

function handleGetConfig(requestUrl, res) {
  const uid = requestUrl.searchParams.get("uid") || "";
  const config = getActivityConfig(uid);
  return json(res, 200, {
    data: config,
    meta: {
      mode: "mock-service-adapter",
      note: "【待接口确认】二维码、分享文案、站内联动路由先由配置接口下发，后续可替换为真实配置中心。",
      poster_payload_schema: buildPosterPayload(config),
    },
  });
}

function handleGetLinkagePayload(requestUrl, res) {
  const uid = requestUrl.searchParams.get("uid");
  const validation = validateUidQuery(uid);
  if (!validation.ok) {
    return badRequest(res, "INVALID_UID", validation.errors);
  }

  const result = repository.getLatestResult(uid);
  return json(res, 200, {
    uid,
    has_result: Boolean(result),
    linkage_payload: result ? buildLinkagePayload(result) : null,
    meta: {
      mode: "mock-service-adapter",
      note: "【待接口确认】此接口定义站内联动最小消费字段边界，不包含外部业务触发逻辑。",
    },
  });
}

const server = http.createServer((req, res) => {
  route(req, res).catch((error) => {
    sendError(res, error);
  });
});

server.listen(port, () => {
  console.log(`WFTI backend listening on http://127.0.0.1:${port}`);
});
