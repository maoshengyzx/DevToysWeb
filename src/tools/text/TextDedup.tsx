import { useState, useMemo } from "react"
import { Textarea, ReadOnlyTextarea } from "@/components/ui/shared"
import { Button } from "@/components/ui/button"
import { Copy, Check, Trash2 } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

type DedupMode = "exact" | "trim" | "caseInsensitive"

export function TextDedup() {
  const [input, setInput] = useState("")
  const [mode, setMode] = useState<DedupMode>("exact")
  const [sortOutput, setSortOutput] = useState(false)
  const [copied, handleCopy] = useCopyToClipboard()

  const result = useMemo(() => {
    if (!input.trim()) return { output: "", unique: 0, removed: 0 }

    const lines = input.split("\n")
    const seen = new Set<string>()
    const unique: string[] = []

    for (const line of lines) {
      const key = mode === "trim" ? line.trim() : mode === "caseInsensitive" ? line.toLowerCase() : line
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(line)
      }
    }

    const output = sortOutput ? [...unique].sort() : unique
    return {
      output: output.join("\n"),
      unique: unique.length,
      removed: lines.length - unique.length,
    }
  }, [input, mode, sortOutput])

  const handleClear = () => {
    setInput("")
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-6 py-3 flex-wrap">
        <span className="text-sm text-muted-foreground">Mode:</span>
        {([
          { label: "Exact Match", value: "exact" as DedupMode },
          { label: "Trim Whitespace", value: "trim" as DedupMode },
          { label: "Case Insensitive", value: "caseInsensitive" as DedupMode },
        ]).map((opt) => (
          <Button
            key={opt.value}
            variant={mode === opt.value ? "default" : "outline"}
            size="sm"
            className="cursor-pointer"
            onClick={() => setMode(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
        <div className="w-px h-4 bg-border" />
        <label className="flex items-center gap-1.5 cursor-pointer text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={sortOutput}
            onChange={(e) => setSortOutput(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
          />
          Sort output
        </label>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Input (one item per line)</label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your lines here, one per line..."
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Output (unique lines)</label>
              {input.trim() && (
                <span className="text-xs text-muted-foreground">
                  {result.unique} unique, {result.removed} removed
                </span>
              )}
            </div>
            <ReadOnlyTextarea value={result.output} placeholder="Deduplicated lines will appear here..." />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(result.output)}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy Output"}
          </Button>
          <Button variant="ghost" className="gap-1.5 cursor-pointer" onClick={handleClear}>
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  )
}