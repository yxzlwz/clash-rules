import { assertSubscriptionParams, renderConfig, renderTemplate } from "./render.js";
import { selectTemplateName } from "./templates.js";
import { fetchSubscription } from "./subscription.js";

export function createHandler(templates, fetchFn = fetch) {
  return async function handleRequest(request) {
    const requestUrl = new URL(request.url);
    const isHead = request.method === "HEAD";
    const respond = (body, options) =>
      new Response(isHead ? null : body, options);
    const isTemplate = requestUrl.pathname === "/clash-template";
    if (requestUrl.pathname !== "/clash" && !isTemplate) {
      return respond("Not found", { status: 404 });
    }
    if (request.method !== "GET" && !isHead) {
      return respond("Method not allowed", {
        status: 405,
        headers: { Allow: "GET, HEAD" },
      });
    }

    const name = requestUrl.searchParams.get("name");
    const subscriptionUrl = requestUrl.searchParams.get("url");
    if (!isTemplate && (!name || !subscriptionUrl)) {
      return respond("Query parameters missing.", { status: 400 });
    }

    let templateName;
    try {
      templateName = selectTemplateName(
        requestUrl.searchParams.get("config") ??
          requestUrl.searchParams.get("template"),
      );
      if (!isTemplate) assertSubscriptionParams(name, subscriptionUrl);
    } catch (error) {
      return respond(error.message, { status: 400 });
    }

    const headers = new Headers({
      "Content-Type": "text/yaml; charset=utf-8",
      "Content-Disposition": 'attachment; filename="clash.yaml"',
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });

    if (isTemplate) {
      return respond(renderTemplate(templates[templateName]), { headers });
    }

    let subscription;
    try {
      subscription = await fetchSubscription(
        subscriptionUrl,
        request.headers.get("User-Agent"),
        fetchFn,
      );
    } catch (error) {
      let message = "订阅请求失败。";
      if (error?.name === "AbortError") {
        message = "订阅请求超时。";
      } else if (/^订阅/.test(error?.message ?? "")) {
        message = error.message;
      }
      return respond(message, { status: 502 });
    }

    let config;
    try {
      config = renderConfig(templates[templateName], subscription.proxies);
    } catch (error) {
      return respond(error.message, { status: 502 });
    }

    if (subscription.info) headers.set("Subscription-Userinfo", subscription.info);
    return respond(config, { headers });
  };
}
