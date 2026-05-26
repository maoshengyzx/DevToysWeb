interface ToolContent {
  intro: { en: string; zh: string }
  useCases: { en: string; zh: string }[]
  faq: { q: { en: string; zh: string }; a: { en: string; zh: string } }[]
}

const toolContents: Record<string, ToolContent> = {
  "base64": {
    intro: {
      en: "Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. It is commonly used when there is a need to encode binary data that needs to be stored and transferred over media that are designed to deal with text. This tool supports encoding text, images, and files to Base64, as well as decoding Base64 back to its original form.",
      zh: "Base64 是一种二进制到文本的编码方案，将二进制数据表示为 ASCII 字符串格式。它常用于需要编码二进制数据并在仅支持文本的介质中存储和传输的场景。本工具支持将文本、图片和文件编码为 Base64，以及将 Base64 解码回原始格式。",
    },
    useCases: [
      { en: "Embed images directly in HTML/CSS using data URIs", zh: "在 HTML/CSS 中使用 data URI 直接嵌入图片" },
      { en: "Encode API authentication tokens or credentials", zh: "编码 API 认证令牌或凭据" },
      { en: "Transfer binary data in JSON payloads or URLs", zh: "在 JSON 负载或 URL 中传输二进制数据" },
      { en: "Decode Base64 strings received from APIs or logs", zh: "解码从 API 或日志接收的 Base64 字符串" },
    ],
    faq: [
      { q: { en: "What is Base64 used for?", zh: "Base64 有什么用途？" }, a: { en: "Base64 is used to encode binary data into text so it can be safely transmitted over text-only channels like email, JSON, XML, or URLs.", zh: "Base64 用于将二进制数据编码为文本，以便通过仅支持文本的通道（如电子邮件、JSON、XML 或 URL）安全传输。" } },
      { q: { en: "Does Base64 encryption make data secure?", zh: "Base64 编码能让数据安全吗？" }, a: { en: "No. Base64 is encoding, not encryption. It is easily reversible and should not be used for securing sensitive data.", zh: "不能。Base64 是编码，不是加密。它可以轻易地被还原，不应用于保护敏感数据。" } },
      { q: { en: "Why is my Base64 string longer than the original?", zh: "为什么 Base64 字符串比原始数据长？" }, a: { en: "Base64 expands binary data by approximately 33% because every 3 bytes of binary data are encoded into 4 ASCII characters.", zh: "Base64 将二进制数据扩展约 33%，因为每 3 字节的二进制数据被编码为 4 个 ASCII 字符。" } },
    ],
  },
  "json-formatter": {
    intro: {
      en: "JSON (JavaScript Object Notation) is a lightweight data-interchange format that is easy for humans to read and write and easy for machines to parse and generate. This formatter helps you beautify, minify, validate, sort keys, flatten nested structures, and convert JSON to Markdown tables.",
      zh: "JSON（JavaScript 对象表示法）是一种轻量级的数据交换格式，易于人类阅读和编写，也易于机器解析和生成。本格式化工具可帮助您美化、压缩、验证、排序键名、扁平化嵌套结构，以及将 JSON 转换为 Markdown 表格。",
    },
    useCases: [
      { en: "Pretty-print minified JSON from API responses for debugging", zh: "美化 API 响应中的压缩 JSON 以便调试" },
      { en: "Minify JSON to reduce file size before deployment", zh: "在部署前压缩 JSON 以减小文件大小" },
      { en: "Sort object keys for consistent diffs in version control", zh: "排序对象键名以便在版本控制中产生一致的差异对比" },
      { en: "Flatten nested JSON for import into spreadsheet tools", zh: "扁平化嵌套 JSON 以便导入电子表格工具" },
    ],
    faq: [
      { q: { en: "Does the formatter fix malformed JSON?", zh: "格式化工具能修复格式错误的 JSON 吗？" }, a: { en: "It attempts to auto-fix common issues like trailing commas and unquoted keys, but severely malformed JSON may still fail validation.", zh: "它会尝试自动修复常见问题，如尾随逗号和未加引号的键名，但严重格式错误的 JSON 可能仍然无法通过验证。" } },
      { q: { en: "What does 'flatten' do?", zh: "'扁平化' 功能是什么？" }, a: { en: "Flatten converts nested objects into a single-level object by joining keys with dots (e.g., {user: {name: 'A'}} becomes {'user.name': 'A'}).", zh: "扁平化将嵌套对象转换为单层对象，通过用点号连接键名（例如 {user: {name: 'A'}} 变为 {'user.name': 'A'}）。" } },
      { q: { en: "Is my JSON data sent to a server?", zh: "我的 JSON 数据会被发送到服务器吗？" }, a: { en: "No. All processing happens locally in your browser. Your data never leaves your device.", zh: "不会。所有处理都在您的浏览器本地进行。您的数据永远不会离开您的设备。" } },
    ],
  },
  "uuid-generator": {
    intro: {
      en: "UUID (Universally Unique Identifier) is a 128-bit label used for identifying information in computer systems. UUID v4 is completely random, while UUID v7 is time-ordered and sortable, making it ideal for database primary keys as it improves index locality.",
      zh: "UUID（通用唯一标识符）是一种 128 位标签，用于在计算机系统中标识信息。UUID v4 是完全随机的，而 UUID v7 是按时间排序的，非常适合用作数据库主键，因为它能提高索引的局部性。",
    },
    useCases: [
      { en: "Generate unique IDs for database records or API entities", zh: "为数据库记录或 API 实体生成唯一标识符" },
      { en: "Create session tokens or temporary file names", zh: "创建会话令牌或临时文件名" },
      { en: "Assign unique identifiers in distributed systems without coordination", zh: "在无需协调的情况下为分布式系统分配唯一标识符" },
      { en: "Use UUID v7 for time-sortable database keys with better performance", zh: "使用 UUID v7 作为可时间排序的数据库键以获得更好的性能" },
    ],
    faq: [
      { q: { en: "Will two generated UUIDs ever collide?", zh: "两个生成的 UUID 会重复吗？" }, a: { en: "The probability of a UUID v4 collision is astronomically low (about 1 in 2.71 quintillion). For practical purposes, they can be considered unique.", zh: "UUID v4 碰撞的概率极低（约为 2.71 百万亿的 1/1）。在实际应用中，可以认为它们是唯一的。" } },
      { q: { en: "What is the difference between UUID v4 and v7?", zh: "UUID v4 和 v7 有什么区别？" }, a: { en: "UUID v4 is entirely random. UUID v7 encodes a Unix timestamp in the first 48 bits, making it sortable by time and improving database index performance.", zh: "UUID v4 完全随机。UUID v7 在前 48 位中编码 Unix 时间戳，使其可按时间排序并提高数据库索引性能。" } },
      { q: { en: "Are UUIDs safe to expose publicly?", zh: "UUID 可以公开暴露吗？" }, a: { en: "UUIDs are identifiers, not secrets. They are safe to expose, but you should still protect the actual data they reference with proper authentication.", zh: "UUID 是标识符，不是密钥。暴露它们是安全的，但您仍应使用适当的身份验证来保护它们所引用的实际数据。" } },
    ],
  },
  "regex-tester": {
    intro: {
      en: "Regular expressions (regex) are sequences of characters that define a search pattern. They are incredibly powerful for text processing, validation, extraction, and transformation. This tester provides real-time matching, flag customization, and a library of common patterns to get you started.",
      zh: "正则表达式（regex）是定义搜索模式的字符序列。它们在文本处理、验证、提取和转换方面非常强大。本测试器提供实时匹配、标志定制和常用模式库，帮助您快速上手。",
    },
    useCases: [
      { en: "Validate email addresses, phone numbers, or URLs in forms", zh: "验证表单中的电子邮件地址、电话号码或 URL" },
      { en: "Extract specific data patterns from logs or documents", zh: "从日志或文档中提取特定数据模式" },
      { en: "Find and replace text with advanced pattern matching", zh: "使用高级模式匹配查找和替换文本" },
      { en: "Test regex patterns before using them in production code", zh: "在将正则表达式模式用于生产代码之前进行测试" },
    ],
    faq: [
      { q: { en: "What regex flags are supported?", zh: "支持哪些正则表达式标志？" }, a: { en: "Common flags include: g (global), i (case-insensitive), m (multiline), s (dotAll), and u (unicode). You can combine them as needed.", zh: "常见标志包括：g（全局）、i（不区分大小写）、m（多行）、s（dotAll）和 u（Unicode）。您可以根据需要组合使用。" } },
      { q: { en: "Why is my regex slow?", zh: "为什么我的正则表达式很慢？" }, a: { en: "Complex patterns with nested quantifiers (like (a+)+) can cause catastrophic backtracking. This tool includes step limits to prevent browser freezes.", zh: "带有嵌套量词（如 (a+)+）的复杂模式可能导致灾难性回溯。本工具包含步数限制以防止浏览器冻结。" } },
      { q: { en: "How do I escape special characters?", zh: "如何转义特殊字符？" }, a: { en: "Prefix special characters with a backslash: \\., \\+, \\*, \\?, \\[, etc. Use \\ to match a literal backslash.", zh: "在特殊字符前加反斜杠：\\.、\\+、\\*、\\?、\\[ 等。使用 \\\\ 来匹配字面反斜杠。" } },
    ],
  },
  "password-generator": {
    intro: {
      en: "A strong password is your first line of defense against unauthorized access. This generator creates cryptographically secure random passwords with customizable length and character sets, including a real-time strength indicator to help you choose the most secure option.",
      zh: "强密码是抵御未经授权访问的第一道防线。本生成器创建加密安全的随机密码，可自定义长度和字符集，并包含实时强度指示器，帮助您选择最安全的选项。",
    },
    useCases: [
      { en: "Generate secure passwords for new accounts or password resets", zh: "为新账户或密码重置生成安全密码" },
      { en: "Create strong API keys or database credentials", zh: "创建强 API 密钥或数据库凭据" },
      { en: "Produce random strings for testing or placeholder data", zh: "生成随机字符串用于测试或占位数据" },
      { en: "Ensure passwords meet complexity requirements for enterprise systems", zh: "确保密码满足企业系统的复杂性要求" },
    ],
    faq: [
      { q: { en: "Are the generated passwords truly random?", zh: "生成的密码是真正随机的吗？" }, a: { en: "Yes. They use the browser's cryptographically secure random number generator (crypto.getRandomValues), the same API used for HTTPS.", zh: "是的。它们使用浏览器的加密安全随机数生成器（crypto.getRandomValues），与 HTTPS 使用的 API 相同。" } },
      { q: { en: "What makes a password 'strong'?", zh: "什么使密码变得'强'？" }, a: { en: "Length is the most important factor. A 16-character password with mixed case, numbers, and symbols is vastly harder to crack than a short complex one.", zh: "长度是最重要的因素。一个包含大小写字母、数字和符号的 16 字符密码比短而复杂的密码更难破解。" } },
      { q: { en: "Are generated passwords stored anywhere?", zh: "生成的密码会被存储吗？" }, a: { en: "No. Passwords are generated entirely in your browser and never sent to any server.", zh: "不会。密码完全在您的浏览器中生成，绝不会发送到任何服务器。" } },
    ],
  },
  "jwt-decode": {
    intro: {
      en: "JSON Web Tokens (JWT) are compact, URL-safe means of representing claims between two parties. They consist of three parts: header, payload, and signature. This decoder lets you inspect the contents of a JWT, verify its signature with a secret key, and understand the token's claims.",
      zh: "JSON Web Token（JWT）是一种紧凑、URL 安全的方式，用于在两方之间传递声明。它由三部分组成：头部、负载和签名。本解码器可让您检查 JWT 的内容，使用密钥验证签名，并理解令牌的声明。",
    },
    useCases: [
      { en: "Debug authentication issues by inspecting JWT payload claims", zh: "通过检查 JWT 负载声明来调试身份验证问题" },
      { en: "Verify token signatures during API development and testing", zh: "在 API 开发和测试期间验证令牌签名" },
      { en: "Check token expiration (exp) and issuer (iss) claims", zh: "检查令牌过期时间（exp）和签发者（iss）声明" },
      { en: "Understand the structure of tokens received from identity providers", zh: "了解从身份提供商接收的令牌结构" },
    ],
    faq: [
      { q: { en: "Can I decode a JWT without the secret key?", zh: "没有密钥可以解码 JWT 吗？" }, a: { en: "Yes. The header and payload are Base64Url-encoded and can be read by anyone. Only the signature requires the secret key to verify.", zh: "可以。头部和负载是 Base64Url 编码的，任何人都可以读取。只有签名需要密钥来验证。" } },
      { q: { en: "What signature algorithms are supported?", zh: "支持哪些签名算法？" }, a: { en: "This tool supports HMAC-SHA algorithms: HS256, HS384, and HS512. RSA and ECDSA algorithms are not yet supported for verification.", zh: "本工具支持 HMAC-SHA 算法：HS256、HS384 和 HS512。目前不支持 RSA 和 ECDSA 算法的验证。" } },
      { q: { en: "Is my JWT token sent to a server?", zh: "我的 JWT 令牌会被发送到服务器吗？" }, a: { en: "No. All decoding and verification happens entirely in your browser. Your tokens are never transmitted anywhere.", zh: "不会。所有解码和验证完全在您的浏览器中进行。您的令牌绝不会被传输到任何地方。" } },
    ],
  },
  "hash-generator": {
    intro: {
      en: "Cryptographic hash functions take an input and produce a fixed-size string of characters, which is typically a digest that uniquely represents the original data. This tool computes MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes in real time, entirely in your browser.",
      zh: "加密哈希函数接收输入并生成固定大小的字符串，通常是唯一代表原始数据的摘要。本工具实时计算 MD5、SHA-1、SHA-256、SHA-384 和 SHA-512 哈希值，完全在您的浏览器中进行。",
    },
    useCases: [
      { en: "Verify file integrity by comparing checksums", zh: "通过比较校验和验证文件完整性" },
      { en: "Generate password digests for storage (use bcrypt/argon2 in production)", zh: "生成用于存储的密码摘要（生产环境请使用 bcrypt/argon2）" },
      { en: "Create unique identifiers from arbitrary data", zh: "从任意数据创建唯一标识符" },
      { en: "Detect duplicate content by comparing hashes", zh: "通过比较哈希值检测重复内容" },
    ],
    faq: [
      { q: { en: "What is the difference between MD5 and SHA-256?", zh: "MD5 和 SHA-256 有什么区别？" }, a: { en: "MD5 is faster but cryptographically broken (vulnerable to collisions). SHA-256 is slower but currently considered secure. Use SHA-256 for security-sensitive applications.", zh: "MD5 更快但已被密码学破解（存在碰撞漏洞）。SHA-256 较慢但目前被认为是安全的。在安全敏感的应用中请使用 SHA-256。" } },
      { q: { en: "Can I reverse a hash back to the original text?", zh: "我可以将哈希还原为原始文本吗？" }, a: { en: "No. Hash functions are one-way. You cannot derive the original input from its hash. However, precomputed tables (rainbow tables) may exist for common passwords.", zh: "不能。哈希函数是单向的。您无法从其哈希值推导出原始输入。但对于常见密码，可能存在预计算表（彩虹表）。" } },
      { q: { en: "Why do I get different hashes for the same text with a space?", zh: "为什么带空格的相同文本会得到不同的哈希值？" }, a: { en: "Hash functions are extremely sensitive to input. Even a single space, newline, or invisible character will produce a completely different hash.", zh: "哈希函数对输入极其敏感。即使是一个空格、换行符或不可见字符，也会产生完全不同的哈希值。" } },
    ],
  },
  "markdown-preview": {
    intro: {
      en: "Markdown is a lightweight markup language for creating formatted text using a plain-text editor. It is widely used for documentation, README files, forums, and note-taking. This preview tool renders your Markdown as HTML in real time and allows you to export the result.",
      zh: "Markdown 是一种轻量级标记语言，用于在纯文本编辑器中创建格式化文本。它广泛用于文档、README 文件、论坛和笔记。本预览工具实时将您的 Markdown 渲染为 HTML，并允许您导出结果。",
    },
    useCases: [
      { en: "Preview README.md files before pushing to GitHub", zh: "在推送到 GitHub 之前预览 README.md 文件" },
      { en: "Draft blog posts or documentation with live formatting", zh: "使用实时格式化起草博客文章或文档" },
      { en: "Convert Markdown notes to HTML for email or websites", zh: "将 Markdown 笔记转换为 HTML 用于电子邮件或网站" },
      { en: "Test Markdown syntax and see how it renders", zh: "测试 Markdown 语法并查看渲染效果" },
    ],
    faq: [
      { q: { en: "What Markdown flavor is supported?", zh: "支持哪种 Markdown 风格？" }, a: { en: "This tool supports CommonMark with extensions for tables, task lists, and fenced code blocks. Some GitHub-flavored Markdown features are also supported.", zh: "本工具支持 CommonMark，并扩展了表格、任务列表和围栏代码块。部分 GitHub 风格 Markdown 功能也得到支持。" } },
      { q: { en: "Can I export to formats other than HTML?", zh: "可以导出 HTML 以外的格式吗？" }, a: { en: "Currently, HTML export is supported. You can copy the HTML and paste it into any editor or content management system.", zh: "目前支持 HTML 导出。您可以复制 HTML 并粘贴到任何编辑器或内容管理系统中。" } },
      { q: { en: "Does the preview support syntax highlighting?", zh: "预览支持语法高亮吗？" }, a: { en: "Yes. Code blocks with language identifiers (e.g., ```javascript) will be rendered with syntax highlighting.", zh: "是的。带有语言标识符的代码块（例如 ```javascript）将以语法高亮方式渲染。" } },
    ],
  },
  "qr-code": {
    intro: {
      en: "QR (Quick Response) codes are two-dimensional barcodes that can store URLs, text, contact information, and more. They are readable by smartphones and dedicated QR scanners. This tool lets you generate customizable QR codes and decode QR codes from images.",
      zh: "QR（快速响应）码是一种二维条码，可以存储 URL、文本、联系信息等。它们可被智能手机和专用 QR 扫描器读取。本工具可让您生成可定制的 QR 码并从图片中解码 QR 码。",
    },
    useCases: [
      { en: "Create QR codes for website URLs or payment links", zh: "为网站 URL 或支付链接创建 QR 码" },
      { en: "Generate vCards or Wi-Fi configuration QR codes", zh: "生成 vCard 或 Wi-Fi 配置 QR 码" },
      { en: "Decode QR codes from screenshots or camera photos", zh: "从截图或相机照片中解码 QR 码" },
      { en: "Design branded QR codes with custom colors", zh: "使用自定义颜色设计品牌 QR 码" },
    ],
    faq: [
      { q: { en: "What is the maximum data capacity of a QR code?", zh: "QR 码的最大数据容量是多少？" }, a: { en: "A standard QR code can store up to 7,089 numeric characters, 4,296 alphanumeric characters, or 2,953 bytes of binary data.", zh: "标准 QR 码最多可存储 7,089 个数字字符、4,296 个字母数字字符或 2,953 字节的二进制数据。" } },
      { q: { en: "Can QR codes be decoded from any image?", zh: "可以从任何图片解码 QR 码吗？" }, a: { en: "The image must contain a clearly visible QR code. Very blurry, distorted, or partially occluded codes may fail to decode.", zh: "图片必须包含清晰可见的 QR 码。非常模糊、扭曲或部分遮挡的码可能无法解码。" } },
      { q: { en: "Are generated QR codes permanent?", zh: "生成的 QR 码是永久的吗？" }, a: { en: "QR codes encode data directly. As long as you keep the image, the encoded information is preserved. There is no server or expiration involved.", zh: "QR 码直接编码数据。只要您保留图片，编码的信息就会保留。没有服务器或过期时间。" } },
    ],
  },
}

// Generate default content for tools without specific entries
function getDefaultContent(toolLabel: string, toolDesc: string): ToolContent {
  return {
    intro: {
      en: `${toolLabel} is an online developer tool provided by DevToysWeb. ${toolDesc}. All processing happens locally in your browser — your data never leaves your device.`,
      zh: `${toolLabel} 是 DevToysWeb 提供的在线开发者工具。${toolDesc}。所有处理都在您的浏览器本地进行 — 您的数据绝不会离开您的设备。`,
    },
    useCases: [
      { en: `Use ${toolLabel} to quickly process data during development and debugging`, zh: `使用 ${toolLabel} 在开发和调试期间快速处理数据` },
      { en: "Paste input directly or upload files for instant results", zh: "直接粘贴输入或上传文件以获得即时结果" },
      { en: "Copy output with one click to clipboard for use in your projects", zh: "一键复制输出到剪贴板，以便在项目中使用" },
    ],
    faq: [
      { q: { en: "Is my data sent to a server?", zh: "我的数据会被发送到服务器吗？" }, a: { en: "No. All operations are performed locally in your browser using JavaScript. No data is ever transmitted to any server.", zh: "不会。所有操作都使用 JavaScript 在您的浏览器本地执行。数据绝不会被传输到任何服务器。" } },
      { q: { en: "Does this tool work offline?", zh: "这个工具可以离线工作吗？" }, a: { en: "Once the page is loaded, most tools work without an internet connection. However, you need to load the page first while online.", zh: "页面加载后，大多数工具无需互联网连接即可工作。但您需要先在线加载页面。" } },
      { q: { en: "Is there a usage limit?", zh: "有使用限制吗？" }, a: { en: "No. DevToysWeb is completely free and has no usage limits. You can use it as much as you need.", zh: "没有。DevToysWeb 完全免费，没有使用限制。您可以根据需要尽情使用。" } },
    ],
  }
}

export function getToolContent(toolId: string, toolLabel: string, toolDesc: string): ToolContent {
  return toolContents[toolId] ?? getDefaultContent(toolLabel, toolDesc)
}
