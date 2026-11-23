// Generates out/llms.txt, out/llms-full.txt and out/<route>.md from content/ + _meta.js.
// Runs from `postbuild`, so the files are rebuilt on every deploy and can never go stale.
// Spec: https://llmstxt.org/
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMdx from 'remark-mdx'
import remarkGfm from 'remark-gfm'
import remarkStringify from 'remark-stringify'

// The only hand-written part. Everything below is derived from content/.
const TITLE = 'CESNET Invenio Documentation'
const SUMMARY =
  'Documentation for the Invenio-based part of the Czech National Repository Platform (NRP): installing, configuring, customizing, deploying and administering InvenioRDM repositories with CESNET/NRP extensions (oarepo-* packages).'
const DETAILS = [
  'Pages target CESNET Invenio / InvenioRDM v14 unless stated otherwise.',
  'High-level NRP project documentation (governance, national services) lives at https://docs.nrp.eosc.cz/.',
  'Every page linked below is also available as HTML at the same URL without the `.md` suffix.',
  'The whole documentation concatenated into one file: llms-full.txt.'
]

const ROOT = process.cwd()
const CONTENT = path.join(ROOT, 'content')
const OUT = path.resolve(ROOT, process.env.LLMS_OUT_DIR ?? 'out')
const SITE_URL = (process.env.SITE_URL ?? 'https://nrp-cz.github.io/docs').replace(/\/$/, '')
const REPO_RAW = 'https://raw.githubusercontent.com/NRP-CZ/docs/main'

// ---------- helpers ----------

const text = value => ({ type: 'text', value })
const para = children => ({ type: 'paragraph', children })

/** Plain text of a node subtree. */
function toText(node) {
  if (node.value) return node.value
  return (node.children ?? []).map(toText).join('')
}

/** Depth-first walk that tolerates children being replaced in place. */
function walkTree(node, fn, parent = null, index = null) {
  const next = fn(node, parent, index)
  if (next === false) return
  const kids = node.children ?? []
  for (let i = 0; i < kids.length; i++) {
    const before = kids[i]
    walkTree(kids[i], fn, node, i)
    if (node.children[i] !== before) i-- // re-visit replacements
  }
}

const attr = (node, name) => {
  const a = node.attributes?.find(a => a.type === 'mdxJsxAttribute' && a.name === name)
  if (!a) return undefined
  return typeof a.value === 'string' ? a.value : a.value?.value // expression => raw JS source
}

// Set per page by toMarkdown(); pages are generated sequentially, so one cursor is enough.
let pageRouteDir = ''
let pageSrcDir = 'content'

/** Every link becomes absolute, so it still resolves outside the site. */
const abs = (url, isImage = false) => {
  if (typeof url !== 'string' || !url) return url
  if (url.startsWith('#') || url.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(url)) return url
  const page = u => SITE_URL + u.replace(/\.mdx?(?=$|#)/, '')
  if (url.startsWith('/')) return page(url)
  // Images sit next to their .mdx in content/ and webpack hashes them into /_next, so they have
  // no stable site URL. Point at the file in the repo, which does.
  return isImage
    ? `${REPO_RAW}/${path.posix.normalize(`${pageSrcDir}/${url}`)}`
    : page(path.posix.normalize(`${pageRouteDir}/${url}`))
}

/** `<FileTree>` keeps its structure in JSX attributes; render it as an indented tree. */
function fileTree(node, depth = 0) {
  const lines = []
  for (const child of node.children ?? []) {
    const name = attr(child, 'name')
    if (name === undefined) continue
    const isFolder = child.name?.endsWith('.Folder')
    lines.push('  '.repeat(depth) + name + (isFolder ? '/' : ''))
    if (isFolder) lines.push(...fileTree(child, depth + 1))
  }
  return lines
}

function convertJsx(node) {
  const name = node.name ?? ''
  const kids = node.children ?? []
  switch (name) {
    case 'Callout': {
      const label = String(attr(node, 'type') ?? 'note')
      return [
        {
          type: 'blockquote',
          children: [
            para([{ type: 'strong', children: [text(label[0].toUpperCase() + label.slice(1) + ':')] }]),
            ...kids
          ]
        }
      ]
    }
    case 'Cards.Card': // same component, written either way in content/
    case 'Card': {
      const title = attr(node, 'title') ?? toText(node)
      const href = abs(attr(node, 'href'))
      const desc = toText(node).replace(/\s+/g, ' ').trim()
      const link = href
        ? { type: 'link', url: href, children: [text(title)] }
        : { type: 'strong', children: [text(title)] }
      return [para(desc && desc !== title ? [link, text(': ' + desc)] : [link])]
    }
    case 'FileTree':
      return [{ type: 'code', lang: 'text', value: fileTree(node).join('\n') }]
    case 'Mermaid':
      return [{ type: 'code', lang: 'mermaid', value: toText(node).trim() }]
    case 'MigrationHeader': {
      // Renders as an <h2> in the UI; keep it a heading so migrations.mdx stays navigable.
      const parts = [attr(node, 'date'), attr(node, 'title')].filter(Boolean)
      const extra = [attr(node, 'versionBadge'), attr(node, 'prHref')].filter(Boolean)
      return [
        { type: 'heading', depth: 2, children: [text(parts.join(': '))] },
        ...(extra.length ? [para([text(extra.join(' — '))])] : [])
      ]
    }
    case 'Tabs': {
      // Tab labels live in an `items={[...]}` JS expression, so pull the string literals out.
      const labels = [...String(attr(node, 'items') ?? '').matchAll(/['"`]([^'"`]*)['"`]/g)].map(m => m[1])
      return kids.flatMap((tab, i) => [
        ...(labels[i] ? [{ type: 'heading', depth: 4, children: [text(labels[i])] }] : []),
        ...(tab.children ?? [tab])
      ])
    }
    // Parentheses, not brackets: brackets get escaped as `\[` by the stringifier.
    case 'Difficulty':
      return [text(`(${attr(node, 'level') ?? 'easy'})`)]
    case 'ToDo':
      return [text('(TODO)')]
    case 'Badge':
      return [text(`(${toText(node)})`)]
    case 'a':
      return [{ type: 'link', url: abs(attr(node, 'href')) ?? '', children: kids }]
    case 'img':
    case 'Image':
      return [{ type: 'image', url: abs(attr(node, 'src'), true) ?? '', alt: attr(node, 'alt') ?? '' }]
    case 'br':
      return [text('\n')]
    default:
      // Cards, Steps, MigrationSteps, MigrationAffected, div, details, ...: keep the content.
      return kids
  }
}

const processor = isMdx => {
  const p = unified().use(remarkParse).use(remarkGfm)
  if (isMdx) p.use(remarkMdx)
  return p.use(remarkStringify, { bullet: '-', fences: true, rule: '-' })
}

async function toMarkdown(file, route) {
  const src = await readFile(file, 'utf8')
  const dir = path.posix.dirname(route)
  // an index page's own route is already its directory
  pageRouteDir = /(^|\/)index\.mdx?$/.test(file) ? (route === '/' ? '' : route) : dir === '/' ? '' : dir
  pageSrcDir = path.relative(ROOT, path.dirname(file)).split(path.sep).join('/')
  const proc = processor(file.endsWith('.mdx'))
  const tree = proc.parse(src)

  walkTree(tree, (node, parent, index) => {
    if (!parent) return
    // imports/exports and `{expressions}` / `{/* comments */}` carry nothing for a reader
    if (node.type === 'mdxjsEsm' || node.type === 'mdxFlowExpression' || node.type === 'mdxTextExpression') {
      parent.children.splice(index, 1)
      return false
    }
    if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
      parent.children.splice(index, 1, ...convertJsx(node))
      return false
    }
    if (node.type === 'link' || node.type === 'image') node.url = abs(node.url, node.type === 'image')
  })

  const h1 = tree.children.find(n => n.type === 'heading' && n.depth === 1)
  const firstPara = tree.children.find(n => n.type === 'paragraph')
  return {
    md: proc.stringify(tree).trim() + '\n',
    h1: h1 ? toText(h1).replace(/\(\w+\)$/, '').trim() : null, // drop a trailing <Difficulty> badge
    hasH1: Boolean(h1),
    summary: firstPara ? toText(firstPara).replace(/\s+/g, ' ').trim() : ''
  }
}

const titleCase = key => key.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

/** Walks content/ in `_meta.js` order and returns pages depth-first. */
async function walk(dir, routeBase, trail) {
  let meta = {}
  try {
    meta = (await import(path.join(dir, '_meta.js'))).default ?? {}
  } catch {} // a folder without _meta.js is ordered alphabetically

  // A key can be a page, a folder, or both (e.g. templating.mdx + templating/).
  const items = new Map()
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith('_') || e.name.startsWith('.')) continue
    if (!e.isDirectory() && !/\.mdx?$/.test(e.name)) continue
    const key = e.name.replace(/\.mdx?$/, '')
    const item = items.get(key) ?? {}
    item[e.isDirectory() ? 'dir' : 'file'] = path.join(dir, e.name)
    items.set(key, item)
  }

  const ordered = [
    ...Object.keys(meta).filter(k => items.has(k)),
    ...[...items.keys()].filter(k => !(k in meta)).sort()
  ]

  const pages = []
  for (const key of ordered) {
    const m = meta[key]
    const route = key === 'index' ? routeBase || '/' : `${routeBase}/${key}`
    const label = String((typeof m === 'string' ? m : m?.title) ?? titleCase(key)).replace(/^»\s*/, '')
    const { file, dir: sub } = items.get(key)
    if (file) {
      const { md, h1, hasH1, summary } = await toMarkdown(file, route)
      pages.push({ route, title: h1 ?? label, hasH1, trail, md, summary })
    }
    if (sub) pages.push(...(await walk(sub, `${routeBase}/${key}`, [...trail, label])))
  }
  return pages
}

// ---------- emit ----------

const pages = await walk(CONTENT, '', [])
const mdUrl = r => SITE_URL + (r === '/' ? '/index.md' : `${r}.md`)
const htmlUrl = r => SITE_URL + r

for (const p of pages) {
  const dest = path.join(OUT, p.route === '/' ? 'index.md' : `${p.route.slice(1)}.md`)
  await mkdir(path.dirname(dest), { recursive: true })
  await writeFile(dest, p.md)
}

const sections = new Map()
for (const p of pages) {
  if (p.route === '/') continue
  const section = p.trail[0] ?? 'Documentation'
  if (!sections.has(section)) sections.set(section, [])
  sections.get(section).push(p)
}

let index = `# ${TITLE}\n\n> ${SUMMARY}\n\n${DETAILS.map(d => `- ${d}`).join('\n')}\n`
for (const [section, list] of sections) {
  index += `\n## ${section}\n\n`
  for (const p of list) {
    const crumb = p.trail.slice(1).join(' › ')
    const title = crumb ? `${crumb} › ${p.title}` : p.title
    const note = p.summary.length > 200 ? p.summary.slice(0, 197).trimEnd() + '…' : p.summary
    index += `- [${title}](${mdUrl(p.route)})${note ? `: ${note}` : ''}\n`
  }
}
await writeFile(path.join(OUT, 'llms.txt'), index)

const full =
  [
    `# ${TITLE}`,
    `> ${SUMMARY}`,
    // the page's own H1 is kept where it has one, so only supply a heading when it does not
    ...pages.map(
      p => `---\n\n${p.hasH1 ? '' : `# ${p.title}\n\n`}Source: ${htmlUrl(p.route)}\n\n${p.md}`
    )
  ].join('\n\n') + '\n'
await writeFile(path.join(OUT, 'llms-full.txt'), full)

// ---------- self-check: a broken generator must fail the build, not ship empty files ----------
const problems = []
if (pages.length < 50) problems.push(`only ${pages.length} pages found (expected 50+)`)
if (!/^# .+\n\n> .+/.test(index)) problems.push('llms.txt must start with an H1 then a `>` summary')
if (sections.size < 2) problems.push(`only ${sections.size} section(s) in llms.txt`)
const untitled = pages.filter(p => !p.title).map(p => p.route)
if (untitled.length) problems.push(`pages without a title: ${untitled.join(', ')}`)
const stray = [...index.matchAll(/^- \[[^\]]*\]\((\S+)\)/gm)]
  .map(m => m[1])
  .filter(u => !u.startsWith(SITE_URL + '/'))
if (stray.length) problems.push(`links outside ${SITE_URL}: ${stray.slice(0, 5).join(', ')}`)
if (problems.length) {
  console.error('llms generation failed:\n' + problems.map(p => `  - ${p}`).join('\n'))
  process.exit(1)
}

console.log(
  `llms: ${pages.length} pages in ${sections.size} sections → ${path.relative(ROOT, OUT)}/ ` +
    `(llms.txt ${(index.length / 1024).toFixed(1)} KiB, llms-full.txt ${(full.length / 1024).toFixed(0)} KiB)`
)
