import { isMap, isSeq, parseDocument } from "yaml";

const DEFAULT_TIMEOUT_MS = 5000;

function buildHeaders(userAgent) {
  return {
    "User-Agent": /clash|mihomo|stash|nyanpasu/i.test(userAgent ?? "")
      ? userAgent
      : "clash",
  };
}

function normalizeSubscriptionInfo(value) {
  if (!value?.trim()) return null;
  // Keep original values (including absent expiry and unlimited quotas).
  // Older clients require a space after each semicolon.
  return value.split(";").map((field) => field.trim()).filter(Boolean).join("; ");
}

function extractProxies(body) {
  const document = parseDocument(body);
  if (document.errors.length) throw document.errors[0];
  if (!isMap(document.contents)) {
    throw new Error("订阅必须是包含 proxies 的 Clash/Stash YAML。");
  }

  const proxies = document.get("proxies", true);
  if (!isSeq(proxies) || proxies.items.length === 0) {
    throw new Error("订阅缺少可用的 proxies 节点。");
  }

  // Clone the sequence node so later serialization keeps original proxy fields.
  return proxies.clone();
}

export async function fetchSubscription(
  subscriptionUrl,
  userAgent,
  fetchFn = fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchFn(subscriptionUrl, {
      method: "GET",
      headers: buildHeaders(userAgent),
      signal: controller.signal,
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`订阅请求失败（HTTP ${response.status}）。`);
    }

    const body = await response.text();
    return {
      proxies: extractProxies(body),
      info: normalizeSubscriptionInfo(response.headers.get("Subscription-Userinfo")),
    };
  } finally {
    clearTimeout(timer);
  }
}
