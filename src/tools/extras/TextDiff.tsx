import { useState, useMemo } from "react"
import { Textarea } from "@/components/ui/shared"

export function TextDiff() {
  const [left, setLeft] = useState("")
  const [right, setRight] = useState("")

  const diff = useMemo(() => {
    const leftLines = left.split("\n")
    const rightLines = right.split("\n")
    const result: { type: "same" | "added" | "removed"; left?: string; right?: string; line: number }[] = []

    let li = 0
    let ri = 0
    while (li < leftLines.length || ri < rightLines.length) {
      if (li < leftLines.length && ri < rightLines.length) {
        if (leftLines[li] === rightLines[ri]) {
          result.push({ type: "same", left: leftLines[li], right: rightLines[ri], line: li + 1 })
          li++; ri++
        } else {
          result.push({ type: "removed", left: leftLines[li], line: li + 1 })
          result.push({ type: "added", right: rightLines[ri], line: ri + 1 })
          li++; ri++
        }
      } else if (li < leftLines.length) {
        result.push({ type: "removed", left: leftLines[li], line: li + 1 })
        li++
      } else {
        result.push({ type: "added", right: rightLines[ri], line: ri + 1 })
        ri++
      }
    }
    return result
  }, [left, right])

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Original</label>
            <Textarea
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              placeholder="Paste original text..."
              className="min-h-[300px]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Modified</label>
            <Textarea
              value={right}
              onChange={(e) => setRight(e.target.value)}
              placeholder="Paste modified text..."
              className="min-h-[300px]"
            />
          </div>
        </div>
        {(left || right) && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-red-500/20 border border-red-500/40" /> Removed</span>
              <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-green-500/20 border border-green-500/40" /> Added</span>
            </div>
            <div className="overflow-auto rounded-md border border-border font-mono text-xs">
              {diff.map((d, i) => (
                <div
                  key={i}
                  className={`px-3 py-0.5 ${
                    d.type === "removed"
                      ? "bg-red-500/10 text-red-400"
                      : d.type === "added"
                      ? "bg-green-500/10 text-green-400"
                      : "text-foreground"
                  }`}
                >
                  <span className="inline-block w-8 text-right mr-2 text-muted-foreground select-none">{d.line}</span>
                  <span className="mr-1 select-none">{d.type === "removed" ? "-" : d.type === "added" ? "+" : " "}</span>
                  {d.left ?? d.right ?? ""}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}