// Cloudflare Pages Functions 中间件
// 用于处理请求和响应的全局中间件

const HTML_CONTENT_TYPE = "text/html";
const GOOGLE_ANALYTICS_SCRIPT_URL = "https://www.googletagmanager.com/gtag/js";
const PAIRUSUO_ANALYTICS_SCRIPT_URL = "https://analytics.pairusuo.top/api/script.js";

class AnalyticsScriptsHandler {
  constructor({ gaMeasurementId, pairusuoAnalyticsSiteId }) {
    this.gaMeasurementId = gaMeasurementId;
    this.pairusuoAnalyticsSiteId = pairusuoAnalyticsSiteId;
  }

  element(element) {
    const scripts = [];

    if (this.pairusuoAnalyticsSiteId) {
      const siteIdAttribute = escapeHtmlAttribute(this.pairusuoAnalyticsSiteId);
      scripts.push(
        `<script async src="${PAIRUSUO_ANALYTICS_SCRIPT_URL}" data-site-id="${siteIdAttribute}"></script>`
      );
    }

    if (this.gaMeasurementId) {
      const measurementIdJson = JSON.stringify(this.gaMeasurementId);
      const measurementIdQuery = encodeURIComponent(this.gaMeasurementId);
      scripts.push(
        `<script async src="${GOOGLE_ANALYTICS_SCRIPT_URL}?id=${measurementIdQuery}"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${measurementIdJson});
</script>`
      );
    }

    if (scripts.length > 0) {
      element.append(scripts.join("\n"), { html: true });
    }
  }
}

function getGoogleAnalyticsMeasurementId(env) {
  if (typeof env?.GA_MEASUREMENT_ID !== "string") {
    return "";
  }

  return env.GA_MEASUREMENT_ID.trim();
}

function getPairusuoAnalyticsSiteId(env) {
  if (typeof env?.PAIRUSUO_ANALYTICS_SITE_ID !== "string") {
    return "";
  }

  return env.PAIRUSUO_ANALYTICS_SITE_ID.trim();
}

function escapeHtmlAttribute(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function isProductionEnvironment(env) {
  return env?.APP_ENV === "production";
}

function shouldInjectAnalyticsScripts(request, response, env) {
  if (request.method !== "GET") {
    return false;
  }

  if (!isProductionEnvironment(env)) {
    return false;
  }

  if (!getGoogleAnalyticsMeasurementId(env) && !getPairusuoAnalyticsSiteId(env)) {
    return false;
  }

  const contentType = response.headers.get("content-type") || "";
  return contentType.includes(HTML_CONTENT_TYPE);
}

function applySecurityHeaders(response) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
}

function applyCacheHeaders(response, pathname) {
  if (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/images/") ||
    pathname.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)
  ) {
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  }
}

export async function onRequest(context) {
  const response = await context.next();
  const url = new URL(context.request.url);

  let finalResponse = response;

  if (shouldInjectAnalyticsScripts(context.request, response, context.env)) {
    finalResponse = new HTMLRewriter()
      .on(
        "head",
        new AnalyticsScriptsHandler({
          gaMeasurementId: getGoogleAnalyticsMeasurementId(context.env),
          pairusuoAnalyticsSiteId: getPairusuoAnalyticsSiteId(context.env),
        })
      )
      .transform(response);
  }

  applySecurityHeaders(finalResponse);
  applyCacheHeaders(finalResponse, url.pathname);

  return finalResponse;
}
