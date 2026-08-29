const NAME_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

function yamlSingleQuoted(value) {
  return `'${value.replace(/'/g, "''")}'`;
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

  return template
    .replaceAll("$$NAME$$", name)
    .replaceAll("'$$URL$$'", yamlSingleQuoted(subscriptionUrl));
}
