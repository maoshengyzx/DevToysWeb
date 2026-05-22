import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

type Category = "length" | "weight" | "temperature" | "area" | "volume" | "speed" | "data"

type UnitDef = { label: string; value: number; isBase?: boolean }

const units: Record<Category, { name: string; units: UnitDef[] }> = {
  length: {
    name: "Length",
    units: [
      { label: "Millimeter (mm)", value: 0.001 },
      { label: "Centimeter (cm)", value: 0.01 },
      { label: "Meter (m)", value: 1, isBase: true },
      { label: "Kilometer (km)", value: 1000 },
      { label: "Inch (in)", value: 0.0254 },
      { label: "Foot (ft)", value: 0.3048 },
      { label: "Yard (yd)", value: 0.9144 },
      { label: "Mile (mi)", value: 1609.344 },
      { label: "Nautical Mile", value: 1852 },
    ],
  },
  weight: {
    name: "Weight",
    units: [
      { label: "Milligram (mg)", value: 0.000001 },
      { label: "Gram (g)", value: 0.001 },
      { label: "Kilogram (kg)", value: 1, isBase: true },
      { label: "Metric Ton (t)", value: 1000 },
      { label: "Ounce (oz)", value: 0.0283495 },
      { label: "Pound (lb)", value: 0.453592 },
    ],
  },
  temperature: {
    name: "Temperature",
    units: [
      { label: "Celsius (°C)", value: 1, isBase: true },
      { label: "Fahrenheit (°F)", value: 1 },
      { label: "Kelvin (K)", value: 1 },
    ],
  },
  area: {
    name: "Area",
    units: [
      { label: "mm²", value: 0.000001 },
      { label: "cm²", value: 0.0001 },
      { label: "m²", value: 1, isBase: true },
      { label: "km²", value: 1000000 },
      { label: "Hectare", value: 10000 },
      { label: "Acre", value: 4046.86 },
      { label: "sqft", value: 0.092903 },
    ],
  },
  volume: {
    name: "Volume",
    units: [
      { label: "Milliliter (mL)", value: 0.001 },
      { label: "Liter (L)", value: 1, isBase: true },
      { label: "US Gallon", value: 3.78541 },
      { label: "UK Gallon", value: 4.54609 },
      { label: "Cubic Meter (m³)", value: 1000 },
      { label: "Cup (US)", value: 0.236588 },
    ],
  },
  speed: {
    name: "Speed",
    units: [
      { label: "m/s", value: 1, isBase: true },
      { label: "km/h", value: 0.277778 },
      { label: "mph", value: 0.44704 },
      { label: "knot", value: 0.514444 },
      { label: "ft/s", value: 0.3048 },
    ],
  },
  data: {
    name: "Digital Storage",
    units: [
      { label: "Bit", value: 0.125 },
      { label: "Byte (B)", value: 1, isBase: true },
      { label: "Kilobyte (KB)", value: 1024 },
      { label: "Megabyte (MB)", value: 1048576 },
      { label: "Gigabyte (GB)", value: 1073741824 },
      { label: "Terabyte (TB)", value: 1099511627776 },
    ],
  },
}

function convertTemperature(value: number, from: string, to: string): number {
  let celsius: number
  if (from.includes("Celsius")) celsius = value
  else if (from.includes("Fahrenheit")) celsius = (value - 32) * 5 / 9
  else celsius = value - 273.15

  if (to.includes("Celsius")) return celsius
  if (to.includes("Fahrenheit")) return celsius * 9 / 5 + 32
  return celsius + 273.15
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return n.toString()
  if (Math.abs(n) < 0.001 || Math.abs(n) > 1e9) return n.toExponential(6)
  return parseFloat(n.toPrecision(10)).toString()
}

function doConvert(val: string, from: number, to: number, catKey: Category): string {
  const num = parseFloat(val)
  if (isNaN(num)) return ""

  const fromDef = units[catKey].units[from]
  const toDef = units[catKey].units[to]

  if (catKey === "temperature") {
    const result = convertTemperature(num, fromDef.label, toDef.label)
    return formatNumber(result)
  }
  const baseValue = num * fromDef.value
  const result = baseValue / toDef.value
  return formatNumber(result)
}

export function UnitConverter() {
  const [category, setCategory] = useState<Category>("length")
  const [fromUnit, setFromUnit] = useState(2)
  const [fromValue, setFromValue] = useState("1")
  const [copied, handleCopy] = useCopyToClipboard()

  const cat = units[category]

  const handleCategoryChange = (newCat: Category) => {
    const newUnits = units[newCat]
    const baseIdx = newUnits.units.findIndex((u) => u.isBase)
    const from = baseIdx >= 0 ? baseIdx : 0
    setCategory(newCat)
    setFromUnit(from)
    setFromValue("1")
  }

  const handleFromUnitChange = (idx: number) => {
    setFromUnit(idx)
    setFromValue(fromValue || "1")
  }

  const num = parseFloat(fromValue)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-6 py-3 flex-wrap">
        <span className="text-sm text-muted-foreground">Category:</span>
        {Object.entries(units).map(([key, val]) => (
          <Button
            key={key}
            variant={category === key ? "default" : "outline"}
            size="sm"
            className="cursor-pointer"
            onClick={() => handleCategoryChange(key as Category)}
          >
            {val.name}
          </Button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 items-start">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Value</label>
              <input
                type="text"
                inputMode="decimal"
                value={fromValue}
                onChange={(e) => setFromValue(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Enter a number..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">From</label>
              <select
                value={fromUnit}
                onChange={(e) => handleFromUnitChange(Number(e.target.value))}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
              >
                {cat.units.map((u, i) => (
                  <option key={i} value={i}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Conversions</label>
            <div className="flex flex-col gap-1.5">
              {cat.units.map((u, i) => {
                const result = !isNaN(num) && fromValue.trim()
                  ? doConvert(fromValue, fromUnit, i, category)
                  : ""
                const isFrom = i === fromUnit
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 ${isFrom ? "border-primary/50 bg-primary/5" : "border-border"}`}
                  >
                    <span className="w-40 shrink-0 text-sm text-muted-foreground truncate">{u.label}</span>
                    <code className="flex-1 text-sm font-mono text-foreground break-all select-all">
                      {result || "\u00A0"}
                    </code>
                    {result && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-7 w-7 cursor-pointer"
                        onClick={() => handleCopy(result)}
                      >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}