import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ReadOnlyTextarea } from "@/components/ui/shared"
import { Copy, Check, Download, Plus, Trash2 } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

interface Rule {
  userAgent: string
  disallow: string[]
  allow: string[]
  crawlDelay: string
}

export function RobotsTxtGenerator() {
  const [rules, setRules] = useState<Rule[]>([
    { userAgent: "*", disallow: ["/admin/", "/private/"], allow: ["/public/"], crawlDelay: "" },
  ])
  const [sitemap, setSitemap] = useState("")
  const [copied, handleCopy] = useCopyToClipboard()

  const output = generateRobotsTxt(rules, sitemap)

  function generateRobotsTxt(rules: Rule[], sitemapUrl: string): string {
    const lines: string[] = []
    for (const rule of rules) {
      lines.push(`User-agent: ${rule.userAgent}`)
      for (const d of rule.disallow) {
        lines.push(`Disallow: ${d}`)
      }
      for (const a of rule.allow) {
        lines.push(`Allow: ${a}`)
      }
      if (rule.crawlDelay) {
        lines.push(`Crawl-delay: ${rule.crawlDelay}`)
      }
      lines.push("")
    }
    if (sitemapUrl) {
      lines.push(`Sitemap: ${sitemapUrl}`)
    }
    return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n"
  }

  const addRule = () => {
    setRules([...rules, { userAgent: "*", disallow: [], allow: [], crawlDelay: "" }])
  }

  const removeRule = (i: number) => setRules(rules.filter((_, j) => j !== i))

  const updateRule = (i: number, field: keyof Rule, value: string | string[]) => {
    const next = [...rules]
    next[i] = { ...next[i], [field]: value }
    setRules(next)
  }

  const addDisallow = (i: number) => {
    const next = [...rules]
    next[i] = { ...next[i], disallow: [...next[i].disallow, "/"] }
    setRules(next)
  }

  const removeDisallow = (i: number, j: number) => {
    const next = [...rules]
    next[i] = { ...next[i], disallow: next[i].disallow.filter((_, k) => k !== j) }
    setRules(next)
  }

  const updateDisallow = (i: number, j: number, val: string) => {
    const next = [...rules]
    const disallow = [...next[i].disallow]
    disallow[j] = val
    next[i] = { ...next[i], disallow }
    setRules(next)
  }

  const addAllow = (i: number) => {
    const next = [...rules]
    next[i] = { ...next[i], allow: [...next[i].allow, "/"] }
    setRules(next)
  }

  const removeAllow = (i: number, j: number) => {
    const next = [...rules]
    next[i] = { ...next[i], allow: next[i].allow.filter((_, k) => k !== j) }
    setRules(next)
  }

  const updateAllow = (i: number, j: number, val: string) => {
    const next = [...rules]
    const allow = [...next[i].allow]
    allow[j] = val
    next[i] = { ...next[i], allow }
    setRules(next)
  }

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "robots.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {rules.map((rule, i) => (
          <div key={i} className="rounded-md border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Rule {i + 1}</span>
              {rules.length > 1 && (
                <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={() => removeRule(i)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground w-24">User-agent:</label>
              <input
                type="text"
                value={rule.userAgent}
                onChange={(e) => updateRule(i, "userAgent", e.target.value)}
                className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Disallow paths:</span>
                <Button variant="ghost" size="sm" className="h-6 text-xs cursor-pointer" onClick={() => addDisallow(i)}>
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>
              {rule.disallow.map((d, j) => (
                <div key={j} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={d}
                    onChange={(e) => updateDisallow(i, j, e.target.value)}
                    className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm font-mono text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 cursor-pointer" onClick={() => removeDisallow(i, j)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Allow paths:</span>
                <Button variant="ghost" size="sm" className="h-6 text-xs cursor-pointer" onClick={() => addAllow(i)}>
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>
              {rule.allow.map((a, j) => (
                <div key={j} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={a}
                    onChange={(e) => updateAllow(i, j, e.target.value)}
                    className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm font-mono text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 cursor-pointer" onClick={() => removeAllow(i, j)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground w-24">Crawl-delay:</label>
              <input
                type="text"
                value={rule.crawlDelay}
                onChange={(e) => updateRule(i, "crawlDelay", e.target.value)}
                placeholder="e.g. 10 (seconds)"
                className="h-8 w-40 rounded-md border border-input bg-background px-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
        ))}

        <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={addRule}>
          <Plus className="h-3.5 w-3.5" /> Add Rule
        </Button>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground shrink-0">Sitemap URL:</label>
          <input
            type="url"
            value={sitemap}
            onChange={(e) => setSitemap(e.target.value)}
            placeholder="https://example.com/sitemap.xml"
            className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Generated robots.txt</label>
          <ReadOnlyTextarea value={output} className="min-h-[200px]" />
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(output)}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={handleDownload}>
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}