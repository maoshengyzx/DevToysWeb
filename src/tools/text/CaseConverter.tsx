import { useState } from "react"
import { Textarea } from "@/components/ui/shared"
import { camelCase, pascalCase, snakeCase, kebabCase, constantCase, sentenceCase, capitalCase } from "change-case"

const cases = [
  { label: "camelCase", fn: camelCase },
  { label: "PascalCase", fn: pascalCase },
  { label: "snake_case", fn: snakeCase },
  { label: "kebab-case", fn: kebabCase },
  { label: "CONSTANT_CASE", fn: constantCase },
  { label: "Sentence case", fn: sentenceCase },
  { label: "Title Case", fn: (s: string) => capitalCase(s) },
  { label: "Lower case", fn: (s: string) => s.toLowerCase() },
  { label: "Upper case", fn: (s: string) => s.toUpperCase() },
]

export function CaseConverter() {
  const [input, setInput] = useState("")

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 items-start">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Input</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type or paste text to convert..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Conversions</label>
              {input ? (
                <div className="flex flex-col gap-1.5">
                  {cases.map((c) => (
                    <div key={c.label} className="flex items-start gap-3">
                      <span className="w-32 shrink-0 text-xs font-medium text-muted-foreground pt-1.5">{c.label}</span>
                      <code className="flex-1 rounded-md border border-border bg-muted px-3 py-1.5 text-sm font-mono text-foreground break-all select-all">
                        {c.fn(input)}
                      </code>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center min-h-[200px] rounded-md border border-dashed border-border text-sm text-muted-foreground">
                  Type text on the left to see conversions
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  )
}