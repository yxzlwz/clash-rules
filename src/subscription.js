// Some subscription servers only include metadata on GET, or reject HEAD.
// Share a deadline across both attempts so metadata cannot delay config forever.
export async function fetchSubscriptionInfo(subscriptionUrl, userAgent, fetchFn = fetch, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers = {
    "User-Agent": /clash|mihomo|stash|nyanpasu/i.test(userAgent ?? "")
      ? userAgent
      : "clash",
  };

  try {
    for (const method of ["HEAD", "GET"]) {
      if (controller.signal.aborted) break;
      try {
        const response = await fetchFn(subscriptionUrl, {
          method, headers, signal: controller.signal, redirect: "follow",
        });
        const info = response.ok ? response.headers.get("Subscription-Userinfo") : null;
        // Only headers are needed; never buffer the subscription's nodes.
        if (response.body) void response.body.cancel().catch(() => {});
        if (info?.trim()) {
          // Keep original values (including absent expiry and unlimited quotas).
          // Older clients require a space after each semicolon.
          return info.split(";").map((field) => field.trim()).filter(Boolean).join("; ");
        }
      } catch {
        // Metadata is optional. A failed HEAD may still allow a GET.
      }
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}
