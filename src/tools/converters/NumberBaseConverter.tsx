import { useState, useMemo } from "react"
import { Textarea, ReadOnlyTextarea, Select } from "@/components/ui/shared"
import { Button } from "@/components/ui/button"
import { Copy, Check, Trash2 } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { ErrorBanner } from "@/components/ui/error-banner"
import { useLocale } from "@/i18n/useLocale"

const bases = [
  { value: 2, label: "Binary (2)" },
  { value: 8, label: "Octal (8)" },
  { value: 10, label: "Decimal (10)" },
  { value: 16, label: "Hexadecimal (16)" },
]

export function NumberBaseConverter() {
  const { t } = useLocale()
  const [input, setInput] = useState("")
  const [fromBase, setFromBase] = useState(10)
  const [toBase, setToBase] = useState(16)
  const [copied, handleCopy] = useCopyToClipboard()

  const { output, error, warning } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "", warning: "" }
    try {
      const num = parseInt(input.trim(), fromBase)
      if (isNaN(num)) throw new Error("Invalid number for the selected base")
      const warn = Math.abs(num) > Number.MAX_SAFE_INTEGER
        ? "Result may be inaccurate — value exceeds MAX_SAFE_INTEGER (2⁵³−1)"
        : ""
      return { output: num.toString(toBase).toUpperCase(), error: "", warning: warn }
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : "Conversion error", warning: "" }
    }
  }, [input, fromBase, toBase])

  const handleClear = () => { setInput(""); }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-6 py-3">
        <span className="text-sm text-muted-foreground">{t("tool.numberBase.from")}</span>
        <Select value={String(fromBase)} onChange={(e) => setFromBase(Number(e.target.value))}>
          {bases.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
        </Select>
        <span className="text-sm text-muted-foreground">{t("tool.numberBase.to")}</span>
        <Select value={String(toBase)} onChange={(e) => setToBase(Number(e.target.value))}>
          {bases.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
        </Select>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">{t("tool.numberBase.input")}</label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("tool.numberBase.placeholder")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">{t("tool.numberBase.output")}</label>
            <ReadOnlyTextarea value={output} placeholder={t("tool.numberBase.resultPlaceholder")} />
          </div>
        </div>
        {error && <div className="mt-3"><ErrorBanner message={error} /></div>}
        {warning && <div className="mt-3"><p className="text-xs text-yellow-500">{warning}</p></div>}
        <div className="mt-4 flex gap-2">
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