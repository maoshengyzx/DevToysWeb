import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { CronExpressionParser } from "cron-parser"
import cronstrue from "cronstrue"
import { ErrorBanner } from "@/components/ui/error-banner"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

const PRESETS = [
  { label: "Every minute", cron: "* * * * *" },
  { label: "Every 5 minutes", cron: "*/5 * * * *" },
  { label: "Every hour", cron: "0 * * * *" },
  { label: "Every day at midnight", cron: "0 0 * * *" },
  { label: "Every Monday at 9am", cron: "0 9 * * 1" },
  { label: "Every month on the 1st", cron: "0 0 1 * *" },
]

const MINUTE_OPTIONS = [
  { label: "Every minute", value: "*" },
  { label: "Every 5 minutes", value: "*/5" },
  { label: "Every 10 minutes", value: "*/10" },
  { label: "Every 15 minutes", value: "*/15" },
  { label: "Every 30 minutes", value: "*/30" },
  { label: "At minute 0", value: "0" },
  { label: "At minute 30", value: "30" },
]

const HOUR_OPTIONS = [
  { label: "Every hour", value: "*" },
  { label: "Every 2 hours", value: "*/2" },
  { label: "Every 6 hours", value: "*/6" },
  { label: "At 00:00 (midnight)", value: "0" },
  { label: "At 06:00", value: "6" },
  { label: "At 09:00", value: "9" },
  { label: "At 12:00 (noon)", value: "12" },
  { label: "At 18:00", value: "18" },
]

const DOM_OPTIONS = [
  { label: "Every day", value: "*" },
  { label: "1st", value: "1" },
  { label: "15th", value: "15" },
  { label: "Last day (28th)", value: "28" },
]

const MONTH_OPTIONS = [
  { label: "Every month", value: "*" },
  { label: "January", value: "1" },
  { label: "Every 3 months", value: "*/3" },
  { label: "Every 6 months", value: "*/6" },
]

const DOW_OPTIONS = [
  { label: "Every day", value: "*" },
  { label: "Monday–Friday", value: "1-5" },
  { label: "Sunday", value: "0" },
  { label: "Monday", value: "1" },
  { label: "Saturday + Sunday", value: "0,6" },
]

type Tab = "parse" | "generate"

function buildCronField(options: { label: string; value: string }[], selected: string, custom: string, useCustom: boolean, onChange: (v: string) => void) {
  return (
    <div className="flex items-center gap-2">
      <select
        className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
        value={useCustom ? "custom" : selected}
        onChange={(e) => {
          if (e.target.value === "custom") {
            onChange("__custom__")
          } else {
            onChange(e.target.value)
          }
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label} ({o.value})</option>
        ))}
        <option value="custom">Custom...</option>
      </select>
      {useCustom && (
        <input
          type="text"
          value={custom}
          onChange={(e) => onChange(e.target.value)}
          placeholder="*"
          className="h-9 w-20 rounded-md border border-input bg-background px-2 font-mono text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      )}
    </div>
  )
}

function CronFieldSelect({
  label,
  fieldDesc,
  options,
  value,
  onChange,
}: {
  label: string
  fieldDesc: string
  options: { label: string; value: string }[]
  value: string
  onChange: (v: string) => void
}) {
  const useCustom = !options.some((o) => o.value === value) && value !== "__custom__"
  const [, setLocalInit] = useState(false)
  const handleSelect = (v: string) => {
    if (v === "__custom__") {
      setLocalInit(true)
      onChange("")
    } else {
      onChange(v)
    }
  }
  const currentSelectVal = useCustom ? "custom" : value
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="text-xs text-muted-foreground">{fieldDesc}</span>
      </div>
      {buildCronField(options, currentSelectVal, value, useCustom, handleSelect)}
    </div>
  )
}

function CronGenerator({ onGenerate }: { onGenerate: (cron: string) => void }) {
  const [minute, setMinute] = useState("*")
  const [hour, setHour] = useState("*")
  const [dom, setDom] = useState("*")
  const [month, setMonth] = useState("*")
  const [dow, setDow] = useState("*")

  const generated = [minute, hour, dom, month, dow].map((v) => v || "*").join(" ")

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <CronFieldSelect label="Minute" fieldDesc="(0-59)" options={MINUTE_OPTIONS} value={minute} onChange={setMinute} />
        <CronFieldSelect label="Hour" fieldDesc="(0-23)" options={HOUR_OPTIONS} value={hour} onChange={setHour} />
        <CronFieldSelect label="Day of Month" fieldDesc="(1-31)" options={DOM_OPTIONS} value={dom} onChange={setDom} />
        <CronFieldSelect label="Month" fieldDesc="(1-12)" options={MONTH_OPTIONS} value={month} onChange={setMonth} />
        <CronFieldSelect label="Day of Week" fieldDesc="(0-6, Sun=0)" options={DOW_OPTIONS} value={dow} onChange={setDow} />
      </div>

      <div className="rounded-md border border-border bg-muted px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Generated Expression</p>
            <p className="font-mono text-lg text-foreground">{generated}</p>
          </div>
          <Button size="sm" onClick={() => onGenerate(generated)}>Use This</Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">Quick Presets</label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.cron}
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => {
                const parts = preset.cron.split(/\s+/)
                setMinute(parts[0] ?? "*")
                setHour(parts[1] ?? "*")
                setDom(parts[2] ?? "*")
                setMonth(parts[3] ?? "*")
                setDow(parts[4] ?? "*")
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

function CronResult({ cron }: { cron: string }) {
  const [, copy] = useCopyToClipboard()

  const description = useMemo(() => {
    try {
      return cronstrue.toString(cron)
    } catch {
      return ""
    }
  }, [cron])

  const error = useMemo(() => {
    if (!cron.trim()) return ""
    try {
      CronExpressionParser.parse(cron)
      return ""
    } catch (e) {
      return e instanceof Error ? e.message : "Invalid cron expression"
    }
  }, [cron])

  const times = useMemo(() => {
    if (error || !cron.trim()) return []
    try {
      const interval = CronExpressionParser.parse(cron)
      const results: Date[] = []
      for (let i = 0; i < 5; i++) {
        const next = interval.next()
        if (next) results.push(next.toDate())
      }
      return results
    } catch {
      return []
    }
  }, [cron, error])

  return (
    <div className="space-y-6">
      {error && <ErrorBanner message={error} />}

      {description && !error && (
        <div className="rounded-md border border-border bg-muted px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Human-readable</p>
          <p className="text-sm text-foreground">{description}</p>
        </div>
      )}

      {cron.trim() && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Field Reference</label>
          <div className="space-y-1 text-xs font-mono text-muted-foreground">
            <p>┌───────────── minute (0-59)</p>
            <p>│ ┌───────────── hour (0-23)</p>
            <p>│ │ ┌───────────── day of month (1-31)</p>
            <p>│ │ │ ┌───────────── month (1-12)</p>
            <p>│ │ │ │ ┌───────────── day of week (0-6, Sun=0)</p>
            <p>│ │ │ │ │</p>
            <p className="text-foreground">{cron.split(/\s+/).join(" ") || "* * * * *"}</p>
          </div>
        </div>
      )}

      {!error && times.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Next 5 Occurrences</label>
            <Button variant="ghost" size="sm" className="cursor-pointer" onClick={() => copy(times.map((t) => t.toISOString()).join("\n"))}>
              Copy all
            </Button>
          </div>
          <div className="space-y-1">
            {times.map((t: Date, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm font-mono text-foreground">
                <span>{t.toLocaleString()}</span>
                <Button variant="ghost" size="sm" className="cursor-pointer" onClick={() => copy(t.toISOString())}>
                  Copy
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">Common Presets</label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.cron}
              variant="outline"
              size="sm"
              className="cursor-pointer"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CronParser() {
  const [tab, setTab] = useState<Tab>("parse")
  const [cron, setCron] = useState("0 9 * * 1")

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 max-w-4xl">
          <div className="flex gap-1 rounded-md border border-border p-1 bg-muted w-fit">
            <button
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 cursor-pointer ${
                tab === "parse" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setTab("parse")}
            >
              Parse
            </button>
            <button
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 cursor-pointer ${
                tab === "generate" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setTab("generate")}
            >
              Generate
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              {tab === "parse" ? (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Cron Expression</label>
                  <input
                    type="text"
                    value={cron}
                    onChange={(e) => setCron(e.target.value)}
                    placeholder="* * * * *"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              ) : (
                <CronGenerator onGenerate={(generated) => {
                  setCron(generated)
                  setTab("parse")
                }} />
              )}
            </div>
            <div className="flex flex-col gap-4">
              {tab === "parse" && <CronResult cron={cron} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}