import Ajv from "ajv";
import { I18nConfig } from "../i18n.types";

const schema = {
  type: "object",
  properties: {
    scanDirs: { type: "array", items: { type: "string" } },
    exclude: { type: "array", items: { type: "string" } },
    translationDir: { type: "string" },
    languages: { type: "array", items: { type: "string" } },
    extendedTranslationFiles: { type: "array", items: { type: "string" } },
    model: { type: "string" },
    requirements: { type: "array", items: { type: "string" } },
    ignores: { type: "array", items: { type: "string" } }
  },
  required: ["scanDirs", "translationDir", "languages", "model"],
  additionalProperties: false
} as const;

const ajv = new Ajv();
const validate = ajv.compile<I18nConfig>(schema);

export function parseConfig(raw: string): I18nConfig {
  const data = JSON.parse(raw);
  if (!validate(data)) {
    const errors = ajv.errorsText(validate.errors);
    throw new Error(`Invalid config: ${errors}`);
  }
  return data;
}

