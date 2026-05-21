import { useState } from "react"
import { Textarea, ReadOnlyTextarea } from "@/components/ui/shared"
import { Button } from "@/components/ui/button"
import { Copy, Check, Trash2 } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { ErrorBanner } from "@/components/ui/error-banner"
import { html as htmlBeautify, css as cssBeautify, js as jsBeautify } from "js-beautify"
import { minify as terserMinify } from "terser"
import CleanCSS from "clean-css"
import { minify as htmlMinify } from "html-minifier-terser"

type Language = "html" | "css" | "js"

const languageOptions: { label: string; value: Language }[] = [
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "JavaScript", value: "js" },
]

function formatCode(input: string, lang: Language, indent: number): string {
  const opts = { indent_size: indent }
  switch (lang) {
    case "html": return htmlBeautify(input, opts)
    case "css": return cssBeautify(input, opts)
    case "js": return jsBeautify(input, opts)
  }
}

async function minifyCode(input: string, lang: Language): Promise<string> {
  switch (lang) {
    case "html": return htmlMinify(input, { collapseWhitespace: true, removeComments: true, minifyCSS: true, minifyJS: true })
    case "css": return new CleanCSS({ level: 2 }).minify(input).styles
    case "js": {
      const result = await terserMinify(input, { compress: true, mangle: false })
      return result.code ?? input
    }
  }
}

function escapeCode(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
}

function unescapeCode(input: string): string {
  return input.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
}

export function HtmlCssJsFormatter() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [lang, setLang] = useState<Language>("html")
  const [mode, setMode] = useState<"format" | "minify" | "escape" | "unescape">("format")
  const [indent, setIndent] = useState(2)
  const [copied, handleCopy] = useCopyToClipboard()

  const handleProcess = async () => {
    if (!input.trim()) return
    try {
      let result = ""
      switch (mode) {
        case "format": result = formatCode(input, lang, indent); break
        case "minify": result = await minifyCode(input, lang); break
        case "escape": result = escapeCode(input); break
        case "unescape": result = unescapeCode(input); break
      }
      setOutput(result)
      setError("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Processing failed")
      setOutput("")
    }
  }

  const handleClear = () => {
    setInput("")
    setOutput("")
    setError("")
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-6 py-3 flex-wrap">
        <span className="text-sm text-muted-foreground">Language:</span>
        {languageOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={lang === opt.value ? "default" : "outline"}
            size="sm"
            className="cursor-pointer"
            onClick={() => { setLang(opt.value); setOutput(""); setError("") }}
          >
            {opt.label}
          </Button>
        ))}
        <div className="w-px h-4 bg-border mx-1" />
        <span className="text-sm text-muted-foreground">Action:</span>
        {(["format", "minify", "escape", "unescape"] as const).map((m) => (
          <Button
            key={m}
            variant={mode === m ? "default" : "outline"}
            size="sm"
            className="cursor-pointer capitalize"
            onClick={() => setMode(m)}
          >
            {m}
          </Button>
        ))}
        {mode === "format" && (
          <>
            <div className="w-px h-4 bg-border mx-1" />
            <span className="text-sm text-muted-foreground">Indent:</span>
            <Button variant={indent === 2 ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => setIndent(2)}>2</Button>
            <Button variant={indent === 4 ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => setIndent(4)}>4</Button>
          </>
        )}
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Input</label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Paste your ${lang.toUpperCase()} code here...`}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Output</label>
            <ReadOnlyTextarea value={output} placeholder="Result will appear here..." />
          </div>
        </div>
        {error && <div className="mt-3"><ErrorBanner message={error} /></div>}
        <div className="mt-4 flex gap-2">
          <Button className="cursor-pointer" onClick={handleProcess}>Process</Button>
          <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(output)}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy Output"}
          </Button>
          <Button variant="ghost" className="gap-1.5 cursor-pointer" onClick={handleClear}>
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  )
}