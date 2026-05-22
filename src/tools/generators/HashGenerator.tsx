import { useState } from "react"
import { Textarea } from "@/components/ui/shared"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import md5 from "md5"

const algorithms = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const
type Algorithm = typeof algorithms[number]

async function hashText(text: string, algo: Algorithm): Promise<string> {
  if (algo === "MD5") return md5(text)
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest(algo, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export function HashGenerator() {
  const [input, setInput] = useState("")
  const [results, setResults] = useState<Record<string, string>>({})
  const [copied, handleCopy] = useCopyToClipboard()

  const handleInputChange = async (value: string) => {
    setInput(value)
    if (!value) {
      setResults({})
      return
    }
    const entries = await Promise.all(
      algorithms.map(async (algo) => [algo, await hashText(value, algo)] as const)
    )
    setResults(Object.fromEntries(entries))
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Input</label>
              <Textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Type or paste text to hash..."
              />
            </div>
            <div className="flex flex-col gap-3">
              {algorithms.map((algo) => (
                <div key={algo} className="flex items-center gap-2">
                  <span className="w-20 shrink-0 text-sm font-medium text-muted-foreground">{algo}</span>
                  <code className="flex-1 rounded-md border border-border bg-muted px-3 py-2 text-xs font-mono text-foreground break-all select-all min-h-[36px]">
                    {results[algo] ?? "\u00A0"}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 cursor-pointer"
                    onClick={() => results[algo] && handleCopy(results[algo])}
                    disabled={!results[algo]}
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              ))}
              {!input && (
                <div className="flex items-center justify-center min-h-[200px] rounded-md border border-dashed border-border text-sm text-muted-foreground">
                  Type text on the left to see hashes
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  )
}