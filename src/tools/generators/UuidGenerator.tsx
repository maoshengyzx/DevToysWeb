import { useState } from "react"
import { useLocale } from "@/i18n/useLocale"
import { Button } from "@/components/ui/button"
import { Copy, Check, RefreshCw } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

function uuidv4(): string {
  return crypto.randomUUID()
}

function uuidv7(): string {
  const ts = Date.now().toString(16).padStart(12, "0")
  const random = new Uint8Array(10)
  crypto.getRandomValues(random)
  let rHex = ""
  for (let i = 0; i < 10; i++) rHex += random[i].toString(16).padStart(2, "0")

  const variantNibble = (parseInt(rHex[3], 16) & 0x03) | 0x08
  const variantHex = variantNibble.toString(16)

  return `${ts.slice(0, 8)}-${ts.slice(8, 12)}-7${rHex.slice(0, 3)}-${variantHex}${rHex.slice(4, 7)}-${rHex.slice(7, 19)}`
}

type Version = "v4" | "v7"

export function UuidGenerator() {
  const { t } = useLocale()
  const [version, setVersion] = useState<Version>("v4")
  const [uuids, setUuids] = useState<string[]>([uuidv4()])
  const [count, setCount] = useState(1)
  const [uppercase, setUppercase] = useState(false)
  const [copied, handleCopy] = useCopyToClipboard()

  const generate = () => {
    const fn = version === "v4" ? uuidv4 : uuidv7
    const newUuids = Array.from({ length: count }, () => {
      const id = fn()
      return uppercase ? id.toUpperCase() : id
    })
    setUuids(newUuids)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-6 py-3 flex-wrap">
        <span className="text-sm text-muted-foreground">{t("tool.uuid.version")}</span>
        <div className="flex rounded-md border border-input overflow-hidden">
          <span
            role="button"
            tabIndex={0}
            onClick={() => setVersion("v4")}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setVersion("v4") }}
            className={`px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
              version === "v4" ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-accent"
            }`}
          >
            v4 (Random)
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={() => setVersion("v7")}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setVersion("v7") }}
            className={`px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
              version === "v7" ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-accent"
            }`}
          >
            v7 (Time-sorted)
          </span>
        </div>
        <span className="text-sm text-muted-foreground ml-2">{t("tool.uuid.count")}</span>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
        >
          {[1, 2, 3, 5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => setUppercase(!uppercase)}>
          {uppercase ? t("tool.uuid.uppercase") : t("tool.uuid.lowercase")}
        </Button>
      </div>
      <div className="border-b border-border px-6 py-2">
        <p className="text-xs text-muted-foreground">{version === "v7" ? t("tool.uuid.v7Desc") : t("tool.uuid.v4Desc")}</p>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="flex flex-col gap-2">
          {uuids.map((uuid, i) => (
            <div key={i} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 font-mono text-sm select-all">
              {uuid}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Button className="gap-1.5 cursor-pointer" onClick={generate}>
            <RefreshCw className="h-3.5 w-3.5" />
            {t("shared.generate")}
          </Button>
          <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(uuids.join("\n"))}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? t("shared.copied") : t("shared.copy")}
          </Button>
        </div>
      </div>
    </div>
  )
}
