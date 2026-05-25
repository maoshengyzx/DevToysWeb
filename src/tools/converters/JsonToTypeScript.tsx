import { useState, useMemo } from "react"
import { Textarea, ReadOnlyTextarea } from "@/components/ui/shared"
import { Button } from "@/components/ui/button"
import { Copy, Check, Trash2 } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { ErrorBanner } from "@/components/ui/error-banner"
import { useLocale } from "@/i18n/useLocale"

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function getType(val: unknown, parentName: string, seen: Set<string>): string {
  if (val === null || val === undefined) return "unknown"
  if (typeof val === "string") return "string"
  if (typeof val === "number") return "number"
  if (typeof val === "boolean") return "boolean"
  if (Array.isArray(val)) {
    if (val.length === 0) return "unknown[]"
    const itemType = getType(val[0], parentName, seen)
    return `${itemType}[]`
  }
  if (typeof val === "object") {
    if (seen.has(parentName)) return parentName
    seen.add(parentName)
    return parentName
  }
  return "unknown"
}

function jsonToTs(json: string): string {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : "Invalid JSON", { cause: e })
  }

  const interfaces: string[] = []
  const seen = new Set<string>()

  function process(name: string, obj: unknown): string {
    if (obj === null || obj === undefined) return "unknown"
    if (Array.isArray(obj)) {
      const itemType = obj.length > 0 ? getType(obj[0], name + "Item", seen) : "unknown"
      return `${itemType}[]`
    }
    if (typeof obj !== "object") return getType(obj, name, seen)

    const ifaceName = name
    if (seen.has(ifaceName)) return ifaceName
    seen.add(ifaceName)

    const entries = Object.entries(obj as Record<string, unknown>)
    const lines = entries.map(([key, val]) => {
      const tsType = getType(val, capitalize(key), seen)
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`
      const isOptional = val === null || val === undefined
      return `  ${safeKey}${isOptional ? "?" : ""}: ${tsType};`
    })

    interfaces.push(`export interface ${ifaceName} {\n${lines.join("\n")}\n}`)

    for (const [, val] of entries) {
      if (val && typeof val === "object" && !Array.isArray(val)) {
        process(capitalize(Object.keys(val as Record<string, unknown>)[0] || "Item"), val)
      }
      if (val && typeof val === "object" && !Array.isArray(val)) {
        process(ifaceName + "Item", val)
      }
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object" && val[0] !== null) {
        process(ifaceName + "Item", val[0])
      }
    }

    return ifaceName
  }

  process("Root", parsed)
  return interfaces.join("\n\n")
}

export function JsonToTypeScript() {
  const { t } = useLocale()
  const [input, setInput] = useState("")
  const [copied, handleCopy] = useCopyToClipboard()

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" }
    try {
      return { output: jsonToTs(input), error: "" }
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : "Invalid JSON" }
    }
  }, [input])

  const handleClear = () => {
    setInput("")
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">{t("tool.jsonToTs.jsonInput")}</label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("tool.jsonToTs.jsonPlaceholder")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">{t("tool.jsonToTs.tsOutput")}</label>
            <ReadOnlyTextarea value={output} placeholder={t("tool.jsonToTs.tsPlaceholder")} />
          </div>
        </div>
        {error && <div className="mt-3"><ErrorBanner message={error} /></div>}
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