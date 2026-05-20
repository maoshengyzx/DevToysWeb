import type { ReactNode } from "react"
import type { ElementType } from "react"
import {
  ArrowLeftRight, Hash, Code2, FileText, Binary, Lock, AlignLeft,
  Boxes, Shield, Type, Search, Palette, TextCursorInput,
  KeyRound, FileDiff, Dice5, Clock, Pipette,
} from "lucide-react"

import { NumberBaseConverter } from "./converters/NumberBaseConverter"
import { JsonYamlConverter } from "./converters/JsonYamlConverter"
import { HtmlEncoder } from "./encoders/HtmlEncoder"
import { UrlEncoder } from "./encoders/UrlEncoder"
import { Base64Encoder } from "./encoders/Base64Encoder"
import { JsonFormatter } from "./formatters/JsonFormatter"
import { SqlFormatter } from "./formatters/SqlFormatter"
import { XmlFormatter } from "./formatters/XmlFormatter"
import { UuidGenerator } from "./generators/UuidGenerator"
import { LoremIpsumGenerator } from "./generators/LoremIpsumGenerator"
import { HashGenerator } from "./generators/HashGenerator"
import { CaseConverter } from "./text/CaseConverter"
import { RegexTester } from "./text/RegexTester"
import { MarkdownPreview } from "./text/MarkdownPreview"
import { JwtDecoder } from "./extras/JwtDecoder"
import { TextDiff } from "./extras/TextDiff"
import { PasswordGenerator } from "./extras/PasswordGenerator"
import { CronParser } from "./extras/CronParser"
import { ColorConverter } from "./extras/ColorConverter"

export interface ToolDefinition {
  id: string
  label: string
  description: string
  icon: ElementType
  component: () => ReactNode
}

export interface ToolCategory {
  title: string
  icon: ElementType
  tools: ToolDefinition[]
}

export const toolCategories: ToolCategory[] = [
  {
    title: "Converters",
    icon: ArrowLeftRight,
    tools: [
      { id: "number-base", label: "Number Base Converter", description: "Convert numbers between binary, octal, decimal, and hexadecimal", icon: Hash, component: NumberBaseConverter },
      { id: "json-yaml", label: "JSON ↔ YAML", description: "Convert between JSON and YAML formats", icon: ArrowLeftRight, component: JsonYamlConverter },
    ],
  },
  {
    title: "Encoders / Decoders",
    icon: Lock,
    tools: [
      { id: "html-encode", label: "HTML Encode/Decode", description: "Encode and decode HTML entities", icon: Code2, component: HtmlEncoder },
      { id: "url-encode", label: "URL Encode/Decode", description: "Encode and decode URL components", icon: Binary, component: UrlEncoder },
      { id: "base64", label: "Base64 Encode/Decode", description: "Encode and decode Base64 strings", icon: FileText, component: Base64Encoder },
      { id: "jwt-decode", label: "JWT Decoder", description: "Decode and inspect JSON Web Tokens", icon: KeyRound, component: JwtDecoder },
    ],
  },
  {
    title: "Formatters",
    icon: AlignLeft,
    tools: [
      { id: "json-formatter", label: "JSON Formatter", description: "Format, minify, and validate JSON", icon: Binary, component: JsonFormatter },
      { id: "sql-formatter", label: "SQL Formatter", description: "Format and beautify SQL statements", icon: Code2, component: SqlFormatter },
      { id: "xml-formatter", label: "XML Formatter", description: "Format and minify XML documents", icon: FileText, component: XmlFormatter },
    ],
  },
  {
    title: "Generators",
    icon: Boxes,
    tools: [
      { id: "uuid-generator", label: "UUID Generator", description: "Generate random UUIDs (v4)", icon: Hash, component: UuidGenerator },
      { id: "lorem-ipsum", label: "Lorem Ipsum Generator", description: "Generate placeholder text", icon: Type, component: LoremIpsumGenerator },
      { id: "hash-generator", label: "Hash Generator", description: "Generate SHA-1, SHA-256, SHA-384, SHA-512 hashes", icon: Shield, component: HashGenerator },
      { id: "password-generator", label: "Password Generator", description: "Generate secure random passwords", icon: Dice5, component: PasswordGenerator },
    ],
  },
  {
    title: "Text",
    icon: TextCursorInput,
    tools: [
      { id: "case-converter", label: "Case Converter", description: "Convert text between camelCase, snake_case, kebab-case, etc.", icon: Type, component: CaseConverter },
      { id: "regex-tester", label: "Regex Tester", description: "Test regular expressions with real-time matching", icon: Search, component: RegexTester },
      { id: "markdown-preview", label: "Markdown Preview", description: "Preview Markdown rendered as HTML", icon: Palette, component: MarkdownPreview },
      { id: "text-diff", label: "Text Diff", description: "Compare two texts and highlight differences", icon: FileDiff, component: TextDiff },
    ],
  },
  {
    title: "More Tools",
    icon: Clock,
    tools: [
      { id: "cron-parser", label: "Cron Parser", description: "Parse and explain cron expressions", icon: Clock, component: CronParser },
      { id: "color-converter", label: "Color Converter", description: "Convert colors between HEX, RGB, HSL", icon: Pipette, component: ColorConverter },
    ],
  },
]

export const allTools = toolCategories.flatMap((c) => c.tools)

export function getToolById(id: string): ToolDefinition | undefined {
  return allTools.find((t) => t.id === id)
}