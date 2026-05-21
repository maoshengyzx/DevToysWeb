import { useState, useMemo } from "react"
import { Textarea } from "@/components/ui/shared"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

export function WordCount() {
  const [input, setInput] = useState("")
  const [copied, handleCopy] = useCopyToClipboard()

  const stats = useMemo(() => {
    const text = input
    if (!text) return { chars: 0, charsNoSpaces: 0, words: 0, lines: 0, chineseChars: 0, englishWords: 0, paragraphs: 0 }

    const chars = text.length
    const charsNoSpaces = text.replace(/\s/g, "").length
    const lines = text.split("\n").length
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length || (text.trim() ? 1 : 0)

    const chineseChars = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length
    const englishWords = (text.match(/[a-zA-Z]+(?:['-][a-zA-Z]+)*/g) || []).length
    const words = chineseChars + englishWords

    return { chars, charsNoSpaces, words, lines, chineseChars, englishWords, paragraphs }
  }, [input])

  const statItems = [
    { label: "Characters", value: stats.chars },
    { label: "Characters (no spaces)", value: stats.charsNoSpaces },
    { label: "Words", value: stats.words },
    { label: "Lines", value: stats.lines },
    { label: "Chinese Characters", value: stats.chineseChars },
    { label: "English Words", value: stats.englishWords },
    { label: "Paragraphs", value: stats.paragraphs },
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Text Input</label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste your text here to count characters, words, and more..."
            className="min-h-[300px]"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {statItems.map((item) => (
            <div key={item.label} className="rounded-md border border-border bg-muted px-4 py-3 text-center">
              <div className="text-2xl font-bold text-foreground">{item.value.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
            </div>
          ))}
        </div>
        {input && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Typography Preview</label>
            <div className="rounded-md border border-border bg-muted p-4 text-sm text-foreground whitespace-pre-wrap break-words">
              {input}
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(input)}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy Text"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}