import path from "path"
import { readFileSync, writeFileSync } from "fs"
import { resolve } from "path"
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"
import { getSeoMeta } from "./src/lib/seo"

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
      const today = new Date().toISOString().split("T")[0]
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${toolIds.map((id) => `  <url>
    <loc>${baseUrl}/${id}</loc>
    <lastmod>${today}</lastmod>
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

function prerenderPlugin(): Plugin {
  return {
    name: "prerender-generator",
    closeBundle() {
      const outDir = "dist"
      const distDir = resolve(process.cwd(), outDir)
      let indexHtml = readFileSync(resolve(distDir, "index.html"), "utf-8")

      // 1. Enrich homepage meta description with key tools so Google picks up more keywords
      const betterHomeDesc =
        "Free online developer tools: Base64, JSON formatter, QR code, regex tester, image compressor, JWT decoder, color converter, and 35+ more. No installation required."
      indexHtml = indexHtml.replace(
        /<meta name="description" content="[^"]*"\s*\/>/,
        `<meta name="description" content="${betterHomeDesc}" />`
      )
      indexHtml = indexHtml.replace(
        /<meta property="og:description" content="[^"]*"\s*\/>/,
        `<meta property="og:description" content="${betterHomeDesc}" />`
      )
      indexHtml = indexHtml.replace(
        /<meta name="twitter:description" content="[^"]*"\s*\/>/,
        `<meta name="twitter:description" content="${betterHomeDesc}" />`
      )

      // Inject homepage JSON-LD (WebSite schema)
      const homeLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "DevToysWeb",
        url: baseUrl,
        description: betterHomeDesc,
      })
      if (!indexHtml.includes("application/ld+json")) {
        indexHtml = indexHtml.replace(
          "</head>",
          `    <script type="application/ld+json">${homeLd}</script>\n  </head>`
        )
      }
      writeFileSync(resolve(distDir, "index.html"), indexHtml, "utf-8")

      // 2. Generate a static HTML file for every tool so Google can crawl each URL independently.
      //    Cloudflare Pages Pretty URLs will serve /base64.html when the browser requests /base64.
      const stripLdRegex = /<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/

      for (const toolId of toolIds) {
        const meta = getSeoMeta(toolId)
        if (!meta) continue

        const toolUrl = `${baseUrl}/${toolId}`
        let toolHtml = indexHtml

        // Remove homepage JSON-LD so each tool only has its own schema
        toolHtml = toolHtml.replace(stripLdRegex, "")

        // Title
        toolHtml = toolHtml.replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`)

        // Meta description
        toolHtml = toolHtml.replace(
          /<meta name="description" content="[^"]*"\s*\/>/,
          `<meta name="description" content="${meta.description}" />`
        )

        // Keywords
        if (toolHtml.includes('name="keywords"')) {
          toolHtml = toolHtml.replace(
            /<meta name="keywords" content="[^"]*"\s*\/>/,
            `<meta name="keywords" content="${meta.keywords}" />`
          )
        } else {
          toolHtml = toolHtml.replace(
            /<meta name="description"/,
            `<meta name="keywords" content="${meta.keywords}" />\n    <meta name="description"`
          )
        }

        // Canonical
        toolHtml = toolHtml.replace(
          /<link rel="canonical" href="[^"]*"\s*\/>/,
          `<link rel="canonical" href="${toolUrl}" />`
        )

        // Open Graph
        toolHtml = toolHtml.replace(
          /<meta property="og:title" content="[^"]*"\s*\/>/,
          `<meta property="og:title" content="${meta.title}" />`
        )
        toolHtml = toolHtml.replace(
          /<meta property="og:description" content="[^"]*"\s*\/>/,
          `<meta property="og:description" content="${meta.description}" />`
        )
        toolHtml = toolHtml.replace(
          /<meta property="og:url" content="[^"]*"\s*\/>/,
          `<meta property="og:url" content="${toolUrl}" />`
        )

        // Twitter
        toolHtml = toolHtml.replace(
          /<meta name="twitter:title" content="[^"]*"\s*\/>/,
          `<meta name="twitter:title" content="${meta.title}" />`
        )
        toolHtml = toolHtml.replace(
          /<meta name="twitter:description" content="[^"]*"\s*\/>/,
          `<meta name="twitter:description" content="${meta.description}" />`
        )

        // WebApplication JSON-LD
        const appLd = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: meta.title,
          description: meta.description,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "All",
          url: toolUrl,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        })
        toolHtml = toolHtml.replace(
          "</head>",
          `    <script type="application/ld+json">${appLd}</script>\n  </head>`
        )

        writeFileSync(resolve(distDir, `${toolId}.html`), toolHtml, "utf-8")
      }

      console.log(`[prerender] Generated ${toolIds.length} tool HTML files in dist/`)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), sitemapPlugin(), prerenderPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
  },
})
