import { useState, useMemo } from "react"
import { Textarea, Select } from "@/components/ui/shared"
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

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" }
    try {
      const num = parseInt(input.trim(), fromBase)
      if (isNaN(num)) throw new Error("Invalid number for the selected base")
      return { output: num.toString(toBase).toUpperCase(), error: "" }
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : "Conversion error" }
    }
  }, [input, fromBase, toBase])

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
      {error && <ErrorBanner message={error} />}
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
            <Textarea
              value={output}
              readOnly
              className="bg-muted"
              placeholder={t("tool.numberBase.resultPlaceholder")}
            />
          </div>
        </div>
      </div>
    </div>
  )
}