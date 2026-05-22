import { useLocale } from "@/i18n/useLocale"
import { EncoderDecoder } from "@/tools/EncoderDecoderLayout"

export function UrlEncoder() {
  const { t } = useLocale()
  return (
    <EncoderDecoder
      encode={(s) => encodeURIComponent(s)}
      decode={(s) => decodeURIComponent(s)}
      encodeLabel={t("tool.urlEncode.encode")}
      decodeLabel={t("tool.urlEncode.decode")}
      inputPlaceholder={t("tool.urlEncode.placeholder")}
    />
  )
}
