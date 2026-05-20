import { useState, useMemo } from "react"
import { Textarea } from "@/components/ui/shared"
import { Button } from "@/components/ui/button"

const flags = [
  { label: "Global (g)", value: "g" },
  { label: "Case insensitive (i)", value: "i" },
  { label: "Multiline (m)", value: "m" },
  { label: "Dot all (s)", value: "s" },
]

export function RegexTester() {
  const [regex, setRegex] = useState("")
  const [testString, setTestString] = useState("")
  const [selectedFlags, setSelectedFlags] = useState(new Set(["g"]))

  const { matches, error } = useMemo(() => {
    if (!regex) return { matches: [], error: "" }
    try {
      const flagStr = Array.from(selectedFlags).join("")
      const re = new RegExp(regex, flagStr)
      const results: { text: string; index: number; groups: string[] }[] = []
      let match: RegExpExecArray | null
      const seen = new Set<number>()
      while ((match = re.exec(testString)) !== null) {
        if (match.index === re.lastIndex) re.lastIndex++
        if (seen.has(match.index)) break
        seen.add(match.index)
        results.push({ text: match[0], index: match.index, groups: match.slice(1) })
        if (!flagStr.includes("g")) break
      }
      return { matches: results, error: "" }
    } catch (e) {
      return { matches: [], error: e instanceof Error ? e.message : "Invalid regex" }
    }
  }, [regex, testString, selectedFlags])

  const toggleFlag = (flag: string) => {
    setSelectedFlags((prev) => {
      const next = new Set(prev)
      if (next.has(flag)) next.delete(flag)
      else next.add(flag)
      return next
    })
  }

  const highlightMatch = (text: string) => {
    if (!regex || error || matches.length === 0) return text
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    for (const m of matches) {
      if (m.index > lastIndex) {
        parts.push(text.slice(lastIndex, m.index))
      }
      parts.push(
        <mark key={m.index} className="bg-primary/30 text-foreground rounded px-0.5">{text.slice(m.index, m.index + m.text.length)}</mark>
      )
      lastIndex = m.index + m.text.length
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex))
    return parts
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-6 py-3">
        <span className="text-sm text-muted-foreground">Flags:</span>
        <div className="flex gap-1">
          {flags.map((f) => (
            <Button
              key={f.value}
              variant={selectedFlags.has(f.value) ? "default" : "outline"}
              size="sm"
              className="cursor-pointer text-xs"
              onClick={() => toggleFlag(f.value)}
            >
              {f.value}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Regular Expression</label>
          <input
            type="text"
            value={regex}
            onChange={(e) => setRegex(e.target.value)}
            placeholder="Enter regex pattern..."
            className="h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Test String</label>
          <Textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter text to test against..."
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Highlighted Matches ({matches.length})</label>
          <div className="min-h-[100px] rounded-md border border-border bg-muted px-3 py-2 text-sm font-mono text-foreground whitespace-pre-wrap break-all">
            {testString ? highlightMatch(testString) : "Matches will be highlighted here..."}
          </div>
        </div>
        {matches.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Match Details</label>
            <div className="space-y-1">
              {matches.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-muted-foreground">#{i + 1}</span>
                  <code className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">{m.text}</code>
                  <span className="text-muted-foreground">at {m.index}</span>
                  {m.groups.length > 0 && (
                    <span className="text-muted-foreground">groups: [{m.groups.join(", ")}]</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}