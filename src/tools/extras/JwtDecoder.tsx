import { useState, useMemo } from "react"
import { Textarea } from "@/components/ui/shared"
import { Button } from "@/components/ui/button"
import { Copy, Check, Trash2 } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { ErrorBanner } from "@/components/ui/error-banner"
import { useLocale } from "@/i18n/useLocale"

function decodeJwt(token: string): { header: object; payload: object; displayPayload: object; error?: string } | null {
  try {
    const parts = token.trim().split(".")
    if (parts.length !== 3) return null
    const header = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")))
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")))

    const displayPayload: Record<string, unknown> = { ...payload }
    if (payload.exp) {
      displayPayload["_exp_readable"] = new Date(payload.exp * 1000).toLocaleString()
    }
    if (payload.iat) {
      displayPayload["_iat_readable"] = new Date(payload.iat * 1000).toLocaleString()
    }
    if (payload.nbf) {
      displayPayload["_nbf_readable"] = new Date(payload.nbf * 1000).toLocaleString()
    }

    return { header, payload, displayPayload }
  } catch {
    return { header: {}, payload: {}, displayPayload: {}, error: "Invalid JWT token" }
  }
}

export function JwtDecoder() {
  const [input, setInput] = useState("")
  const [pubKey, setPubKey] = useState("")
  const [verifyResult, setVerifyResult] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [, handleCopyBase] = useCopyToClipboard()
  const { t } = useLocale()

  const decoded = useMemo(() => {
    if (!input.trim()) return null
    return decodeJwt(input)
  }, [input])

  const handleCopy = async (text: string, label: string) => {
    await handleCopyBase(text)
    setCopiedKey(label)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const verifySignature = async () => {
    if (!input.trim()) return
    const parts = input.trim().split(".")
    if (parts.length !== 3) {
      setVerifyResult("Invalid JWT: must have 3 parts")
      return
    }

    try {
      const header = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")))

      if (header.alg === "none") {
        setVerifyResult("Algorithm is 'none' — signature is not present")
        return
      }

      if (!header.alg?.startsWith("HS")) {
        setVerifyResult(`Algorithm '${header.alg}' uses asymmetric keys. Paste the secret key for HS* algorithms.`)
        return
      }

      if (!pubKey.trim()) {
        setVerifyResult("Please enter the secret key to verify")
        return
      }

      const encoder = new TextEncoder()
      const data = encoder.encode(parts[0] + "." + parts[1])
      const keyData = encoder.encode(pubKey)

      const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: header.alg === "HS384" ? "SHA-384" : header.alg === "HS512" ? "SHA-512" : "SHA-256" }, false, ["verify"])
      const sigStr = atob(parts[2].replace(/-/g, "+").replace(/_/g, "/"))
      const sigBytes = Uint8Array.from(sigStr, (c) => c.charCodeAt(0))
      const valid = await crypto.subtle.verify("HMAC", key, sigBytes, data)

      setVerifyResult(valid ? "Signature is valid" : "Signature is INVALID")
    } catch (e) {
      setVerifyResult(`Verification failed: ${e instanceof Error ? e.message : "Unknown error"}`)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">{t("tool.jwtDecoder.jwtToken")}</label>
          <Textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setVerifyResult(null) }}
            placeholder={t("tool.jwtDecoder.placeholder")}
            className="min-h-[120px]"
          />
          <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer w-fit" onClick={() => { setInput(""); setVerifyResult(null); }}>
            <Trash2 className="h-3.5 w-3.5" />
            {t("shared.clear")}
          </Button>
        </div>
        {decoded && (
          <>
            {decoded.error && (
              <ErrorBanner message={decoded.error} />
            )}
            {!decoded.error && (
              <>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">{t("tool.jwtDecoder.header")}</label>
                    <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(JSON.stringify(decoded.header, null, 2), "header")}>
                      {copiedKey === "header" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedKey === "header" ? t("shared.copied") : t("shared.copy")}
                    </Button>
                  </div>
                  <pre className="overflow-auto rounded-md border border-border bg-muted p-3 text-xs font-mono text-foreground">
                    {JSON.stringify(decoded.header, null, 2)}
                  </pre>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">{t("tool.jwtDecoder.payload")}</label>
                    <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(JSON.stringify(decoded.displayPayload, null, 2), "payload")}>
                      {copiedKey === "payload" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedKey === "payload" ? t("shared.copied") : t("shared.copy")}
                    </Button>
                  </div>
                  <pre className="overflow-auto rounded-md border border-border bg-muted p-3 text-xs font-mono text-foreground">
                    {JSON.stringify(decoded.displayPayload, null, 2)}
                  </pre>
                </div>
                <details className="rounded-md border border-border">
                  <summary className="cursor-pointer px-3 py-2 text-xs text-muted-foreground hover:text-foreground">{t("tool.jwtDecoder.verifySignature")}</summary>
                  <div className="px-3 pb-3 space-y-2">
                    <input
                      type="text"
                      value={pubKey}
                      onChange={(e) => { setPubKey(e.target.value); setVerifyResult(null) }}
                      placeholder={t("tool.jwtDecoder.secretKeyPlaceholder")}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <Button variant="outline" size="sm" className="cursor-pointer" onClick={verifySignature}>{t("tool.jwtDecoder.verify")}</Button>
                    {verifyResult && (
                      <p className={`text-xs ${verifyResult.includes("valid") && !verifyResult.includes("INVALID") ? "text-green-500" : "text-destructive"}`}>
                        {verifyResult}
                      </p>
                    )}
                  </div>
                </details>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
