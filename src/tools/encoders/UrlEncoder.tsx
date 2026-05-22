import { EncoderDecoder } from "@/tools/EncoderDecoderLayout"
import { useLocale } from "@/i18n/useLocale"

export function UrlEncoder() {
  const { t } = useLocale()
  return (
    <EncoderDecoder
      encode={(s) => encodeURIComponent(s)}
      decode={(s) => decodeURIComponent(s)}
      encodeLabel={t("common.encode")}
      decodeLabel={t("common.decode")}
      inputPlaceholder={t("enc.url.label")}
    />
  )
}