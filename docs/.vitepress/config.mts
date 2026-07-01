import { defineConfig } from 'vitepress'
import { readdirSync, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface PostMeta {
  text: string
  link: string
  date: string
}

function getPosts(): PostMeta[] {
  const postsDir = resolve(__dirname, '../posts')
  const files = readdirSync(postsDir).filter(f => f.endsWith('.md') && f !== 'index.md')

  const posts = files.map(file => {
    const content = readFileSync(resolve(postsDir, file), 'utf-8')
    const match = content.match(/^---\s*\n([\s\S]*?)\n---/)
    const frontmatter = match?.[1] || ''
    const title = frontmatter.match(/title:\s*(.+)/)?.[1] || file.replace('.md', '')
    const date = frontmatter.match(/date:\s*(.+)/)?.[1] || ''

    return {
      text: title,
      link: `/posts/${file.replace('.md', '')}`,
      date,
    }
  })

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return posts
}

export default defineConfig({
  title: "My Open Source Blog",
  description: "开源软件开发技术课程 - 个人Blog",
  base: "/oss-blog/",
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Blog', link: '/posts/' }
    ],
    sidebar: {
      '/posts/': [
        {
          text: 'Blog Posts',
          items: getPosts().map(p => ({ text: p.text, link: p.link })),
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/myWorldmakerTonyczk/oss-blog' }
    ]
  }
})
