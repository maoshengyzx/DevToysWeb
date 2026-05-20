import { useState, useMemo } from "react"
import { Textarea } from "@/components/ui/shared"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

function decodeJwt(token: string): { header: object; payload: object; error?: string } | null {
  try {
    const parts = token.trim().split(".")
    if (parts.length !== 3) return null
    const header = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")))
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")))

    if (payload.exp) {
      payload["_exp_readable"] = new Date(payload.exp * 1000).toLocaleString()
    }
    if (payload.iat) {
      payload["_iat_readable"] = new Date(payload.iat * 1000).toLocaleString()
    }
    if (payload.nbf) {
      payload["_nbf_readable"] = new Date(payload.nbf * 1000).toLocaleString()
    }

    return { header, payload }
  } catch {
    return { header: {}, payload: {}, error: "Invalid JWT token" }
  }
}

export function JwtDecoder() {
  const [input, setInput] = useState("")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [, handleCopyBase] = useCopyToClipboard()

  const decoded = useMemo(() => {
    if (!input.trim()) return null
    return decodeJwt(input)
  }, [input])

  const handleCopy = async (text: string, label: string) => {
    await handleCopyBase(text)
    setCopiedKey(label)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">JWT Token</label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JWT token here..."
            className="min-h-[120px]"
          />
        </div>
        {decoded && (
          <>
            {decoded.error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {decoded.error}
              </div>
            )}
            {!decoded.error && (
              <>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Header</label>
                    <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(JSON.stringify(decoded.header, null, 2), "header")}>
                      {copiedKey === "header" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedKey === "header" ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <pre className="overflow-auto rounded-md border border-border bg-muted p-3 text-xs font-mono text-foreground">
                    {JSON.stringify(decoded.header, null, 2)}
                  </pre>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Payload</label>
                    <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(JSON.stringify(decoded.payload, null, 2), "payload")}>
                      {copiedKey === "payload" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedKey === "payload" ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <pre className="overflow-auto rounded-md border border-border bg-muted p-3 text-xs font-mono text-foreground">
                    {JSON.stringify(decoded.payload, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}