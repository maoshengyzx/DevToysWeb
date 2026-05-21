import { useState } from "react"
import { Textarea, ReadOnlyTextarea } from "@/components/ui/shared"
import { Button } from "@/components/ui/button"
import { Copy, Check, Trash2 } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { ErrorBanner } from "@/components/ui/error-banner"
import { Parser } from "node-sql-parser"

type Lang = "java" | "kotlin" | "typescript" | "csharp" | "python" | "go"

interface Column {
  name: string
  type: string
  nullable: boolean
  defaultValue: string | null
  primaryKey: boolean
  autoIncrement: boolean
}

interface Table {
  name: string
  columns: Column[]
}

const SQL_TO_JAVA: Record<string, string> = {
  tinyint: "Byte", smallint: "Short", mediumint: "Integer", int: "Integer", integer: "Integer", bigint: "Long",
  float: "Float", double: "Double", decimal: "BigDecimal", numeric: "BigDecimal", real: "Float",
  char: "String", varchar: "String", text: "String", tinytext: "String", mediumtext: "String", longtext: "String", nchar: "String", nvarchar: "String", ntext: "String", clob: "String", enum: "String", set: "String",
  date: "LocalDate", time: "LocalTime", datetime: "LocalDateTime", timestamp: "LocalDateTime",
  boolean: "Boolean", bool: "Boolean", bit: "Boolean",
  blob: "byte[]", binary: "byte[]", varbinary: "byte[]", longblob: "byte[]", mediumblob: "byte[]", tinyblob: "byte[]",
  uuid: "UUID", uniqueidentifier: "UUID",
  serial: "Long", bigserial: "Long",
}

const SQL_TO_KOTLIN: Record<string, string> = Object.fromEntries(
  Object.entries(SQL_TO_JAVA).map(([k, v]) => {
    const map: Record<string, string> = {
      Integer: "Int", Short: "Short", Long: "Long",
      Float: "Float", Double: "Double", BigDecimal: "BigDecimal",
      String: "String", Boolean: "Boolean", Byte: "Byte",
      LocalDate: "LocalDate", LocalTime: "LocalTime", LocalDateTime: "LocalDateTime",
      "byte[]": "ByteArray", UUID: "UUID",
    }
    return [k, map[v] ?? v]
  })
)

const SQL_TO_TS: Record<string, string> = {
  tinyint: "number", smallint: "number", mediumint: "number", int: "number", integer: "number", bigint: "number", serial: "number", bigserial: "number",
  float: "number", double: "number", decimal: "number", numeric: "number", real: "number",
  char: "string", varchar: "string", text: "string", tinytext: "string", mediumtext: "string", longtext: "string", nchar: "string", nvarchar: "string", ntext: "string", clob: "string", enum: "string", set: "string",
  date: "string", time: "string", datetime: "string", timestamp: "string",
  boolean: "boolean", bool: "boolean", bit: "boolean",
  blob: "ArrayBuffer", binary: "ArrayBuffer", varbinary: "ArrayBuffer", longblob: "ArrayBuffer", mediumblob: "ArrayBuffer", tinyblob: "ArrayBuffer",
  uuid: "string", uniqueidentifier: "string",
}

const SQL_TO_CSHARP: Record<string, string> = {
  tinyint: "byte", smallint: "short", mediumint: "int", int: "int", integer: "int", bigint: "long", serial: "long", bigserial: "long",
  float: "float", double: "double", decimal: "decimal", numeric: "decimal", real: "float",
  char: "string", varchar: "string", text: "string", tinytext: "string", mediumtext: "string", longtext: "string", nchar: "string", nvarchar: "string", ntext: "string", clob: "string", enum: "string", set: "string",
  date: "DateTime", time: "TimeSpan", datetime: "DateTime", timestamp: "DateTime",
  boolean: "bool", bool: "bool", bit: "bool",
  blob: "byte[]", binary: "byte[]", varbinary: "byte[]", longblob: "byte[]", mediumblob: "byte[]", tinyblob: "byte[]",
  uuid: "Guid", uniqueidentifier: "Guid",
}

const SQL_TO_PYTHON: Record<string, string> = {
  tinyint: "int", smallint: "int", mediumint: "int", int: "int", integer: "int", bigint: "int", serial: "int", bigserial: "int",
  float: "float", double: "float", decimal: "Decimal", numeric: "Decimal", real: "float",
  char: "str", varchar: "str", text: "str", tinytext: "str", mediumtext: "str", longtext: "str", nchar: "str", nvarchar: "str", ntext: "str", clob: "str", enum: "str", set: "str",
  date: "date", time: "time", datetime: "datetime", timestamp: "datetime",
  boolean: "bool", bool: "bool", bit: "bool",
  blob: "bytes", binary: "bytes", varbinary: "bytes", longblob: "bytes", mediumblob: "bytes", tinyblob: "bytes",
  uuid: "UUID", uniqueidentifier: "UUID",
}

const SQL_TO_GO: Record<string, string> = {
  tinyint: "int8", smallint: "int16", mediumint: "int32", int: "int32", integer: "int32", bigint: "int64", serial: "int64", bigserial: "int64",
  float: "float32", double: "float64", decimal: "float64", numeric: "float64", real: "float32",
  char: "string", varchar: "string", text: "string", tinytext: "string", mediumtext: "string", longtext: "string", nchar: "string", nvarchar: "string", ntext: "string", clob: "string", enum: "string", set: "string",
  date: "time.Time", time: "time.Time", datetime: "time.Time", timestamp: "time.Time",
  boolean: "bool", bool: "bool", bit: "bool",
  blob: "[]byte", binary: "[]byte", varbinary: "[]byte", longblob: "[]byte", mediumblob: "[]byte", tinyblob: "[]byte",
  uuid: "uuid.UUID", uniqueidentifier: "uuid.UUID",
}

function mapType(sqlType: string, typeMap: Record<string, string>): string {
  const base = sqlType.toLowerCase().split("(")[0].split(" ")[0].trim()
  return typeMap[base] ?? "String"
}

function toPascalCase(s: string): string {
  return s.split(/[_\s-]/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("")
}

function toCamelCase(s: string): string {
  const p = toPascalCase(s)
  return p.charAt(0).toLowerCase() + p.slice(1)
}

function toSnakeCase(s: string): string {
  return s.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[\s-]+/g, "_").toLowerCase()
}

function extractDefaultValue(val: unknown): string | null {
  if (val === null || val === undefined) return null
  if (typeof val === "object" && val !== null) {
    const obj = val as Record<string, unknown>
    if ("value" in obj) {
      const v = obj.value
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v)
      if (typeof v === "object" && v !== null && "value" in (v as Record<string, unknown>)) {
        return String((v as Record<string, unknown>).value)
      }
      return String(v)
    }
  }
  return String(val)
}

function parseSql(sql: string): Table[] {
  const parser = new Parser()
  const asts = parser.astify(sql, { database: "MySQL" }) as unknown as Array<Record<string, unknown>>
  const tables: Table[] = []

  for (const ast of asts) {
    if (ast.type !== "create" || ast.keyword !== "table") continue
    const tableInfo = ast.table as Array<{ table: string }> | undefined
    if (!tableInfo || tableInfo.length === 0) continue
    const tableName = tableInfo[0].table

    const defs = ast.create_definitions as Array<Record<string, unknown>> | undefined
    if (!defs) continue

    const columnDefs = defs.filter((d) => d.resource === "column")
    const pkConstraintCols = new Set<string>()
    for (const d of defs) {
      if (d.constraint_type === "primary key" && Array.isArray(d.definition)) {
        for (const col of d.definition as Array<Record<string, unknown>>) {
          if (typeof col.column === "string") pkConstraintCols.add(col.column)
        }
      }
    }

    const columns: Column[] = []
    for (const colDef of columnDefs) {
      const colRef = colDef.column as Record<string, unknown> | undefined
      const colName = typeof colRef?.column === "string" ? colRef.column : ""
      const defObj = colDef.definition as Record<string, unknown> | undefined
      const dataType = typeof defObj?.dataType === "string" ? defObj.dataType : "VARCHAR"
      const isNullable = colDef.nullable ? (colDef.nullable as Record<string, unknown>).type !== "not null" : !pkConstraintCols.has(colName)
      const isPK = colDef.primary_key != null || pkConstraintCols.has(colName)
      const isAutoInc = colDef.auto_increment != null
      const defaultVal = extractDefaultValue(colDef.default_val)
      columns.push({
        name: colName,
        type: dataType.toUpperCase(),
        nullable: isNullable,
        defaultValue: defaultVal,
        primaryKey: isPK,
        autoIncrement: isAutoInc,
      })
    }

    if (columns.length > 0) tables.push({ name: tableName, columns })
  }

  if (tables.length === 0) throw new Error("No valid CREATE TABLE statement found")
  return tables
}

const EXAMPLE_SQL = `CREATE TABLE user_order (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  age INT NOT NULL DEFAULT 0,
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL,
  avatar BLOB
);`

function generateJava(table: Table, options: GenOptions): string {
  const cls = toPascalCase(table.name)
  const lines: string[] = []
  if (options.jpa) {
    lines.push("@Entity")
    lines.push(`@Table(name = "${table.name}")`)
  }
  lines.push(`public class ${cls} {`)
  for (const col of table.columns) {
    const javaType = mapType(col.type, SQL_TO_JAVA)
    const fieldName = toCamelCase(col.name)
    lines.push("")
    if (options.jpa) {
      if (col.primaryKey && col.autoIncrement) {
        lines.push("    @Id")
        lines.push("    @GeneratedValue(strategy = GenerationType.IDENTITY)")
      } else if (col.primaryKey) {
        lines.push("    @Id")
      } else {
        lines.push(`    @Column(name = "${col.name}")`)
      }
    }
    if (options.lombok) {
      lines.push("    @Getter @Setter")
    }
    lines.push(`    private ${javaType} ${fieldName};`)
  }
  lines.push("")
  if (!options.lombok) {
    for (const col of table.columns) {
      const fieldName = toCamelCase(col.name)
      const javaType = mapType(col.type, SQL_TO_JAVA)
      lines.push(`    public ${javaType} get${toPascalCase(col.name)}() {`)
      lines.push(`        return ${fieldName};`)
      lines.push("    }")
      lines.push(`    public void set${toPascalCase(col.name)}(${javaType} ${fieldName}) {`)
      lines.push(`        this.${fieldName} = ${fieldName};`)
      lines.push("    }")
    }
  }
  lines.push("}")
  return lines.join("\n")
}

function generateKotlin(table: Table, options: GenOptions): string {
  const cls = toPascalCase(table.name)
  const lines: string[] = []
  if (options.jpa) {
    lines.push("@Entity")
    lines.push(`@Table(name = "${table.name}")`)
  }
  const props = table.columns.map((col) => {
    const kotlinType = mapType(col.type, SQL_TO_KOTLIN)
    const nullable = col.nullable && !col.primaryKey ? "?" : ""
    const fieldName = toCamelCase(col.name)
    let annotations = ""
    if (options.jpa) {
      if (col.primaryKey && col.autoIncrement) {
        annotations = "@Id @GeneratedValue(strategy = GenerationType.IDENTITY) "
      } else if (col.primaryKey) {
        annotations = "@Id "
      }
    }
    return `    ${annotations}val ${fieldName}: ${kotlinType}${nullable}`
  })
  lines.push(`data class ${cls}(`)
  lines.push(props.join(",\n"))
  lines.push(")")
  return lines.join("\n")
}

function generateTypeScript(table: Table): string {
  const iface = toPascalCase(table.name)
  const lines: string[] = []
  lines.push(`export interface ${iface} {`)
  for (const col of table.columns) {
    const tsType = mapType(col.type, SQL_TO_TS)
    const optional = col.nullable ? "?" : ""
    const fieldName = toCamelCase(col.name)
    lines.push(`  ${fieldName}${optional}: ${tsType}`)
  }
  lines.push("}")
  return lines.join("\n")
}

function generateCSharp(table: Table, options: GenOptions): string {
  const cls = toPascalCase(table.name)
  const lines: string[] = []
  if (options.jpa) {
    lines.push(`[Table("${table.name}")]`)
  }
  lines.push(`public class ${cls}`)
  lines.push("{")
  for (const col of table.columns) {
    const csType = mapType(col.type, SQL_TO_CSHARP)
    const nullable = col.nullable && !col.primaryKey ? "?" : ""
    const pascal = toPascalCase(col.name)
    if (options.jpa) {
      if (col.primaryKey && col.autoIncrement) {
        lines.push("    [Key]")
        lines.push("    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]")
      } else if (col.primaryKey) {
        lines.push("    [Key]")
      } else {
        lines.push(`    [Column("${col.name}")]`)
      }
    }
    lines.push(`    public ${csType}${nullable} ${pascal} { get; set; }`)
  }
  lines.push("}")
  return lines.join("\n")
}

function generatePython(table: Table): string {
  const cls = toPascalCase(table.name)
  const lines: string[] = []
  lines.push("from dataclasses import dataclass")
  lines.push("from datetime import date, datetime, time")
  lines.push("from decimal import Decimal")
  lines.push("from uuid import UUID")
  lines.push("")
  lines.push("@dataclass")
  lines.push(`class ${cls}:`)
  for (const col of table.columns) {
    const pyType = mapType(col.type, SQL_TO_PYTHON)
    const fieldName = toSnakeCase(col.name)
    if (col.nullable && !col.primaryKey) {
      lines.push(`    ${fieldName}: Optional[${pyType}] = None`)
    } else {
      lines.push(`    ${fieldName}: ${pyType}`)
    }
  }
  return lines.join("\n")
}

function generateGo(table: Table): string {
  const struct = toPascalCase(table.name)
  const lines: string[] = []
  lines.push(`type ${struct} struct {`)
  const maxWidth = Math.max(...table.columns.map((c) => toPascalCase(c.name).length + 1))
  for (const col of table.columns) {
    const goType = mapType(col.type, SQL_TO_GO)
    const fieldName = toPascalCase(col.name)
    const padding = " ".repeat(Math.max(1, maxWidth - fieldName.length))
    const dbTag = `db:"${col.name}"`
    lines.push(`\t${fieldName}${padding}${goType}    \`${dbTag}\``)
  }
  lines.push("}")
  return lines.join("\n")
}

type GenOptions = { jpa: boolean; lombok: boolean }

function generate(tables: Table[], lang: Lang, options: GenOptions): string {
  return tables.map((t) => {
    switch (lang) {
      case "java": return generateJava(t, options)
      case "kotlin": return generateKotlin(t, options)
      case "typescript": return generateTypeScript(t)
      case "csharp": return generateCSharp(t, options)
      case "python": return generatePython(t)
      case "go": return generateGo(t)
    }
  }).join("\n\n")
}

const LANGUAGES: { value: Lang; label: string }[] = [
  { value: "java", label: "Java" },
  { value: "kotlin", label: "Kotlin" },
  { value: "typescript", label: "TypeScript" },
  { value: "csharp", label: "C#" },
  { value: "python", label: "Python" },
  { value: "go", label: "Go" },
]

const LANG_HAS_JPA: Set<Lang> = new Set(["java", "kotlin", "csharp"])
const LANG_HAS_LOMBOK: Set<Lang> = new Set(["java"])

export function SqlToEntity() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [lang, setLang] = useState<Lang>("java")
  const [jpa, setJpa] = useState(true)
  const [lombok, setLombok] = useState(true)
  const [copied, handleCopy] = useCopyToClipboard()

  const handleConvert = () => {
    if (!input.trim()) return
    try {
      const tables = parseSql(input)
      const result = generate(tables, lang, { jpa, lombok })
      setOutput(result)
      setError("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse SQL")
      setOutput("")
    }
  }

  const handleClear = () => {
    setInput("")
    setOutput("")
    setError("")
  }

  const loadExample = () => {
    setInput(EXAMPLE_SQL)
    setOutput("")
    setError("")
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 max-w-4xl">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Language</label>
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            {LANG_HAS_JPA.has(lang) && (
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={jpa}
                  onChange={(e) => setJpa(e.target.checked)}
                  className="rounded border-input"
                />
                {lang === "csharp" ? "EF Annotations" : "JPA Annotations"}
              </label>
            )}
            {LANG_HAS_LOMBOK.has(lang) && jpa && (
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={lombok}
                  onChange={(e) => setLombok(e.target.checked)}
                  className="rounded border-input"
                />
                Lombok
              </label>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">SQL (CREATE TABLE)</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste CREATE TABLE SQL here..."
                className="min-h-[300px]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">{LANGUAGES.find((l) => l.value === lang)?.label} Entity</label>
              <ReadOnlyTextarea value={output} placeholder="Generated entity class will appear here..." className="min-h-[300px]" />
            </div>
          </div>

          {error && <ErrorBanner message={error} />}

          <div className="flex gap-2">
            <Button className="cursor-pointer" onClick={handleConvert}>Convert</Button>
            <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(output)} disabled={!output}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy Output"}
            </Button>
            <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={loadExample}>
              Load Example
            </Button>
            <Button variant="ghost" className="gap-1.5 cursor-pointer" onClick={handleClear}>
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}