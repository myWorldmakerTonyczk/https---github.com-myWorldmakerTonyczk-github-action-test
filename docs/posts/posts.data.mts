import { createContentLoader } from 'vitepress'

export interface Post {
  title: string
  date: string
  author: string
  url: string
  excerpt: string
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ZeroWidthSpace;/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default createContentLoader('posts/*.md', {
  excerpt: true,
  transform(raw): Post[] {
    return raw
      .filter(page => page.url !== '/posts/')
      .sort((a, b) => +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date))
      .map(page => {
        // 优先用 frontmatter 中的 excerpt，否则用渲染后的纯文本摘要
        let excerpt = page.frontmatter.excerpt || ''
        if (!excerpt && page.excerpt) {
          excerpt = stripHtml(page.excerpt).substring(0, 200)
        }
        return {
          title: page.frontmatter.title || '',
          date: formatDate(page.frontmatter.date || ''),
          author: page.frontmatter.author || '',
          url: page.url,
          excerpt,
        }
      })
  }
})
