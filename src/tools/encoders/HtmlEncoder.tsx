import { EncoderDecoder } from "@/tools/EncoderDecoderLayout"
import { encode as heEncode, decode as heDecode } from "he"

function encodeHtml(input: string): string {
  return heEncode(input, { useNamedReferences: true })
}

function decodeHtml(input: string): string {
  return heDecode(input, { strict: false })
}

export function HtmlEncoder() {
  return (
    <EncoderDecoder
      encode={encodeHtml}
      decode={decodeHtml}
      encodeLabel="Encode"
      decodeLabel="Decode"
      inputPlaceholder="Paste HTML to encode/decode..."
    />
  )
}
