import { useState, useMemo } from "react"
import { Textarea } from "@/components/ui/shared"
import { diffLines, type Change } from "diff"
import { useLocale } from "@/i18n/useLocale"

interface DiffLine {
  type: "add" | "remove" | "normal"
  content: string
  lineNum: number | ""
}

function computeDiffLines(changes: Change[]): DiffLine[] {
  const lines: DiffLine[] = []
  let lineNum = 0
  for (const change of changes) {
    const splitLines = change.value.split("\n")
    if (change.value.endsWith("\n") && splitLines.length > 1) {
      splitLines.pop()
    }
    for (const line of splitLines) {
      if (!change.removed) lineNum++
      lines.push({
        type: change.removed ? "remove" : change.added ? "add" : "normal",
        content: line,
        lineNum: change.removed ? "" : lineNum,
      })
    }
  }
  return lines
}

export function TextDiff() {
  const [left, setLeft] = useState("")
  const [right, setRight] = useState("")
  const { t } = useLocale()

  const changes = useMemo(() => {
    if (!left && !right) return []
    return diffLines(left, right)
  }, [left, right])

  const diffLines_result = useMemo(() => computeDiffLines(changes), [changes])

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">{t("tool.textDiff.original")}</label>
            <Textarea
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              placeholder={t("tool.textDiff.originalPlaceholder")}
              className="min-h-[300px]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">{t("tool.textDiff.modified")}</label>
            <Textarea
              value={right}
              onChange={(e) => setRight(e.target.value)}
              placeholder={t("tool.textDiff.modifiedPlaceholder")}
              className="min-h-[300px]"
            />
          </div>
        </div>
        {(left || right) && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-red-500/20 border border-red-500/40" /> {t("tool.textDiff.removed")}</span>
              <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-green-500/20 border border-green-500/40" /> {t("tool.textDiff.added")}</span>
            </div>
            <div className="overflow-auto rounded-md border border-border font-mono text-xs">
              {diffLines_result.map((dl, i) => (
                <div
                  key={i}
                  className={`px-3 py-0.5 ${
                    dl.type === "remove"
                      ? "bg-red-500/10 text-red-400"
                      : dl.type === "add"
                      ? "bg-green-500/10 text-green-400"
                      : "text-foreground"
                  }`}
                >
                  <span className="inline-block w-8 text-right mr-2 text-muted-foreground select-none">
                    {dl.lineNum}
                  </span>
                  <span className="mr-1 select-none">
                    {dl.type === "remove" ? "-" : dl.type === "add" ? "+" : " "}
                  </span>
                  {dl.content}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}