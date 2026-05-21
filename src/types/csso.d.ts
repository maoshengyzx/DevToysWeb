declare module "csso" {
  interface MinifyOptions {
    compress?: boolean
    debug?: boolean
    forceMediaMerge?: boolean
    usage?: unknown
    logger?: unknown
    [key: string]: unknown
  }
  interface MinifyResult {
    css: string
  }
  export function minify(css: string, options?: MinifyOptions): MinifyResult
}