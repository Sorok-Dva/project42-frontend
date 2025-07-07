import DOMPurify from 'dompurify'

export const parseMarkdown = (markdown: string): string => {
  if (!markdown) return ''

  let html = markdown

  // Colors using [color=red]text[/color]
  html = html.replace(/\[color=(#[0-9a-fA-F]{3,6}|[a-zA-Z]+)\]([\s\S]+?)\[\/color\]/g, '<span style="color:$1">$2</span>')

  // Headers
  html = html.replace(/^###### (.*)$/gm, '<h6>$1</h6>')
  html = html.replace(/^##### (.*)$/gm, '<h5>$1</h5>')
  html = html.replace(/^#### (.*)$/gm, '<h4>$1</h4>')
  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>')

  // Bold, italic, underline, strike
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/__(.*?)__/g, '<u>$1</u>')
  html = html.replace(/~~(.*?)~~/g, '<del>$1</del>')

  // Links and images
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" />')
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // Unordered lists
  html = html.replace(/(?:^|\n)([*-] .*(?:\n[*-] .*)*)/g, (match) => {
    const items = match.trim().split(/\n/).map(i => `<li>${i.substring(2)}</li>`).join('')
    return `<ul>${items}</ul>`
  })

  // Paragraphs
  html = html.replace(/\n{2,}/g, '</p><p>')
  html = `<p>${html}</p>`
  html = html.replace(/\n/g, '<br />')

  return DOMPurify.sanitize(html)
}
