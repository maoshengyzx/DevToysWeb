# DevToysWeb SEO 部署与监控清单

部署到 Cloudflare Pages 后，按以下步骤操作以确保 Google 正确收录和索引。

> **注意**：本项目采用 SPA（单页应用）模式，所有路由通过 `/* /index.html 200` 由 React Router 客户端接管。因此 Googlebot 需要执行 JavaScript 才能看到每个工具页面的 `<title>`、`<meta>` 和 JSON-LD。虽然 `react-helmet-async` 在运行时动态注入这些标签，但 Google 的抓取预算（crawl budget）可能因此受限。如果你希望获得更好的 SEO 效果（让 Google 在首次抓取时就看到完整 HTML），可以考虑将来迁移到预渲染方案。

---

## 1. 验证 Google Search Console 所有权

访问 [Google Search Console](https://search.google.com/search-console) 并添加属性：

**方式 A（推荐）：DNS 验证**
1. 选择属性类型：**网域**（Domain）→ 输入 `devtoysweb.cn`
2. 复制 Google 提供的 **TXT 记录**
3. 在 Cloudflare DNS 中添加一条 TXT 记录，值为 Google 提供的内容
4. 回到 Search Console 点击验证

**方式 B（备用）：HTML 文件验证**
1. 选择属性类型：**网址前缀**（URL prefix）→ 输入 `https://devtoysweb.cn`
2. 下载 Google 提供的 HTML 验证文件
3. 将文件放入 `public/` 目录
4. 重新构建并部署
5. 回到 Search Console 点击验证

> 注意：`public/google-site-verification.html`（或对应文件）需要在 `_redirects` 中 **不被** `/* /index.html 200` 拦截。当前 `_redirects` 中静态文件规则在 catch-all 之前，因此应该没问题。

---

## 2. 提交 Sitemap

验证完成后，进入 Search Console → **Sitemaps**：

1. 在 "添加新的站点地图" 中输入：`sitemap.xml`
2. 点击提交
3. 等待状态变为 "成功"（通常几分钟内）

**验证 sitemap 可访问性**：
```bash
curl -I https://devtoysweb.cn/sitemap.xml
# 应返回 HTTP 200 + Content-Type: application/xml
```

如果返回 `Content-Type: text/html`，说明 `_redirects` 配置有问题，请检查 `/sitemap.xml /sitemap.xml 200` 规则是否在 `/*` catch-all **之前**。

---

## 3. 检查 Coverage（收录情况）

进入 Search Console → **Coverage（网页）**：

### 期望看到
- **已收录**（Valid）：39 个页面（首页 + 38 个工具页）
- 等待 1~7 天 Google 完成抓取和索引

### 常见问题排查

| 状态 | 含义 | 排查方式 |
|---|---|---|
| Excluded → "Duplicate without user-selected canonical" | Google 认为页面重复 | 检查预渲染 HTML 中 `<link rel="canonical">` 是否正确指向自身 URL |
| Excluded → "Crawled — currently not indexed" | Google 抓取了但决定不索引 | 检查页面内容是否足够丰富（Thin Content）→ 当前已通过 `ToolInfoPanel` 丰富内容 |
| Excluded → "Discovered — currently not indexed" | Google 知道页面存在但还没抓取 | 通常是因为 crawl budget 不足，等待即可 |
| Error → "Soft 404" | 页面返回 200 但内容显示 404 | 检查 `404.html` 是否被正确配置 |

---

## 4. 检查 Core Web Vitals

进入 Search Console → **Experience → Core Web Vitals**：

### 重点关注指标

| 指标 | 目标值 | 当前状态（估算） |
|---|---|---|
| **LCP** (Largest Contentful Paint) | < 2.5s | 代码分割后预计 1.5~2.0s |
| **INP** (Interaction to Next Paint) | < 200ms | 取决于具体工具交互 |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 通常良好（固定布局） |

### 优化建议
- 如果 LCP 不达标：检查 `og-image.png` 是否已生成并部署（1200×630，< 200KB）
- 如果 INP 不达标：检查大型输入工具是否使用了 Web Worker 或防抖
- 使用 [PageSpeed Insights](https://pagespeed.web.dev/) 测试具体工具页（如 `/base64`）

---

## 5. 检查 Rich Results（富文本摘要）

进入 [Rich Results Test](https://search.google.com/test/rich-results)：

1. 输入任意工具页 URL，如 `https://devtoysweb.cn/base64`
2. 检查是否检测到以下结构化数据：
   - ✅ **WebApplication** schema
   - ✅ **BreadcrumbList** schema
   - ✅ **FAQPage** schema（在 ToolInfoPanel 中）

如果未检测到，检查预渲染 HTML 中是否包含对应的 `<script type="application/ld+json">`。

---

## 6. 检查 Mobile Usability

进入 Search Console → **Experience → Mobile Usability**：

确保没有以下错误：
- Text too small to read
- Clickable elements too close together
- Content wider than screen

当前设计已针对移动端优化（侧边栏自动折叠为抽屉），但仍需验证。

---

## 7. 定期监控清单（每周/每月）

### 每周检查
- [ ] Search Console → Performance：查看点击量和展示量趋势
- [ ] Search Console → Coverage：确认没有新的错误页面
- [ ] PageSpeed Insights：抽查 3~5 个热门工具页

### 每月检查
- [ ] 检查是否有新的 "Excluded" 页面并排查原因
- [ ] 对比上月流量，识别增长/下降明显的工具页
- [ ] 更新热门工具的 `ToolInfoPanel` 内容（如有新 FAQ 或使用场景）
- [ ] 确认 sitemap 中的 `<lastmod>` 日期是否更新（每次构建自动更新）

---

## 8. Bing Webmaster Tools（可选但推荐）

访问 [Bing Webmaster Tools](https://www.bing.com/webmasters) 并添加网站：
1. 使用 Google Search Console 账户快速导入
2. 提交 sitemap：`https://devtoysweb.cn/sitemap.xml`
3. Bing 通常比 Google 更快索引新页面

---

## 9. 技术验证命令

部署后运行以下命令验证关键文件：

```bash
# 验证 sitemap
curl -s https://devtoysweb.cn/sitemap.xml | head -5

# 验证 robots.txt
curl -s https://devtoysweb.cn/robots.txt

# 验证预渲染 HTML 的 SEO 标签
curl -s https://devtoysweb.cn/base64 | grep -E "<title>|<meta name=\"description\"

# 验证 JSON-LD
curl -s https://devtoysweb.cn/base64 | grep "application/ld+json"

# 验证 _redirects 没有拦截静态文件
curl -I https://devtoysweb.cn/sitemap.xml  # 应返回 200，不是 200 + text/html
curl -I https://devtoysweb.cn/robots.txt   # 同上
```

---

## 10. 后续优化方向

完成以上步骤后，可考虑：

1. **动态 OG 图片**：用 Cloudflare Workers 为每个工具生成带工具名称的 OG 图片（URL: `/og/{toolId}.png`）
2. **字体自托管**：将 Plus Jakarta Sans 下载到 `public/fonts/`，减少第三方请求
3. **Analytics**：添加 Google Analytics 4 或 Cloudflare Web Analytics 监控流量
4. **更多内容**：为热门工具（如 JSON Formatter、Base64、JWT Decoder）撰写更详细的使用指南
