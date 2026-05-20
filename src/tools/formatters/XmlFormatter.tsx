import { Formatter } from "@/tools/FormatterLayout"
import xmlFormatter from "xml-formatter"

function formatXml(xml: string, indent: number = 2): string {
  return xmlFormatter(xml, {
    indentation: " ".repeat(indent),
    collapseContent: true,
    lineSeparator: "\n",
  })
}

function minifyXml(xml: string): string {
  return xml.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim()
}

export function XmlFormatter() {
  return (
    <Formatter
      format={formatXml}
      minify={minifyXml}
      inputPlaceholder="Paste XML here..."
      indentOptions={[
        { label: "2 spaces", value: 2 },
        { label: "4 spaces", value: 4 },
      ]}
    />
  )
}