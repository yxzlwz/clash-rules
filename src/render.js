import { isMap, parseDocument } from "yaml";

const NAME_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

function readTemplate(template) {
  const document = parseDocument(template);
  if (document.errors.length) throw document.errors[0];
  if (!isMap(document.contents)) {
    throw new Error("模板必须是 YAML 配置对象。");
  }
  return document;
}

export function renderTemplate(template) {
  return readTemplate(template).toString({ lineWidth: 0 });
}

export function renderConfig(template, name, subscriptionUrl) {
  if (!NAME_PATTERN.test(name)) {
    throw new Error("name 只能包含字母、数字、连字符和下划线，长度为 1–64 个字符。");
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(subscriptionUrl);
  } catch {
    throw new Error("url 必须是有效的 HTTP(S) 订阅地址。");
  }
  if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
    throw new Error("url 必须是有效的 HTTP(S) 订阅地址。");
  }

  const document = readTemplate(template);
  document.setIn(["proxy-providers", name], {
    type: "http",
    url: subscriptionUrl,
    path: `./providers/${name}.yaml`,
    interval: 43200,
  });
  return document.toString({ lineWidth: 0 });
}
