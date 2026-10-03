const publishRoutePattern = /^\/api\/devvault\/admin\/content(?:\/[^/]+)?\/?$/;

const getContentLength = (content) => {
  if (content === undefined || content === null) {
    return 0;
  }

  const serialized =
    typeof content === "string" ? content : JSON.stringify(content);
  return Buffer.byteLength(serialized);
};

const redactSensitiveValues = (value) =>
  value.replace(/(\bBearer\s+)\S+/gi, "$1[omitted]").slice(0, 500);

const devVaultPublishDiagnostics = (req, res, next) => {
  if (
    !["POST", "PUT"].includes(req.method) ||
    !publishRoutePattern.test(req.path)
  ) {
    return next();
  }

  let rejectionReason = null;
  const originalJson = res.json;

  res.json = function (body) {
    if (res.statusCode >= 400 && typeof body?.message === "string") {
      rejectionReason = redactSensitiveValues(body.message);
    }
    return originalJson.call(this, body);
  };

  res.on("finish", () => {
    const statusCode = res.statusCode;
    const authenticatedUserId =
      req.user?.userId?.toString?.() ?? req.user?.id?.toString?.() ?? null;
    const validationResult =
      statusCode >= 200 && statusCode < 300
        ? "passed"
        : statusCode === 400
          ? "rejected"
          : "not confirmed (content validation may not have been reached)";

    console.info(
      "[DevVault publish diagnostic]",
      JSON.stringify({
        route: `${req.method} ${req.path}`,
        authenticatedUserId,
        authenticationResult: authenticatedUserId
          ? "passed"
          : statusCode === 401
            ? "rejected"
            : "not established",
        requestBodyLengthBytes: Number(req.headers["content-length"]) || null,
        contentLengthBytes: getContentLength(req.body?.content),
        statusCode,
        validationResult,
        sanitizerResult: "no Markdown-body sanitizer or filter is configured",
        rejectionReason,
      })
    );
  });

  next();
};

export default devVaultPublishDiagnostics;
