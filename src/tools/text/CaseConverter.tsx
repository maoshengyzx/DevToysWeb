import { useState } from "react"
import { Textarea } from "@/components/ui/shared"

const cases = [
  { label: "camelCase", fn: (s: string) => s.replace(/(?:^\w|[A-Z]|\b\w)/g, (c, i) => i === 0 ? c.toLowerCase() : c.toUpperCase()).replace(/[-_\s]+/g, "") },
  { label: "PascalCase", fn: (s: string) => s.replace(/(?:^|[-_\s])(\w)/g, (_, c) => c.toUpperCase()) },
  { label: "snake_case", fn: (s: string) => s.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[-\s]+/g, "_").toLowerCase() },
  { label: "kebab-case", fn: (s: string) => s.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[_\s]+/g, "-").toLowerCase() },
  { label: "CONSTANT_CASE", fn: (s: string) => s.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[-\s]+/g, "_").toUpperCase() },
  { label: "Sentence case", fn: (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() },
  { label: "Title Case", fn: (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase()) },
  { label: "Lower case", fn: (s: string) => s.toLowerCase() },
  { label: "Upper case", fn: (s: string) => s.toUpperCase() },
]

export function CaseConverter() {
  const [input, setInput] = useState("")

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Input</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type or paste text to convert..."
              />
            </div>
            <div className="flex flex-col gap-3">
              {input ? (
                cases.map((c) => (
                  <div key={c.label} className="flex items-start gap-3">
                    <span className="w-32 shrink-0 text-sm font-medium text-muted-foreground pt-2">{c.label}</span>
                    <code className="flex-1 rounded-md border border-border bg-muted px-3 py-2 text-sm font-mono text-foreground break-all select-all">
                      {c.fn(input)}
                    </code>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center min-h-[200px] rounded-md border border-dashed border-border text-sm text-muted-foreground">
                  Type text on the left to see conversions
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}