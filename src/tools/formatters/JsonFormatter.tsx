import { useState, useRef, useCallback, useMemo, useEffect } from "react"
import { useLocale } from "@/i18n/useLocale"
import { Textarea, ReadOnlyTextarea } from "@/components/ui/shared"
import { Button } from "@/components/ui/button"
import { Copy, Check, Trash2, Braces, FileCode, Link, ArrowDownUp, Layers, LoaderCircle } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { ErrorBanner } from "@/components/ui/error-banner"
import { flatten as flatFlatten, unflatten as flatUnflatten } from "flat"

const MAX_AUTO_SIZE = 200 * 1024
const TREE_MAX_DEPTH = 6
const TREE_MAX_ENTRIES = 50
const DEBOUNCE_MS = 400

function smartRepair(input: string): { json: unknown; fixes: string[] } | null {
  let fixed = input
  const fixes: string[] = []

  const singleQuoteCount = (fixed.match(/'/g) || []).length
  const doubleQuoteCount = (fixed.match(/"/g) || []).length
  if (singleQuoteCount > 0 && doubleQuoteCount === 0) {
    fixed = fixed.replace(/'/g, '"')
    fixes.push("single quotes → double quotes")
  }

  const trailingCommaPattern = /,\s*([}\]])/g
  if (trailingCommaPattern.test(fixed)) {
    fixed = fixed.replace(trailingCommaPattern, "$1")
    fixes.push("trailing commas removed")
  }

  let unquotedCount = 0
  const tempFixed = fixed
  const tempPattern = /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g
  let unquotedMatch: RegExpExecArray | null
  while ((unquotedMatch = tempPattern.exec(tempFixed)) !== null) {
    if (!tempFixed.substring(0, unquotedMatch.index).endsWith('"')) {
      unquotedCount++
    }
  }
  if (unquotedCount > 0) {
    fixed = fixed.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, (_match, prefix, key) => {
      return `${prefix}"${key}":`
    })
    fixes.push(`quoted ${unquotedCount} unquoted key(s)`)
  }

  try {
    const json = JSON.parse(fixed)
    return { json, fixes }
  } catch {
    return null
  }
}

function formatJson(input: string, indent: number): string {
  const obj = JSON.parse(input)
  return JSON.stringify(obj, Object.keys(obj).sort(), indent)
}

function sortKeysDeep(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortKeysDeep)
  if (obj !== null && typeof obj === "object") {
    const sorted: Record<string, unknown> = {}
    for (const key of Object.keys(obj as Record<string, unknown>).sort()) {
      sorted[key] = sortKeysDeep((obj as Record<string, unknown>)[key])
    }
    return sorted
  }
  return obj
}

function extractStructure(input: string, indent: number): string {
  const obj = JSON.parse(input)
  const getTypename = (v: unknown): string => {
    if (v === null) return "null"
    if (Array.isArray(v)) return `Array<${v.length > 0 ? getTypename(v[0]) : "any"}>`
    if (typeof v === "object") return "Object"
    return typeof v === "number" ? "Number" : typeof v === "string" ? "String" : typeof v === "boolean" ? "Boolean" : "any"
  }
  const replace = (v: unknown): unknown => {
    if (v === null) return "null"
    if (Array.isArray(v)) return v.length > 0 ? [replace(v[0])] : []
    if (typeof v === "object") {
      const result: Record<string, unknown> = {}
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        result[k] = replace(val)
      }
      return result
    }
    return getTypename(v)
  }
  return JSON.stringify(replace(obj), null, indent)
}

function toJsonMarkdownTable(input: string): string {
  const arr = JSON.parse(input)
  if (!Array.isArray(arr) || arr.length === 0) throw new Error("Input must be a non-empty JSON array")
  if (typeof arr[0] !== "object" || arr[0] === null) throw new Error("Array items must be objects")

  const keys = [...new Set(arr.flatMap((item: Record<string, unknown>) => Object.keys(item)))]
  const escapeCell = (v: unknown): string => {
    if (v === null || v === undefined) return ""
    const s = String(v)
    if (s.includes("|") || s.includes("\n") || s.includes('"')) return `"${s.replace(/"/g, '""')}"`
    return s
  }

  const header = `| ${keys.join(" | ")} |`
  const separator = `| ${keys.map(() => "---").join(" | ")} |`
  const rows = arr.map((item: Record<string, unknown>) => `| ${keys.map((k) => escapeCell(item[k])).join(" | ")} |`)
  return [header, separator, ...rows].join("\n")
}

function markdownTableToJson(input: string): string {
  const lines = input.trim().split("\n").filter((l) => l.trim() && !l.trim().startsWith("| ---") && !l.match(/^\|[\s-:|]+$/))
  if (lines.length < 2) throw new Error("Invalid Markdown table (need header + separator + data)")

  const parseRow = (line: string): string[] =>
    line.split("|").map((c) => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1)

  const headers = parseRow(lines[0])
  const result = lines.slice(1).map((line) => {
    const values = parseRow(line)
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => {
      let v = values[i] ?? ""
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1).replace(/""/g, '"')
      const num = Number(v)
      obj[h] = v !== "" && !isNaN(num) ? v : v
    })
    return obj
  })
  return JSON.stringify(result, null, 2)
}

function toJsonVariable(input: string, indent: number = 2): string {
  const obj = JSON.parse(input)
  const formatted = JSON.stringify(obj, null, indent)
  return `const data = ${formatted}`
}

function toUrlParams(input: string): string {
  const obj = JSON.parse(input)
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    throw new Error("URL params only works with flat JSON objects")
  }
  const params = Object.entries(obj as Record<string, unknown>)
    .filter(([, v]) => typeof v === "string" || typeof v === "number" || typeof v === "boolean")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&")
  if (!params) throw new Error("No serializable key-value pairs found")
  return params
}

function getTypeStats(obj: unknown): { type: string; count: number }[] {
  const counts: Record<string, number> = {}
  const walk = (v: unknown) => {
    if (v === null) { counts["null"] = (counts["null"] || 0) + 1; return }
    if (Array.isArray(v)) { counts["array"] = (counts["array"] || 0) + 1; v.forEach(walk); return }
    if (typeof v === "object") { counts["object"] = (counts["object"] || 0) + 1; Object.values(v as Record<string, unknown>).forEach(walk); return }
    const t = typeof v
    counts[t] = (counts[t] || 0) + 1
  }
  walk(obj)
  return Object.entries(counts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
}

interface TreeNodeProps {
  keyName: string | null
  value: unknown
  path: string
  onCopyPath: (path: string) => void
  depth: number
}

function JsonTreeNode({ keyName, value, path, onCopyPath, depth }: TreeNodeProps) {
  const [hovered, setHovered] = useState(false)

  const currentPath = keyName !== null ? (depth === 0 ? keyName : `${path}.${keyName}`) : path

  const isCollapsed = depth >= TREE_MAX_DEPTH

  if (value === null) {
    return (
      <div
        className="py-0.5 pl-6 relative group cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onCopyPath(currentPath)}
      >
        {hovered && (
          <span className="absolute right-0 top-0.5 px-2 py-0.5 rounded text-[11px] font-mono bg-primary/10 text-primary border border-primary/20">
            {currentPath}
          </span>
        )}
        {keyName !== null && <span className="text-primary">{keyName}</span>}
        {keyName !== null && <span className="text-muted-foreground">: </span>}
        <span className="text-orange-500">null</span>
      </div>
    )
  }

  if (typeof value === "boolean") {
    return (
      <div
        className="py-0.5 pl-6 relative group cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onCopyPath(currentPath)}
      >
        {hovered && (
          <span className="absolute right-0 top-0.5 px-2 py-0.5 rounded text-[11px] font-mono bg-primary/10 text-primary border border-primary/20">
            {currentPath}
          </span>
        )}
        {keyName !== null && <span className="text-primary">{keyName}</span>}
        {keyName !== null && <span className="text-muted-foreground">: </span>}
        <span className="text-blue-500">{String(value)}</span>
      </div>
    )
  }

  if (typeof value === "number") {
    const ts = value >= 1000000000000 && value <= 9999999999999
      ? new Date(value).toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC")
      : null
    return (
      <div
        className="py-0.5 pl-6 relative group cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onCopyPath(currentPath)}
      >
        {hovered && (
          <span className="absolute right-0 top-0.5 px-2 py-0.5 rounded text-[11px] font-mono bg-primary/10 text-primary border border-primary/20">
            {currentPath}
          </span>
        )}
        {keyName !== null && <span className="text-primary">{keyName}</span>}
        {keyName !== null && <span className="text-muted-foreground">: </span>}
        <span className="text-amber-600">{String(value)}</span>
        {ts && <span className="ml-1.5 text-[11px] text-muted-foreground/60">{ts}</span>}
      </div>
    )
  }

  if (typeof value === "string") {
    const tsPattern = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/
    const ts = tsPattern.test(value) ? value.replace("T", " ").replace("Z", " UTC") : null
    return (
      <div
        className="py-0.5 pl-6 relative group cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onCopyPath(currentPath)}
      >
        {hovered && (
          <span className="absolute right-0 top-0.5 px-2 py-0.5 rounded text-[11px] font-mono bg-primary/10 text-primary border border-primary/20">
            {currentPath}
          </span>
        )}
        {keyName !== null && <span className="text-primary">{keyName}</span>}
        {keyName !== null && <span className="text-muted-foreground">: </span>}
        <span className="text-green-600">&quot;{value}&quot;</span>
        {ts && <span className="ml-1.5 text-[11px] text-muted-foreground/60">{ts}</span>}
      </div>
    )
  }

  if (Array.isArray(value)) {
    const arrPath = keyName !== null ? (depth === 0 ? keyName : `${path}.${keyName}`) : path
    return (
      <div className="pl-6">
        <div
          className="py-0.5 relative group cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => onCopyPath(arrPath)}
        >
          {hovered && (
            <span className="absolute right-0 top-0.5 px-2 py-0.5 rounded text-[11px] font-mono bg-primary/10 text-primary border border-primary/20">
              {arrPath}
            </span>
          )}
          {keyName !== null && <span className="text-primary">{keyName}</span>}
          {keyName !== null && <span className="text-muted-foreground">: </span>}
          <span className="text-muted-foreground">[{value.length}]</span>
        </div>
        {!isCollapsed && value.slice(0, TREE_MAX_ENTRIES).map((item, i) => (
          <JsonTreeNode
            key={i}
            keyName={String(i)}
            value={item}
            path={`${arrPath}[${i}]`}
            onCopyPath={onCopyPath}
            depth={depth + 1}
          />
        ))}
        {!isCollapsed && value.length > TREE_MAX_ENTRIES && (
          <div className="py-0.5 pl-6 text-xs text-muted-foreground">... {value.length - TREE_MAX_ENTRIES} more items</div>
        )}
        {isCollapsed && value.length > 0 && (
          <div className="py-0.5 pl-6 text-xs text-muted-foreground">... {value.length} items (depth limit reached)</div>
        )}
      </div>
    )
  }

  if (typeof value === "object") {
    const objPath = keyName !== null ? (depth === 0 ? keyName : `${path}.${keyName}`) : path
    const entries = Object.entries(value as Record<string, unknown>)
    return (
      <div className="pl-6">
        <div
          className="py-0.5 relative group cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => onCopyPath(objPath)}
        >
          {hovered && (
            <span className="absolute right-0 top-0.5 px-2 py-0.5 rounded text-[11px] font-mono bg-primary/10 text-primary border border-primary/20">
              {objPath}
            </span>
          )}
          {keyName !== null && <span className="text-primary">{keyName}</span>}
          {keyName !== null && <span className="text-muted-foreground">: </span>}
          <span className="text-muted-foreground">{`{${entries.length}}`}</span>
        </div>
        {!isCollapsed && entries.slice(0, TREE_MAX_ENTRIES).map(([k, v]) => (
          <JsonTreeNode
            key={k}
            keyName={k}
            value={v}
            path={objPath}
            onCopyPath={onCopyPath}
            depth={depth + 1}
          />
        ))}
        {!isCollapsed && entries.length > TREE_MAX_ENTRIES && (
          <div className="py-0.5 pl-6 text-xs text-muted-foreground">... {entries.length - TREE_MAX_ENTRIES} more keys</div>
        )}
        {isCollapsed && entries.length > 0 && (
          <div className="py-0.5 pl-6 text-xs text-muted-foreground">... {entries.length} keys (depth limit reached)</div>
        )}
      </div>
    )
  }

  return null
}

export function JsonFormatter() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [fixes, setFixes] = useState<string[]>([])
  const [indent, setIndent] = useState(2)
  const [showTree, setShowTree] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [copied, handleCopy] = useCopyToClipboard()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const parsedRef = useRef<unknown>(null)

  const { t } = useLocale()

  const isLarge = input.length > MAX_AUTO_SIZE

  const parsedJson = useMemo(() => {
    if (!input.trim()) { parsedRef.current = null; return null }
    try {
      const obj = JSON.parse(output || input)
      parsedRef.current = obj
      return obj
    } catch {
      parsedRef.current = null
      return null
    }
  }, [input, output])

  const typeStats = useMemo(() => {
    if (!parsedJson) return []
    return getTypeStats(parsedJson)
  }, [parsedJson])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const applyAction = useCallback((action: (parsed: unknown) => string) => {
    if (!input.trim()) return
    setProcessing(true)
    setTimeout(() => {
      try {
        const result = smartRepair(input)
        const json = result ? result.json : JSON.parse(input)
        const out = action(json)
        setOutput(out)
        setError("")
        if (result) setFixes(result.fixes)
        else setFixes([])
      } catch (e) {
        setError(e instanceof Error ? e.message : "Operation failed")
        setOutput("")
      } finally {
        setProcessing(false)
      }
    }, 0)
  }, [input])

  const processInput = useCallback((value: string) => {
    setFixes([])
    if (!value.trim()) { setOutput(""); setError(""); return }
    try {
      if (isLarge) {
        setError("Large JSON detected. Auto-format disabled. Click a button below to format.")
        setOutput("")
        return
      }
      const result = smartRepair(value)
      if (result) {
        setOutput(JSON.stringify(result.json, null, indent))
        setError("")
        setFixes(result.fixes)
      } else {
        setOutput(formatJson(value, indent))
        setError("")
        setFixes([])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON")
      setOutput("")
    }
  }, [indent, isLarge])

  const handleInputChange = useCallback((value: string) => {
    setInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value.trim()) { setOutput(""); setError(""); setFixes([]); return }
    debounceRef.current = setTimeout(() => processInput(value), DEBOUNCE_MS)
  }, [processInput])

  const handleClear = () => { setInput(""); setOutput(""); setError(""); setFixes([]); setProcessing(false) }
  const handleCopyAsJsVar = () => { try { handleCopy(toJsonVariable(output || input, indent)) } catch { /* already validated */ } }
  const handleCopyAsUrlParams = () => { try { handleCopy(toUrlParams(output || input)) } catch (e) { setError(e instanceof Error ? e.message : "Cannot convert to URL params") } }
  const handleCopyPath = (path: string) => { handleCopy(path) }

  const handleSortKeys = () => applyAction((obj) => JSON.stringify(sortKeysDeep(obj), null, indent))
  const handleFlatten = () => applyAction((obj) => JSON.stringify(flatFlatten(obj, { delimiter: "." }), null, indent))
  const handleUnflatten = () => applyAction((obj) => JSON.stringify(flatUnflatten(obj as Record<string, unknown>, { delimiter: "." }), null, indent))
  const handleStructure = () => applyAction((obj) => extractStructure(JSON.stringify(obj), indent))
  const handleToMdTable = () => {
    if (!input.trim()) return
    setProcessing(true)
    setTimeout(() => {
      try {
        const result = smartRepair(input)
        const json = result ? result.json : JSON.parse(input)
        if (!Array.isArray(json)) throw new Error("Input must be a JSON array of objects")
        const md = toJsonMarkdownTable(JSON.stringify(json))
        setOutput(md)
        setError("")
        if (result) setFixes(result.fixes)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Cannot convert to Markdown table")
        setOutput("")
      } finally {
        setProcessing(false)
      }
    }, 0)
  }
  const handleFromMdTable = () => {
    if (!input.trim()) return
    setProcessing(true)
    setTimeout(() => {
      try {
        const json = markdownTableToJson(input)
        setOutput(json)
        setError("")
      } catch (e) {
        setError(e instanceof Error ? e.message : "Cannot parse Markdown table")
        setOutput("")
      } finally {
        setProcessing(false)
      }
    }, 0)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-6 py-3 flex-wrap">
        <span className="text-sm text-muted-foreground">{t("tool.jsonFormat.indent")}</span>
        <Button variant={indent === 2 ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => { setIndent(2) }}>2</Button>
        <Button variant={indent === 4 ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => { setIndent(4) }}>4</Button>
        <Button variant={indent === 1 ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => { setIndent(1) }}>Tab</Button>
        {error && <ErrorBanner message={error} />}
        {fixes.length > 0 && !error && (
          <span className="ml-auto text-xs text-green-500">{t("tool.jsonFormat.autoFixed")}{fixes.join(", ")}</span>
        )}
      </div>
      <div className="flex-1 overflow-auto p-6">
        {isLarge && input.length > 0 && !error && (
          <div className="mb-3 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-600 dark:text-yellow-400">
            Large JSON ({Math.round(input.length / 1024)} KB). Auto-format disabled for performance. Click a button below to format.
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between min-h-[36px]">
              <label className="text-sm font-medium text-foreground">{t("tool.jsonFormat.input")}</label>
              <div />
            </div>
            <Textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={t("tool.jsonFormat.placeholder")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between min-h-[36px]">
              <label className="text-sm font-medium text-foreground">{t("tool.jsonFormat.output")}</label>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className={`gap-1 cursor-pointer ${showTree ? "text-primary" : "text-muted-foreground"}`} onClick={() => { setShowTree(!showTree); setShowStats(false) }}>
                  <Braces className="h-3.5 w-3.5" />
                  {t("tool.jsonFormat.tree")}
                </Button>
                <Button variant="ghost" size="sm" className={`gap-1 cursor-pointer ${showStats ? "text-primary" : "text-muted-foreground"}`} onClick={() => { setShowStats(!showStats); setShowTree(false) }}>
                  <Layers className="h-3.5 w-3.5" />
                  {t("tool.jsonFormat.stats")}
                </Button>
              </div>
            </div>
            {processing ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : showTree && parsedJson ? (
              <div className="min-h-[200px] rounded-md border border-input bg-muted px-3 py-2 font-mono text-xs overflow-auto">
                <JsonTreeNode keyName={null} value={parsedJson} path="data" onCopyPath={handleCopyPath} depth={0} />
              </div>
            ) : showStats && parsedJson ? (
              <div className="min-h-[200px] rounded-md border border-input bg-muted px-3 py-2 text-xs overflow-auto">
                <div className="space-y-1.5">
                  {typeStats.map(({ type, count }) => (
                    <div key={type} className="flex items-center justify-between gap-3">
                      <span className="font-mono text-primary">{type}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ReadOnlyTextarea value={output} placeholder={t("tool.jsonFormat.formattedPlaceholder")} />
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button className="cursor-pointer" disabled={processing} onClick={() => applyAction((obj) => JSON.stringify(obj, null, indent))}>{t("tool.jsonFormat.format")}</Button>
          <Button variant="outline" className="cursor-pointer" disabled={processing} onClick={() => applyAction((obj) => JSON.stringify(obj))}>{t("tool.jsonFormat.minify")}</Button>
          <Button variant="outline" className="gap-1.5 cursor-pointer" disabled={processing} onClick={handleSortKeys}>
            <ArrowDownUp className="h-3.5 w-3.5" />
            {t("tool.jsonFormat.sortKeys")}
          </Button>
          <Button variant="outline" size="sm" className="cursor-pointer" disabled={processing} onClick={handleFlatten}>
            {t("tool.jsonFormat.flatten")}
          </Button>
          <Button variant="outline" size="sm" className="cursor-pointer" disabled={processing} onClick={handleUnflatten}>
            {t("tool.jsonFormat.unflatten")}
          </Button>
          <Button variant="outline" size="sm" className="cursor-pointer" disabled={processing} onClick={handleStructure}>
            {t("tool.jsonFormat.structure")}
          </Button>
          <Button variant="outline" size="sm" className="cursor-pointer" disabled={processing} onClick={handleToMdTable}>
            {t("tool.jsonFormat.toMdTable")}
          </Button>
          <Button variant="outline" size="sm" className="cursor-pointer" disabled={processing} onClick={handleFromMdTable}>
            {t("tool.jsonFormat.fromMdTable")}
          </Button>
          <div className="w-px h-6 bg-border self-center" />
          <Button variant="outline" className="gap-1.5 cursor-pointer" disabled={processing} onClick={() => handleCopy(output)}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? t("shared.copied") : t("shared.copy")}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" disabled={processing || !output} onClick={handleCopyAsJsVar}>
            <FileCode className="h-3.5 w-3.5" />
            {t("tool.jsonFormat.copyAsJs")}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" disabled={processing || !output} onClick={handleCopyAsUrlParams}>
            <Link className="h-3.5 w-3.5" />
            {t("tool.jsonFormat.copyAsParams")}
          </Button>
          <Button variant="ghost" className="gap-1.5 cursor-pointer ml-auto" disabled={processing} onClick={handleClear}>
            <Trash2 className="h-3.5 w-3.5" />
            {t("tool.jsonFormat.clear")}
          </Button>
        </div>
      </div>
    </div>
  )
}
