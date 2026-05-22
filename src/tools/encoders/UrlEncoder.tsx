import { EncoderDecoder } from "@/tools/EncoderDecoderLayout"

export function UrlEncoder() {
  return (
    <EncoderDecoder
      encode={(s) => encodeURIComponent(s)}
      decode={(s) => decodeURIComponent(s)}
      encodeLabel="Encode"
      decodeLabel="Decode"
      inputPlaceholder="Paste URL or text to encode/decode..."
    />
  )
}
