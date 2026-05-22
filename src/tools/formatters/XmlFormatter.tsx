import { Formatter } from "@/tools/FormatterLayout"
import xmlFormatter from "xml-formatter"
import { useLocale } from "@/i18n/useLocale"

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
  const { t } = useLocale()
  return (
    <Formatter
      format={formatXml}
      minify={minifyXml}
      inputPlaceholder={t("tool.xmlFormat.placeholder")}
      indentOptions={[
        { label: "2 spaces", value: 2 },
        { label: "4 spaces", value: 4 },
      ]}
    />
  )
}