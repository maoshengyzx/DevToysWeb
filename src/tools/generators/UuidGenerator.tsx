import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, RefreshCw } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

export function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([crypto.randomUUID()])
  const [count, setCount] = useState(1)
  const [uppercase, setUppercase] = useState(false)
  const [copied, handleCopy] = useCopyToClipboard()

  const generate = () => {
    const newUuids = Array.from({ length: count }, () => {
      const id = crypto.randomUUID()
      return uppercase ? id.toUpperCase() : id
    })
    setUuids(newUuids)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-6 py-3">
        <span className="text-sm text-muted-foreground">Count:</span>
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
          {uppercase ? "Uppercase" : "Lowercase"}
        </Button>
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
            Generate
          </Button>
          <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(uuids.join("\n"))}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy All"}
          </Button>
        </div>
      </div>
    </div>
  )
}