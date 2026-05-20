import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/shared"
import { Select } from "@/components/ui/shared"
import { Copy, Check, RefreshCw } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

export function LoremIpsumGenerator() {
  const [output, setOutput] = useState(LOREM)
  const [count, setCount] = useState(1)
  const [type, setType] = useState<"paragraphs" | "sentences" | "words">("paragraphs")
  const [copied, handleCopy] = useCopyToClipboard()

  const sentences = LOREM.split(". ").filter(Boolean)
  const words = LOREM.split(" ")

  const generate = () => {
    let result = ""
    switch (type) {
      case "paragraphs":
        result = Array.from({ length: count }, () => LOREM).join("\n\n")
        break
      case "sentences":
        result = Array.from({ length: count }, (_, i) => sentences[i % sentences.length]).join(". ") + "."
        break
      case "words":
        result = Array.from({ length: count }, (_, i) => words[i % words.length]).join(" ")
        break
    }
    setOutput(result)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-6 py-3">
        <span className="text-sm text-muted-foreground">Type:</span>
        <Select value={type} onChange={(e) => setType(e.target.value as typeof type)}>
          <option value="paragraphs">Paragraphs</option>
          <option value="sentences">Sentences</option>
          <option value="words">Words</option>
        </Select>
        <span className="text-sm text-muted-foreground">Count:</span>
        <input
          type="number"
          min={1}
          max={100}
          value={count}
          onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
          className="h-9 w-20 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div className="flex-1 overflow-auto p-6">
        <Textarea
          value={output}
          readOnly
          className="bg-muted"
          placeholder="Generated text will appear here..."
        />
        <div className="mt-4 flex gap-2">
          <Button className="gap-1.5 cursor-pointer" onClick={generate}>
            <RefreshCw className="h-3.5 w-3.5" />
            Generate
          </Button>
          <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(output)}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>
    </div>
  )
}