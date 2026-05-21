import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ErrorBanner } from "@/components/ui/error-banner"
import { Copy, Check } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

interface WhoisData {
  domain: string
  registrar: string
  creationDate: string
  expirationDate: string
  updatedDate: string
  nameServers: string[]
  status: string[]
  registrant: string
  rawData: string
}

function WhoisField({ label, value, fallback = "N/A" }: { label: string; value: string; fallback?: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="w-32 shrink-0 text-muted-foreground">{label}</span>
      <span className="text-foreground break-all font-mono">{value || fallback}</span>
    </div>
  )
}

export function DomainWhoisLookup() {
  const [domain, setDomain] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<WhoisData | null>(null)
  const [error, setError] = useState("")
  const [copied, handleCopy] = useCopyToClipboard()

  const handleLookup = async () => {
    let d = domain.trim().toLowerCase()
    if (!d) return
    d = d.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "")
    setDomain(d)
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const apiUrl = `https://whois.freeaitools.ai/whois/${encodeURIComponent(d)}`
      const response = await fetch(apiUrl, { signal: AbortSignal.timeout(15000) })
      if (!response.ok) throw new Error(`Lookup failed: ${response.status}`)

      const text = await response.text()
      let data: Record<string, unknown>
      try {
        data = JSON.parse(text)
      } catch {
        setResult({
          domain: d,
          registrar: "",
          creationDate: "",
          expirationDate: "",
          updatedDate: "",
          nameServers: [],
          status: [],
          registrant: "",
          rawData: text,
        })
        setLoading(false)
        return
      }

      const getVal = (keys: string[]): string => {
        for (const key of keys) {
          const val = data[key]
          if (typeof val === "string" && val) return val
          if (Array.isArray(val) && val.length > 0) return val.join(", ")
        }
        return ""
      }

      const nameServers = (() => {
        const ns = data["nameServers"] || data["Name Server"] || data["name_servers"]
        if (Array.isArray(ns)) return ns.map(String)
        if (typeof ns === "string" && ns) return ns.split(",").map((s: string) => s.trim())
        return []
      })()

      const status = (() => {
        const st = data["status"] || data["Domain Status"] || data["statuses"]
        if (Array.isArray(st)) return st.map(String)
        if (typeof st === "string" && st) return st.split(",").map((s: string) => s.trim())
        return []
      })()

      setResult({
        domain: d,
        registrar: getVal(["registrar", "Registrar", "registrarName"]),
        creationDate: getVal(["creationDate", "Creation Date", "createdDate", "created", "Creation_date"]),
        expirationDate: getVal(["expirationDate", "Registry Expiry Date", "expiresDate", "expiration_date", "expires", "Expiry Date"]),
        updatedDate: getVal(["updatedDate", "Updated Date", "lastUpdated", "updated", "Changed"]),
        nameServers,
        status,
        registrant: getVal(["registrant", "Registrant Organization", "registrantOrganization", "Registrant Name"]),
        rawData: JSON.stringify(data, null, 2),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed. The domain may not exist or the service is unavailable.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 max-w-2xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            />
            <Button className="cursor-pointer" onClick={handleLookup} disabled={loading}>
              {loading ? "Looking up..." : "Lookup"}
            </Button>
          </div>

          {error && <ErrorBanner message={error} />}

          {result && (
            <div className="space-y-4">
              <div className="rounded-md border border-border p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Domain Information</h3>
                <WhoisField label="Domain" value={result.domain} />
                <WhoisField label="Registrar" value={result.registrar} />
                <WhoisField label="Registrant" value={result.registrant} />
                <WhoisField label="Created" value={result.creationDate} />
                <WhoisField label="Expires" value={result.expirationDate} />
                <WhoisField label="Updated" value={result.updatedDate} />
                {result.nameServers.length > 0 && (
                  <div className="flex items-start gap-3 text-sm">
                    <span className="w-32 shrink-0 text-muted-foreground">Name Servers</span>
                    <div className="space-y-0.5">
                      {result.nameServers.map((ns, i) => (
                        <div key={i} className="font-mono text-foreground">{ns}</div>
                      ))}
                    </div>
                  </div>
                )}
                {result.status.length > 0 && (
                  <div className="flex items-start gap-3 text-sm">
                    <span className="w-32 shrink-0 text-muted-foreground">Status</span>
                    <div className="space-y-0.5">
                      {result.status.map((s, i) => (
                        <div key={i} className="font-mono text-foreground text-xs">{s}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <details className="rounded-md border border-border">
                <summary className="cursor-pointer px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Raw WHOIS Data</summary>
                <div className="flex items-start gap-2 px-4 pb-3">
                  <pre className="flex-1 overflow-auto rounded bg-muted p-3 text-xs font-mono text-foreground whitespace-pre-wrap break-all max-h-80">
                    {result.rawData}
                  </pre>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 cursor-pointer" onClick={() => handleCopy(result.rawData)}>
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </details>
            </div>
          )}

          {!result && !error && !loading && (
            <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
              Enter a domain name and click Lookup to query WHOIS information
            </div>
          )}
        </div>
      </div>
    </div>
  )
}