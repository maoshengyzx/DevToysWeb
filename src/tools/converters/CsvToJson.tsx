import { useState, useMemo } from "react"
import { Textarea, ReadOnlyTextarea } from "@/components/ui/shared"
import { Button } from "@/components/ui/button"
import { Copy, Check, ArrowDownUp, Trash2, Upload } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { ErrorBanner } from "@/components/ui/error-banner"
import { useLocale } from "@/i18n/useLocale"

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim())
  if (lines.length === 0) return []

  const rows: string[][] = []
  let current: string[] = []
  let cell = ""
  let inQuotes = false

  for (const line of lines) {
    let i = 0
    while (i < line.length) {
      const ch = line[i]
      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            cell += '"'
            i += 2
          } else {
            inQuotes = false
            i++
          }
        } else {
          cell += ch
          i++
        }
      } else {
        if (ch === '"') {
          inQuotes = true
          i++
        } else if (ch === ",") {
          current.push(cell)
          cell = ""
          i++
        } else {
          cell += ch
          i++
        }
      }
    }

    if (inQuotes) {
      cell += "\n"
    } else {
      current.push(cell)
      cell = ""
      rows.push(current)
      current = []
    }
  }

  if (current.length > 0) {
    current.push(cell)
    rows.push(current)
  }

  if (rows.length === 0) return []

  const headers = rows[0].map((h) => h.trim())
  const result: Record<string, string>[] = []

  for (let r = 1; r < rows.length; r++) {
    const obj: Record<string, string> = {}
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = rows[r][c] !== undefined ? rows[r][c].trim() : ""
    }
    result.push(obj)
  }

  return result
}

function inferType(value: string): unknown {
  if (value === "") return null
  if (value === "true") return true
  if (value === "false") return false
  if (/^-?\d+$/.test(value)) return parseInt(value, 10)
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value)
  return value
}

function jsonToCsv(obj: unknown[]): string {
  if (obj.length === 0) return ""
  const first = obj[0]
  if (typeof first !== "object" || first === null) return ""

  const headers = Object.keys(first as Record<string, unknown>)
  const escapeCell = (v: string): string => {
    if (v.includes(",") || v.includes('"') || v.includes("\n")) {
      return `"${v.replace(/"/g, '""')}"`
    }
    return v
  }

  const rows = [headers.map(escapeCell).join(",")]
  for (const item of obj) {
    const row = headers.map((h) => {
      const val = (item as Record<string, unknown>)[h]
      const str = val === null || val === undefined ? "" : String(val)
      return escapeCell(str)
    })
    rows.push(row.join(","))
  }

  return rows.join("\n")
}

type Mode = "csvToJson" | "jsonToCsv"

function convert(input: string, mode: Mode, typedInference: boolean): { output: string; error: string } {
  if (!input.trim()) return { output: "", error: "" }
  try {
    if (mode === "csvToJson") {
      let records = parseCsv(input)
      if (typedInference) {
        records = records.map((row) => {
          const inferred: Record<string, unknown> = {}
          for (const [key, val] of Object.entries(row)) {
            inferred[key] = inferType(val)
          }
          return inferred as Record<string, string>
        }) as Record<string, string>[]
      }
      return { output: JSON.stringify(records, null, 2), error: "" }
    } else {
      const parsed = JSON.parse(input)
      if (!Array.isArray(parsed)) {
        return { output: "", error: "JSON must be an array of objects" }
      }
      return { output: jsonToCsv(parsed), error: "" }
    }
  } catch (e) {
    return { output: "", error: e instanceof Error ? e.message : "Conversion failed" }
  }
}

export function CsvToJson() {
  const { t } = useLocale()
  const [mode, setMode] = useState<Mode>("csvToJson")
  const [input, setInput] = useState("")
  const [copied, handleCopy] = useCopyToClipboard()
  const [typedInference, setTypedInference] = useState(false)
  const [dropError, setDropError] = useState("")

  const { output, error } = useMemo(() => convert(input, mode, typedInference), [input, mode, typedInference])
  const displayError = dropError || error

  const handleSwap = () => {
    const newMode = mode === "csvToJson" ? "jsonToCsv" : "csvToJson"
    const result = convert(input, mode, typedInference)
    setMode(newMode)
    setInput(result.output)
    setDropError("")
  }

  const handleClear = () => {
    setInput("")
    setDropError("")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith(".csv") || file.type === "text/csv" || file.type === "application/json" || file.name.endsWith(".json"))) {
      setDropError("")
      const reader = new FileReader()
      reader.onload = () => {
        const text = reader.result as string
        setInput(text)
        if (file.name.endsWith(".json")) setMode("jsonToCsv")
        else setMode("csvToJson")
      }
      reader.readAsText(file)
    } else {
      setDropError("Please drop a .csv or .json file")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setDropError("")
    const reader = new FileReader()
    reader.onload = () => {
      setInput(reader.result as string)
      if (file.name.endsWith(".json")) setMode("jsonToCsv")
      else setMode("csvToJson")
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant={mode === "csvToJson" ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => { setMode("csvToJson"); setDropError(""); }}>{t("tool.csvToJson.csvToJson")}</Button>
          <Button variant={mode === "jsonToCsv" ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => { setMode("jsonToCsv"); setDropError(""); }}>{t("tool.csvToJson.jsonToCsv")}</Button>
        </div>
        <div className="flex items-center gap-2">
          {mode === "csvToJson" && (
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={typedInference}
                onChange={(e) => setTypedInference(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-muted-foreground">{t("tool.csvToJson.inferTypes")}</span>
            </label>
          )}
          <div className="h-4 w-px bg-border" />
          <input type="file" accept=".csv,.json,text/csv,application/json" className="hidden" onChange={handleFileUpload} id="csv-json-file-input" />
          <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer" onClick={() => document.getElementById("csv-json-file-input")?.click()}>
            <Upload className="h-3.5 w-3.5" />
            {t("shared.upload")}
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer" onClick={handleSwap}>
            <ArrowDownUp className="h-3.5 w-3.5" />
            {t("shared.swap")}
          </Button>
        </div>
      </div>
      <div
        className="flex items-center gap-3 border-b border-dashed border-border px-6 py-2.5 cursor-pointer hover:bg-accent/30 transition-colors"
        onClick={() => document.getElementById("csv-json-file-input")?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground">Drop a .csv or .json file here, or <span className="text-primary underline underline-offset-2 cursor-pointer">browse</span> to upload</span>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                {mode === "csvToJson" ? t("tool.csvToJson.csvInput") : t("tool.csvToJson.jsonInput")}
              </label>
              <div />
            </div>
            <Textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setDropError(""); }}
              placeholder={mode === "csvToJson" ? t("tool.csvToJson.csvPlaceholder") : t("tool.csvToJson.jsonPlaceholder")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                {mode === "csvToJson" ? t("tool.csvToJson.jsonOutput") : t("tool.csvToJson.csvOutput")}
              </label>
              <div />
            </div>
            <ReadOnlyTextarea value={output} placeholder={t("shared.resultPlaceholder")} />
          </div>
        </div>
        {displayError && <div className="mt-3"><ErrorBanner message={displayError} /></div>}
        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(output)}>
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