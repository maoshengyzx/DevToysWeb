import { useState, useMemo, useCallback } from "react"
import { Textarea } from "@/components/ui/shared"
import { Button } from "@/components/ui/button"
import { ArrowDownUp, Copy, Check, Trash2 } from "lucide-react"
import { diffLines, diffWords, diffChars } from "diff"
import type { Change } from "diff"
import { useLocale } from "@/i18n/useLocale"

type DiffMode = "lines" | "words" | "chars"

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

function diffStats(diffLines: DiffLine[]): { adds: number; removes: number; unchanged: number } {
  let adds = 0, removes = 0, unchanged = 0
  for (const dl of diffLines) {
    if (dl.type === "add") adds++
    else if (dl.type === "remove") removes++
    else unchanged++
  }
  return { adds, removes, unchanged }
}

export function TextDiff() {
  const [left, setLeft] = useState("")
  const [right, setRight] = useState("")
  const [mode, setMode] = useState<DiffMode>("lines")
  const [copied, setCopied] = useState(false)
  const { t } = useLocale()

  const changes: Change[] = useMemo(() => {
    if (!left && !right) return []
    if (mode === "chars") return diffChars(left, right)
    if (mode === "words") return diffWords(left, right)
    return diffLines(left, right)
  }, [left, right, mode])

  const diffLinesResult = useMemo(() => computeDiffLines(changes), [changes])
  const stats = useMemo(() => diffStats(diffLinesResult), [diffLinesResult])

  const handleSwap = useCallback(() => {
    setLeft(right)
    setRight(left)
  }, [left, right])

  const handleClear = useCallback(() => {
    setLeft("")
    setRight("")
  }, [])

  const handleCopy = useCallback(() => {
    const text = diffLinesResult.map((dl) => {
      const prefix = dl.type === "remove" ? "-" : dl.type === "add" ? "+" : " "
      return `${prefix} ${dl.content}`
    }).join("\n")
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [diffLinesResult])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-6 py-3 flex-wrap">
        <span className="text-sm text-muted-foreground">{t("tool.textDiff.mode")}</span>
        {(["lines", "words", "chars"] as const).map((m) => (
          <Button
            key={m}
            variant={mode === m ? "default" : "outline"}
            size="sm"
            className="cursor-pointer"
            onClick={() => setMode(m)}
          >
            {m === "lines" ? t("tool.textDiff.lines") : m === "words" ? t("tool.textDiff.words") : t("tool.textDiff.chars")}
          </Button>
        ))}
        <div className="flex-1" />
        <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer" onClick={handleSwap}>
          <ArrowDownUp className="h-3.5 w-3.5" />
          {t("shared.swap")}
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer" onClick={handleClear}>
          <Trash2 className="h-3.5 w-3.5" />
          {t("shared.clear")}
        </Button>
      </div>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-red-500/20 border border-red-500/40" /> {t("tool.textDiff.removed")}</span>
                <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-green-500/20 border border-green-500/40" /> {t("tool.textDiff.added")}</span>
              </div>
              {diffLinesResult.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <span className="text-green-500">+{stats.adds}</span>
                  {" "}
                  <span className="text-red-500">-{stats.removes}</span>
                  {" "}
                  <span className="text-muted-foreground">={stats.unchanged}</span>
                </div>
              )}
            </div>
            <div className="overflow-auto rounded-md border border-border font-mono text-xs max-h-[500px]">
              {diffLinesResult.map((dl, i) => (
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
        {diffLinesResult.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? t("shared.copied") : t("tool.textDiff.copyDiff")}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}