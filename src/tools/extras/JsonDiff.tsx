import { useState, useMemo } from "react"
import { Textarea } from "@/components/ui/shared"
import { Button } from "@/components/ui/button"
import { Copy, Check, Trash2, ArrowDownUp } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { ErrorBanner } from "@/components/ui/error-banner"

type DiffType = "added" | "removed" | "changed" | "unchanged"

interface DiffLine {
  path: string
  type: DiffType
  left: unknown
  right: unknown
}

function deepDiff(left: unknown, right: unknown, path: string = ""): DiffLine[] {
  if (left === right) return [{ path, type: "unchanged", left, right }]

  if (left === undefined) return [{ path, type: "added", left: undefined, right }]
  if (right === undefined) return [{ path, type: "removed", left, right: undefined }]

  if (typeof left !== typeof right || Array.isArray(left) !== Array.isArray(right)) {
    return [{ path, type: "changed", left, right }]
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    const maxLen = Math.max(left.length, right.length)
    const lines: DiffLine[] = []
    for (let i = 0; i < maxLen; i++) {
      const itemPath = `${path}[${i}]`
      if (i >= left.length) {
        lines.push({ path: itemPath, type: "added", left: undefined, right: right[i] })
      } else if (i >= right.length) {
        lines.push({ path: itemPath, type: "removed", left: left[i], right: undefined })
      } else {
        lines.push(...deepDiff(left[i], right[i], itemPath))
      }
    }
    return lines
  }

  if (typeof left === "object" && left !== null && typeof right === "object" && right !== null) {
    const allKeys = [...new Set([...Object.keys(left as Record<string, unknown>), ...Object.keys(right as Record<string, unknown>)])]
    const lines: DiffLine[] = []
    for (const key of allKeys) {
      const lVal = (left as Record<string, unknown>)[key]
      const rVal = (right as Record<string, unknown>)[key]
      const keyPath = path ? `${path}.${key}` : key
      lines.push(...deepDiff(lVal, rVal, keyPath))
    }
    return lines
  }

  return [{ path, type: "changed", left, right }]
}

function formatValue(v: unknown): string {
  if (v === undefined) return ""
  if (typeof v === "string") return `"${v}"`
  if (v === null) return "null"
  if (typeof v === "object") {
    try { return JSON.stringify(v) } catch { return String(v) }
  }
  return String(v)
}

export function JsonDiff() {
  const [leftInput, setLeftInput] = useState("")
  const [rightInput, setRightInput] = useState("")
  const [showOnlyDiff, setShowOnlyDiff] = useState(false)
  const [copied, handleCopy] = useCopyToClipboard()

  const { lines, error } = useMemo(() => {
    if (!leftInput.trim() && !rightInput.trim()) return { lines: [] as DiffLine[], error: "" }
    try {
      const left = leftInput.trim() ? JSON.parse(leftInput) : null
      const right = rightInput.trim() ? JSON.parse(rightInput) : null
      if (left === null && right === null) return { lines: [] as DiffLine[], error: "" }
      if (left === null) return { lines: [{ path: "$", type: "added" as DiffType, left: undefined as unknown, right: right as unknown }], error: "" }
      if (right === null) return { lines: [{ path: "$", type: "removed" as DiffType, left: left as unknown, right: undefined as unknown }], error: "" }
      return { lines: deepDiff(left, right), error: "" }
    } catch (e) {
      return { lines: [] as DiffLine[], error: e instanceof Error ? e.message : "Invalid JSON" }
    }
  }, [leftInput, rightInput])

  const filteredLines = showOnlyDiff ? lines.filter((l) => l.type !== "unchanged") : lines

  const stats = useMemo(() => {
    const added = lines.filter((l) => l.type === "added").length
    const removed = lines.filter((l) => l.type === "removed").length
    const changed = lines.filter((l) => l.type === "changed").length
    const unchanged = lines.filter((l) => l.type === "unchanged").length
    return { added, removed, changed, unchanged }
  }, [lines])

  const handleSwap = () => {
    const tmp = leftInput
    setLeftInput(rightInput)
    setRightInput(tmp)
  }

  const handleClear = () => {
    setLeftInput("")
    setRightInput("")
  }

  const typeColor: Record<DiffType, string> = {
    added: "bg-green-500/10 text-green-600 dark:text-green-400 border-l-2 border-green-500",
    removed: "bg-red-500/10 text-red-600 dark:text-red-400 border-l-2 border-red-500",
    changed: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-l-2 border-yellow-500",
    unchanged: "text-foreground",
  }

  const typeLabel: Record<DiffType, string> = {
    added: "+",
    removed: "-",
    changed: "~",
    unchanged: " ",
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Left (Old)</label>
            <Textarea
              value={leftInput}
              onChange={(e) => setLeftInput(e.target.value)}
              placeholder="Paste original JSON here..."
              className="min-h-[200px]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Right (New)</label>
            <Textarea
              value={rightInput}
              onChange={(e) => setRightInput(e.target.value)}
              placeholder="Paste modified JSON here..."
              className="min-h-[200px]"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" onClick={handleSwap}>
            <ArrowDownUp className="h-3.5 w-3.5" />
            Swap
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" onClick={handleClear}>
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer ml-auto">
            <input
              type="checkbox"
              checked={showOnlyDiff}
              onChange={(e) => setShowOnlyDiff(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-muted-foreground">Differences only</span>
          </label>
        </div>

        {error && <div className="mt-3"><ErrorBanner message={error} /></div>}

        {lines.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-4 mb-3">
              {stats.added > 0 && <span className="text-xs text-green-600 dark:text-green-400">{stats.added} added</span>}
              {stats.removed > 0 && <span className="text-xs text-red-600 dark:text-red-400">{stats.removed} removed</span>}
              {stats.changed > 0 && <span className="text-xs text-yellow-600 dark:text-yellow-400">{stats.changed} changed</span>}
              {stats.unchanged > 0 && <span className="text-xs text-muted-foreground">{stats.unchanged} unchanged</span>}
            </div>
            <div className="rounded-md border border-input bg-muted overflow-auto max-h-[400px]">
              <div className="font-mono text-xs">
                {filteredLines.map((line, i) => {
                    const left = line.left as unknown
                    const right = line.right as unknown
                    return (
                  <div
                    key={`${line.path}-${i}`}
                    className={`px-3 py-1 flex items-start gap-2 ${typeColor[line.type]}`}
                  >
                    <span className="w-4 shrink-0 text-center font-bold">{typeLabel[line.type]}</span>
                    <span className="text-primary shrink-0">{line.path}</span>
                    <span className="text-muted-foreground">=</span>
                    {line.type === "added" && (
                      <span className="break-all">{formatValue(right)}</span>
                    )}
                    {line.type === "removed" && (
                      <span className="break-all line-through opacity-60">{formatValue(left)}</span>
                    )}
                    {line.type === "changed" && (
                      <span className="break-all">
                        <span className="line-through opacity-60">{formatValue(left)}</span>
                        <span className="mx-1">→</span>
                        <span>{formatValue(right)}</span>
                      </span>
                    )}
                    {line.type === "unchanged" && (
                      <span className="break-all text-muted-foreground">{formatValue(left)}</span>
                    )}
                  </div>
                    )})}
                {filteredLines.length === 0 && (
                  <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                    No differences found
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2">
              <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(filteredLines.map((l) => `${typeLabel[l.type]} ${l.path} = ${formatValue(l.type === "removed" ? l.left : l.right)}`).join("\n"))}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy Diff"}
              </Button>
            </div>
          </div>
        )}

        {lines.length === 0 && !error && (leftInput.trim() || rightInput.trim()) && (
          <div className="mt-4 text-center text-sm text-muted-foreground py-8">
            Paste JSON on both sides to compare
          </div>
        )}
      </div>
    </div>
  )
}