import defaultTemplate from "../configs/default.yaml";
import aiOnlyTemplate from "../configs/ai-only.yaml";
import { createHandler } from "./handler.js";

const templates = {
  default: defaultTemplate,
  "ai-only": aiOnlyTemplate,
};

export default { fetch: createHandler(templates) };
