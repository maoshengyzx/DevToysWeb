import { EncoderDecoder } from "@/tools/EncoderDecoderLayout"

const htmlEntities: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

function encodeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (c) => htmlEntities[c] ?? c)
}

function decodeHtml(input: string): string {
  const el = document.createElement("textarea")
  el.innerHTML = input
  return el.value
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