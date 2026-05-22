import { useLocale } from "@/i18n/useLocale"
import { EncoderDecoder } from "@/tools/EncoderDecoderLayout"
import { encode as heEncode, decode as heDecode } from "he"

function encodeHtml(input: string): string {
  return heEncode(input, { useNamedReferences: true })
}

function decodeHtml(input: string): string {
  return heDecode(input, { strict: false })
}

export function HtmlEncoder() {
  const { t } = useLocale()
  return (
    <EncoderDecoder
      encode={encodeHtml}
      decode={decodeHtml}
      encodeLabel={t("tool.htmlEncode.encode")}
      decodeLabel={t("tool.htmlEncode.decode")}
      inputPlaceholder={t("tool.htmlEncode.placeholder")}
    />
  )
}
