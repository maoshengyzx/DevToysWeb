import { useState, useCallback } from "react"
import { Textarea } from "@/components/ui/shared"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

const algorithms = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const
type Algorithm = typeof algorithms[number]

async function hashText(text: string, algo: Algorithm): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest(algo, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export function HashGenerator() {
  const [input, setInput] = useState("")
  const [results, setResults] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState<string | null>(null)

  const handleInputChange = async (value: string) => {
    setInput(value)
    if (!value) {
      setResults({})
      return
    }
    const newResults: Record<string, string> = {}
    for (const algo of algorithms) {
      newResults[algo] = await hashText(value, algo)
    }
    setResults(newResults)
  }

  const handleCopy = useCallback(async (algo: string) => {
    const text = results[algo]
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(algo)
    setTimeout(() => setCopied(null), 2000)
  }, [results])

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="flex flex-col gap-2 mb-6">
          <label className="text-sm font-medium text-foreground">Input</label>
          <Textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Type or paste text to hash..."
          />
        </div>
        {Object.keys(results).length > 0 && (
          <div className="flex flex-col gap-3">
            {algorithms.map((algo) => (
              <div key={algo} className="flex items-center gap-2">
                <span className="w-20 shrink-0 text-sm font-medium text-muted-foreground">{algo}</span>
                <code className="flex-1 rounded-md border border-border bg-muted px-3 py-2 text-xs font-mono text-foreground break-all select-all">
                  {results[algo]}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 cursor-pointer"
                  onClick={() => handleCopy(algo)}
                >
                  {copied === algo ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}