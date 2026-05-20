import { Formatter } from "@/tools/FormatterLayout"

export function JsonFormatter() {
  const format = (input: string, indent: number = 2): string => {
    return JSON.stringify(JSON.parse(input), null, indent)
  }

  const minify = (input: string): string => {
    return JSON.stringify(JSON.parse(input))
  }

  return (
    <Formatter
      format={format}
      minify={minify}
      inputPlaceholder="Paste JSON here..."
      indentOptions={[
        { label: "2 spaces", value: 2 },
        { label: "4 spaces", value: 4 },
        { label: "Tab", value: 1 },
      ]}
    />
  )
}