declare module "html-minifier-terser" {
  interface MinifyOptions {
    collapseWhitespace?: boolean
    removeComments?: boolean
    minifyCSS?: boolean
    minifyJS?: boolean
    removeAttributeQuotes?: boolean
    removeOptionalTags?: boolean
    [key: string]: unknown
  }
  export function minify(html: string, options?: MinifyOptions): Promise<string>
}