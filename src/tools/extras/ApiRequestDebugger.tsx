import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/shared"
import { Copy, Check, Send, Trash2 } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { ErrorBanner } from "@/components/ui/error-banner"
import { useLocale } from "@/i18n/useLocale"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS"

const methods: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "bg-green-500/10 text-green-500 border-green-500/30",
  POST: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  PUT: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  PATCH: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  DELETE: "bg-red-500/10 text-red-500 border-red-500/30",
  HEAD: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  OPTIONS: "bg-gray-500/10 text-gray-500 border-gray-500/30",
}

interface Header {
  key: string
  value: string
}

export function ApiRequestDebugger() {
  const [method, setMethod] = useState<HttpMethod>("GET")
  const [url, setUrl] = useState("")
  const [body, setBody] = useState("")
  const [headers, setHeaders] = useState<Header[]>([{ key: "Content-Type", value: "application/json" }])
  const [response, setResponse] = useState<{ status: number; statusText: string; headers: Record<string, string>; body: string } | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showHeaders, setShowHeaders] = useState(true)
  const [copied, handleCopy] = useCopyToClipboard()
  const { t } = useLocale()

  const sendRequest = async () => {
    if (!url.trim()) {
      setError(t("tool.apiRequest.pleaseEnterUrl"))
      return
    }
    setLoading(true)
    setError("")
    setResponse(null)
    try {
      const fetchHeaders: Record<string, string> = {}
      for (const h of headers) {
        if (h.key.trim()) fetchHeaders[h.key] = h.value
      }
      const res = await fetch(url, {
        method,
        headers: fetchHeaders,
        body: ["GET", "HEAD", "OPTIONS"].includes(method) ? undefined : body || undefined,
      })
      const resBody = await res.text()
      const resHeaders: Record<string, string> = {}
      res.headers.forEach((v, k) => { resHeaders[k] = v })
      let formatted = resBody
      try { formatted = JSON.stringify(JSON.parse(resBody), null, 2) } catch { /* not JSON, use raw */ }
      setResponse({ status: res.status, statusText: res.statusText, headers: resHeaders, body: formatted })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed. Check CORS policy or URL.")
    } finally {
      setLoading(false)
    }
  }

  const addHeader = () => setHeaders([...headers, { key: "", value: "" }])
  const removeHeader = (i: number) => setHeaders(headers.filter((_, j) => j !== i))
  const updateHeader = (i: number, field: "key" | "value", val: string) => {
    const next = [...headers]
    next[i][field] = val
    setHeaders(next)
  }

  const statusColor = (status: number) => {
    if (status < 300) return "text-green-500"
    if (status < 400) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-6 py-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {methods.map((m) => (
              <Button
                key={m}
                variant={method === m ? "default" : "outline"}
                size="sm"
                className={`cursor-pointer ${method === m ? METHOD_COLORS[m] : ""}`}
                onClick={() => setMethod(m)}
              >
                {m}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t("tool.apiRequest.urlPlaceholder")}
            className="h-9 flex-1 rounded-md border border-input bg-background px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            onKeyDown={(e) => e.key === "Enter" && sendRequest()}
          />
          <Button className="gap-1.5 cursor-pointer" onClick={sendRequest} disabled={loading}>
            <Send className="h-3.5 w-3.5" />
            {loading ? t("tool.apiRequest.sending") : t("tool.apiRequest.send")}
          </Button>
        </div>
        {!["GET", "HEAD", "OPTIONS"].includes(method) && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">{t("tool.apiRequest.requestBody")}</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("tool.apiRequest.bodyPlaceholder")}
              className="min-h-[100px]"
            />
          </div>
        )}
        <button
          className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={() => setShowHeaders(!showHeaders)}
        >
          {showHeaders ? t("tool.apiRequest.hideHeaders") : t("tool.apiRequest.showHeaders")} ({headers.length})
        </button>
        {showHeaders && (
          <div className="space-y-2">
            {headers.map((h, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={h.key}
                  onChange={(e) => updateHeader(i, "key", e.target.value)}
                  placeholder={t("tool.apiRequest.headerPlaceholder")}
                  className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <input
                  type="text"
                  value={h.value}
                  onChange={(e) => updateHeader(i, "value", e.target.value)}
                  placeholder={t("tool.apiRequest.valuePlaceholder")}
                  className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 cursor-pointer" onClick={() => removeHeader(i)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="cursor-pointer text-xs" onClick={addHeader}>{t("tool.apiRequest.addHeader")}</Button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-auto p-6">
        {error && <ErrorBanner message={error} />}
        {response && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className={`text-lg font-bold ${statusColor(response.status)}`}>{response.status}</span>
              <span className="text-sm text-muted-foreground">{response.statusText}</span>
              <div className="ml-auto">
                <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(response.body)}>
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? t("shared.copied") : t("shared.copy")}
                </Button>
              </div>
            </div>
            <details open className="rounded-md border border-border">
              <summary className="cursor-pointer px-3 py-2 text-xs text-muted-foreground hover:text-foreground">{t("tool.apiRequest.responseHeaders")}</summary>
              <div className="px-3 pb-2 space-y-1">
                {Object.entries(response.headers).map(([k, v]) => (
                  <div key={k} className="text-xs font-mono">
                    <span className="text-muted-foreground">{k}:</span> <span className="text-foreground">{v}</span>
                  </div>
                ))}
              </div>
            </details>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">{t("tool.apiRequest.responseBody")}</label>
              <pre className="overflow-auto rounded-md border border-border bg-muted p-3 text-xs font-mono text-foreground max-h-[400px]">
                {response.body || "(empty)"}
              </pre>
            </div>
          </div>
        )}
        {!response && !error && (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            {t("tool.apiRequest.emptyHint")}
          </div>
        )}
      </div>
    </div>
  )
}