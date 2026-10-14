export const TEMPLATE_NAMES = ["default", "ai-only"];

export function selectTemplateName(value) {
  // Keep previously imported subscription URLs working after the rename.
  const name = value === "openai-only" ? "ai-only" : (value ?? "default");
  if (!TEMPLATE_NAMES.includes(name)) {
    throw new Error("未知的 config 模板。");
  }
  return name;
}
