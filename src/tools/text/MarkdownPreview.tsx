import { useState, useMemo } from "react"
import { Textarea } from "@/components/ui/shared"
import { marked } from "marked"

export function MarkdownPreview() {
  const [input, setInput] = useState("# Hello World\n\nThis is **markdown** preview.\n\n- Item 1\n- Item 2\n- Item 3\n\n```\nconst greeting = 'Hello';\n```")

  const html = useMemo(() => {
    try {
      return marked.parse(input) as string
    } catch {
      return "<p>Invalid markdown</p>"
    }
  }, [input])

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 min-h-[500px]">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Markdown</label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type markdown here..."
              className="flex-1 min-h-[500px]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Preview</label>
            <div
              className="flex-1 min-h-[500px] overflow-auto rounded-md border border-border bg-background px-4 py-3 prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}