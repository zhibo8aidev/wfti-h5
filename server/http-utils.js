function json(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload, null, 2));
}

function badRequest(res, code, details) {
  return json(res, 400, {
    success: false,
    error: {
      code,
      details,
    },
  });
}

function notFound(res, routeKey) {
  return json(res, 404, {
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route not found: ${routeKey}`,
    },
  });
}

function methodNotAllowed(res, pathname) {
  return json(res, 405, {
    success: false,
    error: {
      code: "METHOD_NOT_ALLOWED",
      message: `Method not allowed for ${pathname}`,
    },
  });
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch (error) {
        reject(Object.assign(new Error("Invalid JSON body"), { statusCode: 400, code: "INVALID_JSON" }));
      }
    });
    req.on("error", reject);
  });
}

function sendError(res, error) {
  const statusCode = error.statusCode || 500;
  return json(res, statusCode, {
    success: false,
    error: {
      code: error.code || "INTERNAL_ERROR",
      message: error.message || "Unexpected error",
    },
  });
}

module.exports = {
  badRequest,
  json,
  methodNotAllowed,
  notFound,
  readJsonBody,
  sendError,
};
