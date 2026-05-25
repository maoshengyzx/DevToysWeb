import path from "path"
import { writeFileSync } from "fs"
import { resolve } from "path"
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

const baseUrl = "https://devtoysweb.cn"

const toolIds = [
  "number-base", "json-yaml", "json-to-typescript", "unit-converter", "sql-to-entity", "csv-to-json",
  "html-encode", "url-encode", "base64", "jwt-decode",
  "json-formatter", "json-diff", "sql-formatter", "xml-formatter", "html-css-js-formatter",
  "uuid-generator", "lorem-ipsum", "hash-generator", "password-generator",
  "case-converter", "regex-tester", "markdown-preview", "text-diff", "text-dedup", "word-count",
  "qr-code", "image-compressor", "svg-converter", "ico-generator", "image-editor",
  "api-request", "http-status",
  "website-speed", "seo-meta", "robots-txt",
  "cron-parser", "color-converter", "timestamp-converter",
]

function sitemapPlugin(): Plugin {
  return {
    name: "sitemap-generator",
    closeBundle() {
      const outDir = "dist"
      const distDir = resolve(process.cwd(), outDir)
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${toolIds.map((id) => `  <url>
    <loc>${baseUrl}/${id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join("\n")}
</urlset>
`
      writeFileSync(resolve(distDir, "sitemap.xml"), sitemap, "utf-8")
      console.log("[sitemap] Generated sitemap.xml with", toolIds.length + 1, "entries")
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), sitemapPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
  },
})
