import { EncoderDecoder } from "@/tools/EncoderDecoderLayout"

export function Base64Encoder() {
  return (
    <EncoderDecoder
      encode={(s) => {
        const bytes = new TextEncoder().encode(s)
        return btoa(String.fromCharCode(...bytes))
      }}
      decode={(s) => {
        const bytes = Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
        return new TextDecoder().decode(bytes)
      }}
      encodeLabel="Encode"
      decodeLabel="Decode"
      inputPlaceholder="Paste text or Base64 to encode/decode..."
    />
  )
}