import defaultTemplate from "../configs/default.yaml";
import openaiOnlyTemplate from "../configs/openai-only.yaml";
import { renderConfig } from "./render.js";
import { selectTemplateName } from "./templates.js";

const templates = {
  default: defaultTemplate,
  "openai-only": openaiOnlyTemplate,
};

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
      const templateName = selectTemplateName(requestUrl.searchParams.get("config"));
      return new Response(renderConfig(templates[templateName], name, subscriptionUrl), {
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
