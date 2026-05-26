import path from "path"
import { readFileSync, writeFileSync } from "fs"
import { resolve } from "path"
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"
import { getSeoMeta, getHomepageSeoMeta } from "./src/lib/seo"

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

const toolCategoryMap: Record<string, string> = {
  "number-base": "Converters", "json-yaml": "Converters", "json-to-typescript": "Converters", "unit-converter": "Converters", "sql-to-entity": "Converters", "csv-to-json": "Converters",
  "html-encode": "Encoders / Decoders", "url-encode": "Encoders / Decoders", "base64": "Encoders / Decoders", "jwt-decode": "Encoders / Decoders",
  "json-formatter": "Formatters", "json-diff": "Formatters", "sql-formatter": "Formatters", "xml-formatter": "Formatters", "html-css-js-formatter": "Formatters",
  "uuid-generator": "Generators", "lorem-ipsum": "Generators", "hash-generator": "Generators", "password-generator": "Generators",
  "case-converter": "Text", "regex-tester": "Text", "markdown-preview": "Text", "text-diff": "Text", "text-dedup": "Text", "word-count": "Text",
  "qr-code": "Media", "image-compressor": "Media", "svg-converter": "Media", "ico-generator": "Media", "image-editor": "Media",
  "api-request": "Network", "http-status": "Network",
  "website-speed": "Web", "seo-meta": "Web", "robots-txt": "Web",
  "cron-parser": "More Tools", "color-converter": "More Tools", "timestamp-converter": "More Tools",
}

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
      const indexHtml = readFileSync(resolve(distDir, "index.html"), "utf-8")

      // Homepage already has good meta tags in index.html — just ensure JSON-LD is there
      const homeMeta = getHomepageSeoMeta()
      const homeLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "DevToysWeb",
        url: baseUrl,
        description: homeMeta.description,
      })
      let homeHtml = indexHtml
      if (!homeHtml.includes("application/ld+json")) {
        homeHtml = homeHtml.replace(
          "</head>",
          `    <script type="application/ld+json">${homeLd}</script>\n  </head>`
        )
        writeFileSync(resolve(distDir, "index.html"), homeHtml, "utf-8")
      }

      const redirects: string[] = []
      redirects.push("/sitemap.xml  /sitemap.xml  200")
      redirects.push("/robots.txt  /robots.txt  200")

      for (const id of toolIds) {
        const seo = getSeoMeta(id)
        if (!seo) continue

        const pageUrl = `${baseUrl}/${id}`
        const category = toolCategoryMap[id] ?? "Tools"
        const appLd = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: seo.title.replace(" - DevToysWeb", ""),
          description: seo.description,
          url: pageUrl,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "All",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        })
        const breadcrumbLd = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: baseUrl + "/" },
            { "@type": "ListItem", position: 2, name: category, item: baseUrl + "/" },
            { "@type": "ListItem", position: 3, name: seo.title.replace(" - DevToysWeb", ""), item: pageUrl },
          ],
        })

        let html = indexHtml
        html = html.replace(/<title>.*?<\/title>/, `<title>${seo.title}</title>`)
        html = html.replace(/<meta name="description" content=".*?"/, `<meta name="description" content="${seo.description}"`)
        html = html.replace(/<meta name="keywords" content=".*?"/, `<meta name="keywords" content="${seo.keywords}"`)
        html = html.replace(/<link rel="canonical" href=".*?"/, `<link rel="canonical" href="${pageUrl}"`)
        html = html.replace(/<meta property="og:title" content=".*?"/, `<meta property="og:title" content="${seo.title}"`)
        html = html.replace(/<meta property="og:description" content=".*?"/, `<meta property="og:description" content="${seo.description}"`)
        html = html.replace(/<meta property="og:url" content=".*?"/, `<meta property="og:url" content="${pageUrl}"`)
        html = html.replace(/<meta name="twitter:title" content=".*?"/, `<meta name="twitter:title" content="${seo.title}"`)
        html = html.replace(/<meta name="twitter:description" content=".*?"/, `<meta name="twitter:description" content="${seo.description}"`)

        // Replace or insert JSON-LD (WebApplication), then append BreadcrumbList
        if (html.includes("application/ld+json")) {
          html = html.replace(/<script type="application\/ld\+json">.*?<\/script>/s, `<script type="application/ld+json">${appLd}</script>`)
        } else {
          html = html.replace(
            "</head>",
            `    <script type="application/ld+json">${appLd}</script>\n  </head>`
          )
        }

        html = html.replace(
          "</head>",
          `    <script type="application/ld+json">${breadcrumbLd}</script>\n  </head>`
        )

        writeFileSync(resolve(distDir, `${id}.html`), html, "utf-8")
        redirects.push(`/${id}  /${id}.html  200`)
      }

      redirects.push("/*  /index.html  200")
      writeFileSync(resolve(distDir, "_redirects"), redirects.join("\n") + "\n", "utf-8")
      console.log("[prerender] Generated", toolIds.length, "static HTML pages and updated _redirects")
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
