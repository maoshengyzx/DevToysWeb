import type { ReactNode } from "react"
import type { ElementType } from "react"
import {
  ArrowLeftRight, Hash, Code2, FileText, Binary, Lock, AlignLeft,
  Boxes, Shield, Type, Search, Palette, TextCursorInput,
  KeyRound, FileDiff, Dice5, Clock, Pipette, Globe, Zap,
  Braces, Terminal, FileCode, FileJson, MessageSquare,
  Ruler, Timer, ListFilter, Calculator,
  Image, QrCode, FileImage, PenTool, ImageDown,
  Gauge, FileSearch, SearchCode, Bot, GitCompareArrows,
} from "lucide-react"

import { NumberBaseConverter } from "./converters/NumberBaseConverter"
import { JsonYamlConverter } from "./converters/JsonYamlConverter"
import { JsonToTypeScript } from "./converters/JsonToTypeScript"
import { UnitConverter } from "./converters/UnitConverter"
import { SqlToEntity } from "./converters/SqlToEntity"
import { CsvToJson } from "./converters/CsvToJson"
import { HtmlEncoder } from "./encoders/HtmlEncoder"
import { UrlEncoder } from "./encoders/UrlEncoder"
import { Base64Encoder } from "./encoders/Base64Encoder"
import { JwtDecoder } from "./extras/JwtDecoder"
import { JsonFormatter } from "./formatters/JsonFormatter"
import { JsonDiff } from "./extras/JsonDiff"
import { SqlFormatter } from "./formatters/SqlFormatter"
import { XmlFormatter } from "./formatters/XmlFormatter"
import { HtmlCssJsFormatter } from "./formatters/HtmlCssJsFormatter"
import { UuidGenerator } from "./generators/UuidGenerator"
import { LoremIpsumGenerator } from "./generators/LoremIpsumGenerator"
import { HashGenerator } from "./generators/HashGenerator"
import { PasswordGenerator } from "./extras/PasswordGenerator"
import { CaseConverter } from "./text/CaseConverter"
import { RegexTester } from "./text/RegexTester"
import { MarkdownPreview } from "./text/MarkdownPreview"
import { TextDiff } from "./extras/TextDiff"
import { TextDedup } from "./text/TextDedup"
import { WordCount } from "./text/WordCount"
import { CronParser } from "./extras/CronParser"
import { ColorConverter } from "./extras/ColorConverter"
import { HttpStatusCodeLookup } from "./extras/HttpStatusCodeLookup"
import { ApiRequestDebugger } from "./extras/ApiRequestDebugger"
import { TimestampConverter } from "./extras/TimestampConverter"
import { QrCodeTool } from "./media/QrCodeTool"
import { ImageCompressor } from "./media/ImageCompressor"
import { IcoGenerator } from "./media/IcoGenerator"
import { SvgConverter } from "./media/SvgConverter"
import { ImageEditor } from "./media/ImageEditor"
import { DomainWhoisLookup } from "./web/DomainWhoisLookup"
import { WebsiteSpeedTest } from "./web/WebsiteSpeedTest"
import { SeoMetaAnalyzer } from "./web/SeoMetaAnalyzer"
import { RobotsTxtGenerator } from "./web/RobotsTxtGenerator"

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
      { id: "json-to-typescript", label: "JSON → TypeScript", description: "Convert JSON to TypeScript interfaces", icon: Braces, component: JsonToTypeScript },
      { id: "unit-converter", label: "Unit Converter", description: "Convert length, weight, temperature, area, volume, speed, data units", icon: Ruler, component: UnitConverter },
      { id: "sql-to-entity", label: "SQL → Entity Class", description: "Convert SQL CREATE TABLE to Java, Kotlin, TypeScript, C#, Python, Go entity classes", icon: Code2, component: SqlToEntity },
      { id: "csv-to-json", label: "CSV ↔ JSON", description: "Convert between CSV and JSON array formats", icon: Braces, component: CsvToJson },
    ],
  },
  {
    title: "Encoders / Decoders",
    icon: Lock,
    tools: [
      { id: "html-encode", label: "HTML Encode/Decode", description: "Encode and decode HTML entities", icon: Code2, component: HtmlEncoder },
      { id: "url-encode", label: "URL Encode/Decode", description: "Encode and decode URL components", icon: Binary, component: UrlEncoder },
      { id: "base64", label: "Base64 Encode/Decode", description: "Encode and decode Base64 strings and images", icon: FileText, component: Base64Encoder },
      { id: "jwt-decode", label: "JWT Decoder", description: "Decode, inspect, and verify JSON Web Tokens", icon: KeyRound, component: JwtDecoder },
    ],
  },
  {
    title: "Formatters",
    icon: AlignLeft,
    tools: [
      { id: "json-formatter", label: "JSON Formatter", description: "Format, minify, sort keys, flatten, extract structure, and more", icon: FileJson, component: JsonFormatter },
      { id: "json-diff", label: "JSON Diff", description: "Compare two JSON objects and highlight structural differences", icon: GitCompareArrows, component: JsonDiff },
      { id: "sql-formatter", label: "SQL Formatter", description: "Format and beautify SQL statements", icon: Terminal, component: SqlFormatter },
      { id: "xml-formatter", label: "XML Formatter", description: "Format and minify XML documents", icon: FileText, component: XmlFormatter },
      { id: "html-css-js-formatter", label: "HTML/CSS/JS Formatter", description: "Format, minify, and escape HTML, CSS, JavaScript", icon: FileCode, component: HtmlCssJsFormatter },
    ],
  },
  {
    title: "Generators",
    icon: Boxes,
    tools: [
      { id: "uuid-generator", label: "UUID Generator", description: "Generate random UUIDs (v4)", icon: Hash, component: UuidGenerator },
      { id: "lorem-ipsum", label: "Lorem Ipsum Generator", description: "Generate placeholder text", icon: Type, component: LoremIpsumGenerator },
      { id: "hash-generator", label: "Hash Generator", description: "Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes", icon: Shield, component: HashGenerator },
      { id: "password-generator", label: "Password Generator", description: "Generate secure random passwords", icon: Dice5, component: PasswordGenerator },
    ],
  },
  {
    title: "Text",
    icon: TextCursorInput,
    tools: [
      { id: "case-converter", label: "Case Converter", description: "Convert text between camelCase, snake_case, kebab-case, etc.", icon: Type, component: CaseConverter },
      { id: "regex-tester", label: "Regex Tester", description: "Test regular expressions with real-time matching and pattern library", icon: Search, component: RegexTester },
      { id: "markdown-preview", label: "Markdown Preview", description: "Preview Markdown rendered as HTML, export HTML", icon: Palette, component: MarkdownPreview },
      { id: "text-diff", label: "Text Diff", description: "Compare two texts and highlight differences", icon: FileDiff, component: TextDiff },
      { id: "text-dedup", label: "Text Dedup", description: "Remove duplicate lines from text", icon: ListFilter, component: TextDedup },
      { id: "word-count", label: "Word Count", description: "Count characters, words, lines with Chinese/English support", icon: Calculator, component: WordCount },
    ],
  },
  {
    title: "Media",
    icon: Image,
    tools: [
      { id: "qr-code", label: "QR Code", description: "Generate QR codes or decode QR code from images", icon: QrCode, component: QrCodeTool },
      { id: "image-compressor", label: "Image Compressor", description: "Compress and convert images between formats", icon: ImageDown, component: ImageCompressor },
      { id: "svg-converter", label: "SVG Converter", description: "Convert SVG code to PNG/JPG or extract SVG from images", icon: FileImage, component: SvgConverter },
      { id: "ico-generator", label: "ICO Generator", description: "Convert images to favicon.ico for websites", icon: FileText, component: IcoGenerator },
      { id: "image-editor", label: "Image Editor", description: "Lightweight image editor with filters, crop, and transforms", icon: PenTool, component: ImageEditor },
    ],
  },
  {
    title: "Network",
    icon: Globe,
    tools: [
      { id: "api-request", label: "API Request", description: "Test API endpoints with GET, POST, PUT, DELETE requests", icon: Zap, component: ApiRequestDebugger },
      { id: "http-status", label: "HTTP Status Codes", description: "Quick lookup of HTTP status code meanings", icon: MessageSquare, component: HttpStatusCodeLookup },
    ],
  },
  {
    title: "Web",
    icon: Globe,
    tools: [
      { id: "domain-whois", label: "Domain Whois", description: "Look up domain registration information and registrar details", icon: SearchCode, component: DomainWhoisLookup },
      { id: "website-speed", label: "Website Speed Test", description: "Test website loading time and analyze performance", icon: Gauge, component: WebsiteSpeedTest },
      { id: "seo-meta", label: "SEO Meta Analyzer", description: "Analyze SEO meta tags, Open Graph, and Twitter cards", icon: FileSearch, component: SeoMetaAnalyzer },
      { id: "robots-txt", label: "robots.txt Generator", description: "Generate a properly formatted robots.txt file", icon: Bot, component: RobotsTxtGenerator },
    ],
  },
  {
    title: "More Tools",
    icon: Clock,
    tools: [
      { id: "cron-parser", label: "Cron Parser", description: "Parse and explain cron expressions", icon: Clock, component: CronParser },
      { id: "color-converter", label: "Color Converter", description: "Convert colors between HEX, RGB, HSL", icon: Pipette, component: ColorConverter },
      { id: "timestamp-converter", label: "Timestamp Converter", description: "Convert between Unix timestamp and human-readable date/time", icon: Timer, component: TimestampConverter },
    ],
  },
]

export const allTools = toolCategories.flatMap((c) => c.tools)

export function getToolById(id: string): ToolDefinition | undefined {
  return allTools.find((t) => t.id === id)
}