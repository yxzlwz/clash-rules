export const TEMPLATE_NAMES = ["default", "openai-only"];

export function selectTemplateName(value) {
  const name = value ?? "default";
  if (!TEMPLATE_NAMES.includes(name)) {
    throw new Error(`未知的 config 模板。可选值：${TEMPLATE_NAMES.join("、")}。`);
  }
  return name;
}
