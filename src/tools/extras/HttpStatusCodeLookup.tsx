import { useState, useMemo } from "react"

const HTTP_STATUS_CODES: Record<number, string> = {
  100: "Continue",
  101: "Switching Protocols",
  102: "Processing",
  200: "OK",
  201: "Created",
  202: "Accepted",
  203: "Non-Authoritative Information",
  204: "No Content",
  205: "Reset Content",
  206: "Partial Content",
  207: "Multi-Status",
  208: "Already Reported",
  226: "IM Used",
  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  305: "Use Proxy",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Payload Too Large",
  414: "URI Too Long",
  415: "Unsupported Media Type",
  416: "Range Not Satisfiable",
  417: "Expectation Failed",
  418: "I'm a Teapot",
  421: "Misdirected Request",
  422: "Unprocessable Entity",
  423: "Locked",
  424: "Failed Dependency",
  425: "Too Early",
  426: "Upgrade Required",
  428: "Precondition Required",
  429: "Too Many Requests",
  431: "Request Header Fields Too Large",
  451: "Unavailable For Legal Reasons",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage",
  508: "Loop Detected",
  510: "Not Extended",
  511: "Network Authentication Required",
}

function getCategory(code: number): string {
  if (code >= 100 && code < 200) return "Informational"
  if (code >= 200 && code < 300) return "Success"
  if (code >= 300 && code < 400) return "Redirection"
  if (code >= 400 && code < 500) return "Client Error"
  if (code >= 500 && code < 600) return "Server Error"
  return "Unknown"
}

function getCategoryColor(code: number): string {
  if (code >= 100 && code < 200) return "text-blue-500"
  if (code >= 200 && code < 300) return "text-green-500"
  if (code >= 300 && code < 400) return "text-yellow-500"
  if (code >= 400 && code < 500) return "text-orange-500"
  if (code >= 500 && code < 600) return "text-red-500"
  return "text-muted-foreground"
}

export function HttpStatusCodeLookup() {
  const [search, setSearch] = useState("")

  const results = useMemo(() => {
    if (!search.trim()) return Object.entries(HTTP_STATUS_CODES).map(([code, desc]) => ({ code: Number(code), desc }))
    const q = search.trim().toLowerCase()
    return Object.entries(HTTP_STATUS_CODES)
      .filter(([code, desc]) => code.includes(q) || desc.toLowerCase().includes(q))
      .map(([code, desc]) => ({ code: Number(code), desc }))
  }, [search])

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code or description..."
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mb-4"
          />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {results.map(({ code, desc }) => (
              <div key={code} className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
                <span className={`text-sm font-mono font-bold ${getCategoryColor(code)}`}>{code}</span>
                <span className="flex-1 text-sm text-foreground truncate">{desc}</span>
                <span className="text-xs text-muted-foreground shrink-0">{getCategory(code)}</span>
              </div>
            ))}
            {results.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 col-span-full">No matching status codes found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}