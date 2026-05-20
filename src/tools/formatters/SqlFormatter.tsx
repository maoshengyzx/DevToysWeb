import { Formatter } from "@/tools/FormatterLayout"
import { format as sqlFormat } from "sql-formatter"

export function SqlFormatter() {
  const format = (input: string): string => {
    return sqlFormat(input, { tabWidth: 2 })
  }

  const minify = (input: string): string => {
    return input.replace(/\s+/g, " ").trim()
  }

  return (
    <Formatter
      format={format}
      minify={minify}
      inputPlaceholder="Paste SQL here..."
    />
  )
}