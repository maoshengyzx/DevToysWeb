import { EncoderDecoder } from "@/tools/EncoderDecoderLayout"
import yaml from "js-yaml"
import { useLocale } from "@/i18n/useLocale"

export function JsonYamlConverter() {
  const { t } = useLocale()
  const jsonToYaml = (input: string): string => {
    const obj = JSON.parse(input)
    return yaml.dump(obj, { indent: 2, lineWidth: -1 })
  }

  const yamlToJson = (input: string): string => {
    const obj = yaml.load(input)
    return JSON.stringify(obj, null, 2)
  }

  return (
    <EncoderDecoder
      encode={jsonToYaml}
      decode={yamlToJson}
      encodeLabel={t("tool.jsonYaml.jsonToYaml")}
      decodeLabel={t("tool.jsonYaml.yamlToJson")}
      inputPlaceholder={t("tool.jsonYaml.placeholder")}
    />
  )
}