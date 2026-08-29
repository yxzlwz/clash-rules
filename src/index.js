import configTemplate from "../config.yaml";
import { renderConfig } from "./render.js";

export default {
  fetch(request) {
    const requestUrl = new URL(request.url);
    if (requestUrl.pathname !== "/clash") {
      return new Response("Not found", { status: 404 });
    }
    if (request.method !== "GET") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { Allow: "GET" },
      });
    }

    const name = requestUrl.searchParams.get("name");
    const subscriptionUrl = requestUrl.searchParams.get("url");
    if (!name || !subscriptionUrl) {
      return new Response("缺少必填参数：name 和 url。", { status: 400 });
    }

    try {
      return new Response(renderConfig(configTemplate, name, subscriptionUrl), {
        headers: {
          "Content-Type": "text/yaml; charset=utf-8",
          "Content-Disposition": 'attachment; filename="clash.yaml"',
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch (error) {
      return new Response(error.message, { status: 400 });
    }
  },
};
