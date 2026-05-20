import { useState, useMemo } from "react"
import { Textarea } from "@/components/ui/shared"
import { diffLines } from "diff"

export function TextDiff() {
  const [left, setLeft] = useState("")
  const [right, setRight] = useState("")

  const changes = useMemo(() => {
    if (!left && !right) return []
    return diffLines(left, right)
  }, [left, right])

  let lineNum = 0

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
              {changes.map((change, i) => {
                const lines = change.value.split("\n")
                if (change.value.endsWith("\n") && lines.length > 1) {
                  lines.pop()
                }
                return lines.map((line, j) => {
                  if (!change.removed) lineNum++
                  return (
                    <div
                      key={`${i}-${j}`}
                      className={`px-3 py-0.5 ${
                        change.removed
                          ? "bg-red-500/10 text-red-400"
                          : change.added
                          ? "bg-green-500/10 text-green-400"
                          : "text-foreground"
                      }`}
                    >
                      <span className="inline-block w-8 text-right mr-2 text-muted-foreground select-none">
                        {change.removed ? "" : lineNum}
                      </span>
                      <span className="mr-1 select-none">
                        {change.removed ? "-" : change.added ? "+" : " "}
                      </span>
                      {line}
                    </div>
                  )
                })
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}