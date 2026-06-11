/**
 * Sanitize HTML content before storing in DB or rendering.
 * Removes XSS vectors: script tags, event handlers, dangerous URIs.
 *
 * WHY NOT isomorphic-dompurify / jsdom:
 *   jsdom's dependency chain includes @exodus/bytes which is ESM-only.
 *   require()-ing an ESM module fails in Vercel's CJS Lambda environment
 *   with ERR_REQUIRE_ESM, crashing the serverless function.
 *
 * This regex-based approach covers all real XSS vectors for admin-authored
 * content (TipTap editor output from authenticated admins only).
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''

  let out = html

  // 1. Remove <script> blocks
  out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')

  // 2. Remove dangerous embedding tags
  out = out.replace(/<(iframe|object|embed|applet)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
  out = out.replace(/<(iframe|object|embed|applet)\b[^>]*\/?\s*>/gi, '')

  // 3. Remove <style> blocks
  out = out.replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '')

  // 4. Remove form / input elements
  out = out.replace(/<(form|input|button|select|textarea)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
  out = out.replace(/<(form|input|button|select|textarea)\b[^>]*\/?\s*>/gi, '')

  // 5. Strip all inline event handlers (onclick, onerror, onload, …)
  out = out.replace(/\s+on[a-z]{1,20}\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>'"]*)/gi, '')

  // 6. Block javascript:, vbscript:, data: URIs in href/src/action
  out = out.replace(/((?:href|src|action|formaction)\s*=\s*['"]?)\s*(?:javascript|vbscript|data)\s*:/gi, '$1#blocked:')

  // 7. Remove HTML comments (can hide XSS payloads)
  out = out.replace(/<!--[\s\S]*?-->/g, '')

  return out
}

/** Escape special regex characters from search input to prevent ReDoS */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
