export interface SeoMeta {
  title: string
  description: string
  keywords: string
  slug: string
}

function buildSeoMeta(label: string, desc: string, slug: string, keywords: string): SeoMeta {
  return {
    title: `${label} - DevToysWeb`,
    description: desc,
    keywords,
    slug,
  }
}

const seoBySlug: Record<string, SeoMeta> = {
  "number-base": buildSeoMeta(
    "Number Base Converter",
    "Convert numbers between binary, octal, decimal, and hexadecimal. Online base converter for developers.",
    "number-base",
    "number base converter, binary octal decimal hex, base conversion, developer tools"
  ),
  "json-yaml": buildSeoMeta(
    "JSON ↔ YAML",
    "Convert between JSON and YAML formats online. Bidirectional JSON YAML converter for developers.",
    "json-yaml",
    "json to yaml, yaml to json, format converter, data serialization"
  ),
  "json-to-typescript": buildSeoMeta(
    "JSON → TypeScript",
    "Convert JSON to TypeScript interfaces and types. Generate TypeScript type definitions from JSON online.",
    "json-to-typescript",
    "json to typescript, generate typescript interfaces, json to ts, type generator"
  ),
  "unit-converter": buildSeoMeta(
    "Unit Converter",
    "Convert length, weight, temperature, area, volume, speed, data units. Free online unit conversion tool.",
    "unit-converter",
    "unit converter, length converter, weight converter, temperature converter, online conversion"
  ),
  "sql-to-entity": buildSeoMeta(
    "SQL → Entity Class",
    "Convert SQL CREATE TABLE to Java, Kotlin, TypeScript, C#, Python, Go entity classes. Generate code from SQL.",
    "sql-to-entity",
    "sql to entity, sql to java, sql to typescript, code generator, ORM entity"
  ),
  "csv-to-json": buildSeoMeta(
    "CSV ↔ JSON",
    "Convert between CSV and JSON array formats online. Bidirectional CSV JSON converter with type inference.",
    "csv-to-json",
    "csv to json, json to csv, data conversion, csv parser, json converter"
  ),
  "html-encode": buildSeoMeta(
    "HTML Encode/Decode",
    "Encode and decode HTML entities online. Convert special characters to HTML entities and back.",
    "html-encode",
    "html encode, html decode, html entities, escape html, unescape html"
  ),
  "url-encode": buildSeoMeta(
    "URL Encode/Decode",
    "Encode and decode URL components online. Percent-encode URLs and query parameters.",
    "url-encode",
    "url encode, url decode, percent encoding, url escape, query string"
  ),
  "base64": buildSeoMeta(
    "Base64 Encode/Decode",
    "Encode and decode Base64 strings, images, and files online. Free online Base64 converter.",
    "base64",
    "base64 encode, base64 decode, base64 image, file to base64, base64 converter"
  ),
  "jwt-decode": buildSeoMeta(
    "JWT Decoder",
    "Decode, inspect, and verify JSON Web Tokens online. View JWT header, payload, and signature.",
    "jwt-decode",
    "jwt decoder, jwt inspector, jwt verify, json web token, token debugger"
  ),
  "json-formatter": buildSeoMeta(
    "JSON Formatter",
    "Format, minify, validate, and analyze JSON online. Sort keys, flatten, tree view, and JSON to Markdown table.",
    "json-formatter",
    "json formatter, json beautifier, json validator, json prettier, online json tool"
  ),
  "json-diff": buildSeoMeta(
    "JSON Diff",
    "Compare two JSON objects and highlight structural differences. Find added, removed, and changed paths.",
    "json-diff",
    "json diff, json compare, json comparison, diff tool, json validator"
  ),
  "sql-formatter": buildSeoMeta(
    "SQL Formatter",
    "Format and beautify SQL statements online. Make SQL queries readable with proper indentation.",
    "sql-formatter",
    "sql formatter, sql beautifier, sql prettier, format sql query, online sql tool"
  ),
  "xml-formatter": buildSeoMeta(
    "XML Formatter",
    "Format and minify XML documents online. Validate and beautify XML with proper indentation.",
    "xml-formatter",
    "xml formatter, xml beautifier, xml prettier, xml minifier, online xml tool"
  ),
  "html-css-js-formatter": buildSeoMeta(
    "HTML/CSS/JS Formatter",
    "Format, minify, escape, and unescape HTML, CSS, and JavaScript code online.",
    "html-css-js-formatter",
    "html formatter, css formatter, javascript formatter, code beautifier, minifier"
  ),
  "uuid-generator": buildSeoMeta(
    "UUID Generator",
    "Generate random UUIDs v4 and v7 online. Create bulk UUIDs with case options.",
    "uuid-generator",
    "uuid generator, guid generator, uuid v4, uuid v7, unique id generator"
  ),
  "lorem-ipsum": buildSeoMeta(
    "Lorem Ipsum Generator",
    "Generate placeholder text in English and Chinese. Create paragraphs, sentences, or words for mockups.",
    "lorem-ipsum",
    "lorem ipsum generator, placeholder text, dummy text, filler text, mockup text"
  ),
  "hash-generator": buildSeoMeta(
    "Hash Generator",
    "Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes online. Real-time hash computation tool.",
    "hash-generator",
    "hash generator, md5, sha256, sha512, hash calculator, online hash"
  ),
  "password-generator": buildSeoMeta(
    "Password Generator",
    "Generate secure random passwords online. Customizable character types and length with strength indicator.",
    "password-generator",
    "password generator, secure password, random password, strong password, password strength"
  ),
  "case-converter": buildSeoMeta(
    "Case Converter",
    "Convert text between camelCase, snake_case, kebab-case, PascalCase, and more. Real-time case conversion.",
    "case-converter",
    "case converter, camel case, snake case, kebab case, text converter"
  ),
  "regex-tester": buildSeoMeta(
    "Regex Tester",
    "Test regular expressions online with real-time matching, flag selection, and common pattern library.",
    "regex-tester",
    "regex tester, regular expression tester, regex online, regex debugger, pattern matching"
  ),
  "markdown-preview": buildSeoMeta(
    "Markdown Preview",
    "Preview Markdown rendered as HTML online. Write and preview Markdown with live rendering and export.",
    "markdown-preview",
    "markdown preview, markdown editor, markdown to html, online markdown, md preview"
  ),
  "text-diff": buildSeoMeta(
    "Text Diff",
    "Compare two texts and highlight differences online. Line, word, and character-level diff with statistics.",
    "text-diff",
    "text diff, diff checker, compare text, text comparison, diff tool"
  ),
  "text-dedup": buildSeoMeta(
    "Text Dedup",
    "Remove duplicate lines from text online. Deduplicate with case-sensitive, case-insensitive, or fuzzy modes.",
    "text-dedup",
    "text dedup, remove duplicates, deduplicate lines, unique lines, text cleaner"
  ),
  "word-count": buildSeoMeta(
    "Word Count",
    "Count characters, words, lines, sentences, and paragraphs online. Chinese and English word counting.",
    "word-count",
    "word counter, character count, word count tool, text statistics, writing tool"
  ),
  "qr-code": buildSeoMeta(
    "QR Code Generator",
    "Generate QR codes or decode QR codes from images online. Customize colors and sizes.",
    "qr-code",
    "qr code generator, qr code decoder, qr creator, barcode generator, online qr"
  ),
  "image-compressor": buildSeoMeta(
    "Image Compressor",
    "Compress and convert images between PNG, JPEG, WebP formats online. Reduce image file size.",
    "image-compressor",
    "image compressor, compress image, image converter, png to jpeg, reduce image size"
  ),
  "svg-converter": buildSeoMeta(
    "SVG Converter",
    "Convert SVG code to PNG, JPEG, WebP images online. Extract SVG code from images.",
    "svg-converter",
    "svg converter, svg to png, svg to image, image to svg, svg extractor"
  ),
  "ico-generator": buildSeoMeta(
    "ICO Generator",
    "Convert images to favicon.ico for websites. Generate multi-size ICO files online.",
    "ico-generator",
    "ico generator, favicon generator, ico converter, favicon maker, website icon"
  ),
  "image-editor": buildSeoMeta(
    "Image Editor",
    "Edit images online with filters, crop, resize, rotate, flip, and format conversion. Free lightweight editor.",
    "image-editor",
    "image editor, photo editor, crop image, resize image, image filters, online editor"
  ),
  "api-request": buildSeoMeta(
    "API Request Debugger",
    "Test API endpoints with GET, POST, PUT, DELETE requests online. Debug REST APIs with custom headers.",
    "api-request",
    "api tester, rest api debugger, http request, api endpoint, api testing tool"
  ),
  "http-status": buildSeoMeta(
    "HTTP Status Codes",
    "Quick lookup of HTTP status code meanings. Browse HTTP status codes by category with descriptions.",
    "http-status",
    "http status codes, status code lookup, http error codes, rest api status, web development"
  ),
  "website-speed": buildSeoMeta(
    "Website Speed Test",
    "Test website loading time and analyze performance online. Check response time, size, and headers.",
    "website-speed",
    "website speed test, site speed, page load time, performance test, web analyzer"
  ),
  "seo-meta": buildSeoMeta(
    "SEO Meta Analyzer",
    "Analyze SEO meta tags, Open Graph, and Twitter cards online. Get SEO score and improvement suggestions.",
    "seo-meta",
    "seo analyzer, meta tag checker, og tag validator, seo audit, website analyzer"
  ),
  "robots-txt": buildSeoMeta(
    "robots.txt Generator",
    "Generate a properly formatted robots.txt file for your website. Customize rules for search engine crawlers.",
    "robots-txt",
    "robots.txt generator, robots txt, seo robots, crawler rules, search engine"
  ),
  "cron-parser": buildSeoMeta(
    "Cron Parser",
    "Parse and explain cron expressions online. Generate cron schedules and see next execution times.",
    "cron-parser",
    "cron parser, cron expression, cron generator, cron schedule, cron job"
  ),
  "color-converter": buildSeoMeta(
    "Color Converter",
    "Convert colors between HEX, RGB, HSL formats online. Color picker and preview included.",
    "color-converter",
    "color converter, hex to rgb, rgb to hex, hsl converter, color picker, color tool"
  ),
  "timestamp-converter": buildSeoMeta(
    "Timestamp Converter",
    "Convert between Unix timestamp and human-readable date/time online. Epoch converter with presets.",
    "timestamp-converter",
    "timestamp converter, unix timestamp, epoch converter, date converter, time tool"
  ),
}

export function getSeoMeta(slug: string): SeoMeta | null {
  return seoBySlug[slug] ?? null
}

export function getHomepageSeoMeta(): SeoMeta {
  return {
    title: "DevToysWeb - Online Developer Tools",
    description: "A collection of online developer tools including converters, encoders, formatters, generators, text tools, media tools, and web utilities. Free, no installation required.",
    keywords: "developer tools, online tools, devtoys, programming tools, web developer utilities",
    slug: "",
  }
}


