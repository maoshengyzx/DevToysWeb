import { Formatter } from "@/tools/FormatterLayout"

function formatXml(xml: string, indent: number = 2): string {
  const PADDING = " ".repeat(indent)
  let formatted = ""
  let depth = 0
  const reg = /(<[^>]+>)/g
  const tags = xml.match(reg)
  if (!tags) return xml

  tags.forEach((tag) => {
    if (tag.match(/^<\w[^>]*[^/]>.*?$/)) {
      if (!tag.match(/^<\w[^>]*[^/]>.*?<\//)) {
        formatted += PADDING.repeat(depth) + tag + "\n"
        depth++
      } else {
        formatted += PADDING.repeat(depth) + tag + "\n"
      }
    } else if (tag.match(/^<\/\w/)) {
      depth--
      formatted += PADDING.repeat(Math.max(0, depth)) + tag + "\n"
    } else if (tag.match(/^<\w[^>]*\/>/)) {
      formatted += PADDING.repeat(depth) + tag + "\n"
    } else {
      formatted += PADDING.repeat(depth) + tag + "\n"
    }
  })
  return formatted.trim()
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