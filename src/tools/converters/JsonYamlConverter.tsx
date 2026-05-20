import { EncoderDecoder } from "@/tools/EncoderDecoderLayout"
import yaml from "js-yaml"

export function JsonYamlConverter() {
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
      encodeLabel="JSON → YAML"
      decodeLabel="YAML → JSON"
      inputPlaceholder="Paste JSON or YAML here..."
    />
  )
}