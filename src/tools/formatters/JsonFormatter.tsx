import { useState, useMemo, useCallback } from "react"
import { Textarea, ReadOnlyTextarea } from "@/components/ui/shared"
import { Button } from "@/components/ui/button"
import { Copy, Check, Trash2, Braces, FileCode, Link } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { ErrorBanner } from "@/components/ui/error-banner"

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

  let unquotedMatch: RegExpExecArray | null
  let unquotedCount = 0
  const tempFixed = fixed
  const tempPattern = /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g
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
  return JSON.stringify(JSON.parse(input), null, indent)
}

function minifyJson(input: string): string {
  return JSON.stringify(JSON.parse(input))
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
        {ts && <span className="ml-1.5 text-[11px] text-muted-foreground/60">📅 {ts}</span>}
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
        {ts && <span className="ml-1.5 text-[11px] text-muted-foreground/60">📅 {ts}</span>}
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
        {value.map((item, i) => (
          <JsonTreeNode
            key={i}
            keyName={String(i)}
            value={item}
            path={`${arrPath}[${i}]`}
            onCopyPath={onCopyPath}
            depth={depth + 1}
          />
        ))}
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
        {entries.map(([k, v]) => (
          <JsonTreeNode
            key={k}
            keyName={k}
            value={v}
            path={objPath}
            onCopyPath={onCopyPath}
            depth={depth + 1}
          />
        ))}
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
  const [copied, handleCopy] = useCopyToClipboard()

  const parsedJson = useMemo(() => {
    if (!input.trim()) return null
    try {
      return JSON.parse(output || input)
    } catch {
      return null
    }
  }, [input, output])

  const handleFormat = useCallback(() => {
    if (!input.trim()) return
    try {
      const result = smartRepair(input)
      if (result) {
        setOutput(JSON.stringify(result.json, null, indent))
        setError("")
        setFixes(result.fixes)
      } else {
        setOutput(formatJson(input, indent))
        setFixes([])
      }
    } catch (e) {
      setFixes([])
      setError(e instanceof Error ? e.message : "Invalid JSON")
      setOutput("")
    }
  }, [input, indent])

  const handleMinify = useCallback(() => {
    if (!input.trim()) return
    try {
      const result = smartRepair(input)
      if (result) {
        setOutput(JSON.stringify(result.json))
        setError("")
        setFixes(result.fixes)
      } else {
        setOutput(minifyJson(input))
        setFixes([])
      }
    } catch (e) {
      setFixes([])
      setError(e instanceof Error ? e.message : "Invalid JSON")
      setOutput("")
    }
  }, [input])

  const handleInputChange = useCallback((value: string) => {
    setInput(value)
    setFixes([])
    if (!value.trim()) {
      setOutput("")
      setError("")
      return
    }
    try {
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
  }, [indent])

  const handleClear = () => {
    setInput("")
    setOutput("")
    setError("")
    setFixes([])
  }

  const handleCopyAsJsVar = () => {
    try {
      handleCopy(toJsonVariable(output || input, indent))
    } catch { /* already validated */ }
  }

  const handleCopyAsUrlParams = () => {
    try {
      handleCopy(toUrlParams(output || input))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cannot convert to URL params")
    }
  }

  const handleCopyPath = (path: string) => {
    handleCopy(path)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-6 py-3 flex-wrap">
        <span className="text-sm text-muted-foreground">Indent:</span>
        <Button variant={indent === 2 ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => { setIndent(2); if (input.trim() && !error) setOutput(formatJson(input, 2)) }}>2</Button>
        <Button variant={indent === 4 ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => { setIndent(4); if (input.trim() && !error) setOutput(formatJson(input, 4)) }}>4</Button>
        <Button variant={indent === 1 ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => { setIndent(1); if (input.trim() && !error) setOutput(formatJson(input, 1)) }}>Tab</Button>
        {error && <ErrorBanner message={error} />}
        {fixes.length > 0 && !error && (
          <span className="ml-auto text-xs text-green-500">Auto-fixed: {fixes.join(", ")}</span>
        )}
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Input</label>
            <Textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste JSON here..."
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Output</label>
              <Button variant="ghost" size="sm" className={`gap-1 cursor-pointer ${showTree ? "text-primary" : "text-muted-foreground"}`} onClick={() => setShowTree(!showTree)}>
                <Braces className="h-3.5 w-3.5" />
                Tree View
              </Button>
            </div>
            {showTree && parsedJson ? (
              <div className="min-h-[200px] rounded-md border border-input bg-muted px-3 py-2 font-mono text-xs overflow-auto">
                <JsonTreeNode keyName={null} value={parsedJson} path="data" onCopyPath={handleCopyPath} depth={0} />
              </div>
            ) : (
              <ReadOnlyTextarea value={output} placeholder="Formatted result will appear here..." />
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button className="cursor-pointer" onClick={handleFormat}>Format</Button>
          <Button variant="outline" className="cursor-pointer" onClick={handleMinify}>Minify</Button>
          <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(output)}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" onClick={handleCopyAsJsVar} disabled={!output}>
            <FileCode className="h-3.5 w-3.5" />
            Copy as JS
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" onClick={handleCopyAsUrlParams} disabled={!output}>
            <Link className="h-3.5 w-3.5" />
            Copy as Params
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