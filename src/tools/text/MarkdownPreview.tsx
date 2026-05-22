import { useState, useMemo } from "react"
import { Textarea } from "@/components/ui/shared"
import { useLocale } from "@/i18n/useLocale"
import { Button } from "@/components/ui/button"
import { marked } from "marked"
import DOMPurify from "dompurify"
import { Copy, Check, Download } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

export function MarkdownPreview() {
  const { t } = useLocale()
  const [input, setInput] = useState("# Hello World\n\nThis is **markdown** preview.\n\n- Item 1\n- Item 2\n- Item 3\n\n```\nconst greeting = 'Hello';\n```")
  const [copied, handleCopy] = useCopyToClipboard()

  const html = useMemo(() => {
    try {
      const raw = marked.parse(input) as string
      return DOMPurify.sanitize(raw)
    } catch {
      return "<p>Invalid markdown</p>"
    }
  }, [input])

  const handleExportHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Markdown Export</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; color: #333; }
pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; }
code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 3px; }
blockquote { border-left: 4px solid #ddd; padding-left: 1rem; color: #666; margin-left: 0; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
img { max-width: 100%; }
</style>
</head>
<body>
${html}
</body>
</html>`
    const blob = new Blob([fullHtml], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "markdown-export.html"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-6 py-3">
        <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" onClick={handleExportHtml}>
          <Download className="h-3.5 w-3.5" />
          {t("tool.markdown.exportHtml")}
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(html)}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? t("shared.copied") : t("tool.markdown.copyHtml")}
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 min-h-[500px]">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">{t("tool.markdown.markdown")}</label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("tool.markdown.placeholder")}
              className="flex-1 min-h-[500px]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">{t("tool.markdown.preview")}</label>
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