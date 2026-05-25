import { useState, useEffect, useCallback } from "react"
import { useLocale } from "@/i18n/useLocale"
import { Textarea, ReadOnlyTextarea } from "@/components/ui/shared"
import { Button } from "@/components/ui/button"
import { Copy, Check, Trash2, LoaderCircle } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { ErrorBanner } from "@/components/ui/error-banner"
import { html as htmlBeautify, css as cssBeautify, js as jsBeautify } from "js-beautify"
import { minify as terserMinify } from "terser"
import { minify as cssoMinify } from "csso"

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

function minifyHtml(input: string): string {
  return input
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim()
}

async function minifyCode(input: string, lang: Language): Promise<string> {
  switch (lang) {
    case "html": return minifyHtml(input)
    case "css": return cssoMinify(input, { compress: true }).css
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
  const { t } = useLocale()
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [lang, setLang] = useState<Language>("html")
  const [mode, setMode] = useState<"format" | "minify" | "escape" | "unescape">("format")
  const [indent, setIndent] = useState(2)
  const [copied, handleCopy] = useCopyToClipboard()
  const [processing, setProcessing] = useState(false)

  const isSync = mode !== "minify"

  const handleProcess = useCallback(async () => {
    if (!input.trim()) { setOutput(""); setError(""); return }
    if (!isSync) setProcessing(true)
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
    } finally {
      setProcessing(false)
    }
  }, [input, lang, mode, indent, isSync])

  useEffect(() => {
    if (isSync && input.trim()) {
      handleProcess()
    }
  }, [handleProcess, isSync])

  const handleClear = () => {
    setInput("")
    setOutput("")
    setError("")
  }

  const inputBytes = new Blob([input]).size
  const outputBytes = new Blob([output]).size
  const savedPercent = inputBytes > 0 ? Math.round((1 - outputBytes / inputBytes) * 100) : 0

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-6 py-3 flex-wrap">
        <span className="text-sm text-muted-foreground">{t("tool.htmlCssJsFormatter.language")}</span>
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
        <span className="text-sm text-muted-foreground">{t("tool.htmlCssJsFormatter.action")}</span>
        {(["format", "minify", "escape", "unescape"] as const).map((m) => (
          <Button
            key={m}
            variant={mode === m ? "default" : "outline"}
            size="sm"
            className="cursor-pointer capitalize"
            onClick={() => { setMode(m); setOutput(""); setError("") }}
          >
            {m}
          </Button>
        ))}
        {mode === "format" && (
          <>
            <div className="w-px h-4 bg-border mx-1" />
            <span className="text-sm text-muted-foreground">{t("tool.htmlCssJsFormatter.indent")}</span>
            <Button variant={indent === 2 ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => { setIndent(2); setOutput(""); setError("") }}>2</Button>
            <Button variant={indent === 4 ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => { setIndent(4); setOutput(""); setError("") }}>4</Button>
          </>
        )}
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between min-h-[36px]">
              <label className="text-sm font-medium text-foreground">{t("tool.htmlCssJsFormatter.input")}</label>
              <div />
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("tool.htmlCssJsFormatter.codePlaceholder").replace("{lang}", lang.toUpperCase())}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between min-h-[36px]">
              <label className="text-sm font-medium text-foreground">{t("tool.htmlCssJsFormatter.output")}</label>
              {mode === "minify" && output && input.trim() && (
                <span className="text-xs text-muted-foreground">
                  {outputBytes.toLocaleString()} B
                  {savedPercent > 0 && <span className="text-green-500 ml-1">(-{savedPercent}%)</span>}
                </span>
              )}
            </div>
            {processing ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <ReadOnlyTextarea value={output} placeholder="Result will appear here..." />
            )}
          </div>
        </div>
        {error && <div className="mt-3"><ErrorBanner message={error} /></div>}
        <div className="mt-4 flex gap-2">
          {!isSync && (
            <Button className="cursor-pointer" disabled={processing} onClick={handleProcess}>
              {processing ? <LoaderCircle className="h-4 w-4 animate-spin mr-1" /> : null}
              {t("tool.htmlCssJsFormatter.process")}
            </Button>
          )}
          <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(output)} disabled={!output}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? t("shared.copied") : t("shared.copyOutput")}
          </Button>
          <Button variant="ghost" className="gap-1.5 cursor-pointer" onClick={handleClear}>
            <Trash2 className="h-3.5 w-3.5" />
            {t("shared.clear")}
          </Button>
        </div>
      </div>
    </div>
  )
}