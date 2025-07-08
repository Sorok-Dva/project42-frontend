'use client'

import type React from 'react'
import { useState, useRef, useCallback } from 'react'
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  LinkIcon,
  ImageIcon,
  Code,
  Quote,
  Table,
  Minus,
  Eye,
  Edit3,
  Palette,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
} from 'lucide-react'
import { Button } from 'components/UI/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/UI/Tabs'
import { Popover, PopoverContent, PopoverTrigger } from 'components/UI/Popover'
import DOMPurify from 'dompurify'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  height?: string
}


// Render markdown preview (simplified)
export const renderPreview = (text: string) => {
  // Process tables first (before line breaks are converted)
  let html = text

  // Table processing
  const tableRegex = /\|(.+)\|\n\|[-:| ]+\|\n((?:\|.+\|\n?)+)/g
  html = html.replace(tableRegex, (match) => {
    // Split the table into rows
    const rows = match.split('\n').filter((row) => row.trim() !== '')

    // Extract headers
    const headerRow = rows[0]
    const headers = headerRow
      .split('|')
      .filter((cell) => cell.trim() !== '')
      .map((cell) => cell.trim())

    // Process alignment row
    const alignmentRow = rows[1]
    const alignments = alignmentRow
      .split('|')
      .filter((cell) => cell.trim() !== '')
      .map((cell) => {
        const trimmed = cell.trim()
        if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center'
        if (trimmed.endsWith(':')) return 'right'
        return 'left'
      })

    // Process data rows
    const dataRows = rows.slice(2)

    // Build the HTML table
    let tableHtml = '<div class="overflow-x-auto my-4"><table class="w-full border-collapse">'

    // Add header
    tableHtml += '<thead class="bg-gray-700/50"><tr>'
    headers.forEach((header, i) => {
      const align = alignments[i] || 'left'
      tableHtml += `<th class="border border-gray-600 px-4 py-2 text-${align}">${header}</th>`
    })
    tableHtml += '</tr></thead>'

    // Add body
    tableHtml += '<tbody>'
    dataRows.forEach((row) => {
      const cells = row
        .split('|')
        .filter((cell) => cell.trim() !== '')
        .map((cell) => cell.trim())

      tableHtml += '<tr class="border-t border-gray-600 hover:bg-gray-700/30">'
      cells.forEach((cell, i) => {
        const align = alignments[i] || 'left'
        tableHtml += `<td class="border border-gray-600 px-4 py-2 text-${align}">${cell}</td>`
      })
      tableHtml += '</tr>'
    })

    tableHtml += '</tbody></table></div>'
    return tableHtml
  })

  // Continue with other markdown processing
  html = html
    // Code inline `code`
    .replace(/```([\s\S]*?)```/g, (_, code) => {
      const escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      return `<pre class="bg-gray-800 text-sm text-gray-100 rounded p-4 overflow-x-auto"><code>${escaped}</code></pre>`
    })
    .replace(/`([^`]+)`/g, '<code class="bg-gray-700 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    // Images ![alt](url)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded" />')
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="font-semibold mb-2 text-white">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="font-semibold mb-3 text-white">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="font-bold mb-4 text-white">$1</h1>')
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/~~(.*?)~~/g, '<del class="line-through">$1</del>')
    // Liens [texte](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-400 hover:text-blue-300 underline">$1</a>')
    // Lists
    .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Separator
    .replace(/---/g, '<hr class="border-gray-600 my-4" />')
    // Quotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-300">$1</blockquote>')
    // Paragraphes
    .replace(/\n\n+/g, '</p><p>')
    // Line breaks
    .replace(/\n/g, '<br />')


  return DOMPurify.sanitize(html)
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange, className = '', height = 'h-96' }) => {
  const [activeTab, setActiveTab] = useState('edit')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#3b82f6')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [history, setHistory] = useState<string[]>([value])
  const [historyIndex, setHistoryIndex] = useState(0)

  const colors = [
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#eab308',
    '#84cc16',
    '#22c55e',
    '#10b981',
    '#14b8a6',
    '#06b6d4',
    '#0ea5e9',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#d946ef',
    '#ec4899',
    '#f43f5e',
    '#64748b',
  ]

  // Add to history for undo/redo
  const addToHistory = useCallback(
    (newValue: string) => {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newValue)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    },
    [history, historyIndex],
  )

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      onChange(history[newIndex])
    }
  }, [historyIndex, history, onChange])

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      onChange(history[newIndex])
    }
  }, [historyIndex, history, onChange])

  // Get cursor position and selection
  const getCursorPosition = () => {
    const textarea = textareaRef.current
    if (!textarea) return { start: 0, end: 0 }
    return {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    }
  }

  // Insert text at cursor position
  const insertText = (before: string, after = '', placeholder = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const { start, end } = getCursorPosition()
    const selectedText = value.substring(start, end)
    const textToInsert = selectedText || placeholder

    const newValue = value.substring(0, start) + before + textToInsert + after + value.substring(end)

    onChange(newValue)
    addToHistory(newValue)

    // Set cursor position after insertion
    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }

  // Insert text at beginning of line
  const insertAtLineStart = (prefix: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const { start } = getCursorPosition()
    const lines = value.split('\n')
    let currentLine = 0
    let charCount = 0

    // Find current line
    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= start) {
        currentLine = i
        break
      }
      charCount += lines[i].length + 1 // +1 for \n
    }

    lines[currentLine] = prefix + lines[currentLine]
    const newValue = lines.join('\n')
    onChange(newValue)
    addToHistory(newValue)
  }

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image')
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image est trop volumineuse (max 5MB)')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      const altText = file.name.split('.')[0]
      insertText(`![${altText}](${base64})`)
    }
    reader.readAsDataURL(file)
  }

  // Toolbar actions
  const actions = {
    bold: () => insertText('**', '**'),
    italic: () => insertText('*', '*'),
    strikethrough: () => insertText('~~', '~~'),
    h1: () => insertAtLineStart('# '),
    h2: () => insertAtLineStart('## '),
    h3: () => insertAtLineStart('### '),
    bulletList: () => insertAtLineStart('- '),
    numberedList: () => insertAtLineStart('1. '),
    link: () => insertText('[', '](https://example.com)', 'texte du lien'),
    image: () => {
      if (fileInputRef.current) {
        fileInputRef.current.click()
      }
    },
    imageLink: () => insertText('![', '](https://example.com/image.jpg)', 'alt text'),
    code: () => insertText('`', '`', ''),
    codeBlock: () => insertText('```\n', '\n```', 'votre code ici (hey on recherche des devs si jamais 😅)'),
    quote: () => insertAtLineStart('> '),
    table: () =>
      insertText(
        '\n| Colonne 1 | Colonne 2 | Colonne 3 |\n|-----------|-----------|----------|\n| Cellule 1 | Cellule 2 | Cellule 3 |\n',
      ),
    hr: () => insertText('\n---\n'),
    color: (color: string) => insertText(`<span style="color: ${color}">`, '</span>', 'texte coloré'),
    alignLeft: () => insertText('<div style="text-align: left">\n', '\n</div>', 'texte aligné à gauche'),
    alignCenter: () => insertText('<div style="text-align: center">\n', '\n</div>', 'texte centré'),
    alignRight: () => insertText('<div style="text-align: right">\n', '\n</div>', 'texte aligné à droite'),
  }

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
      case 'b':
        e.preventDefault()
        actions.bold()
        break
      case 'i':
        e.preventDefault()
        actions.italic()
        break
      case 'k':
        e.preventDefault()
        actions.link()
        break
      case 'z':
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
        break
      case 'y':
        e.preventDefault()
        redo()
        break
      }
    }
  }

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-lg border border-indigo-500/30 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 border-b border-gray-700/50">
        {/* History */}
        <div className="flex items-center gap-1 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0}
            className="h-8 w-8 p-0 hover:bg-gray-700/50"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="h-8 w-8 p-0 hover:bg-gray-700/50"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Headers */}
        <Button variant="ghost" size="sm" onClick={actions.h1} className="h-8 px-2 hover:bg-gray-700/50">
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={actions.h2} className="h-8 px-2 hover:bg-gray-700/50">
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={actions.h3} className="h-8 px-2 hover:bg-gray-700/50">
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Text formatting */}
        <Button
          variant="ghost"
          size="sm"
          onClick={actions.bold}
          className="h-8 w-8 p-0 hover:bg-gray-700/50"
          title="Gras (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={actions.italic}
          className="h-8 w-8 p-0 hover:bg-gray-700/50"
          title="Italique (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={actions.strikethrough} className="h-8 w-8 p-0 hover:bg-gray-700/50">
          <Strikethrough className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Lists */}
        <Button variant="ghost" size="sm" onClick={actions.bulletList} className="h-8 w-8 p-0 hover:bg-gray-700/50">
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={actions.numberedList} className="h-8 w-8 p-0 hover:bg-gray-700/50">
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Links and media */}
        <Button
          variant="ghost"
          size="sm"
          onClick={actions.link}
          className="h-8 w-8 p-0 hover:bg-gray-700/50"
          title="Lien (Ctrl+K)"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        {/*<Button variant="ghost" size="sm" onClick={actions.image} className="h-8 w-8 p-0 hover:bg-gray-700/50">
          <ImageIcon className="h-4 w-4" />
        </Button>*/}
        <Button
          variant="ghost"
          size="sm"
          onClick={actions.imageLink}
          className="h-8 w-8 p-0 hover:bg-gray-700/50"
          title="Image par URL"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Code */}
        <Button variant="ghost" size="sm" onClick={actions.code} className="h-8 w-8 p-0 hover:bg-gray-700/50">
          <Code className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={actions.codeBlock} className="h-8 px-2 hover:bg-gray-700/50 text-xs">
          {'</>'}
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Other elements */}
        <Button variant="ghost" size="sm" onClick={actions.quote} className="h-8 w-8 p-0 hover:bg-gray-700/50">
          <Quote className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={actions.table} className="h-8 w-8 p-0 hover:bg-gray-700/50">
          <Table className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={actions.hr} className="h-8 w-8 p-0 hover:bg-gray-700/50">
          <Minus className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Alignment */}
        <Button variant="ghost" size="sm" onClick={actions.alignLeft} className="h-8 w-8 p-0 hover:bg-gray-700/50">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={actions.alignCenter} className="h-8 w-8 p-0 hover:bg-gray-700/50">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={actions.alignRight} className="h-8 w-8 p-0 hover:bg-gray-700/50">
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Color picker */}
        <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-700/50">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 bg-gray-800 border-gray-700">
            <div className="grid grid-cols-6 gap-2 p-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded border-2 border-transparent hover:border-white transition-colors"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    actions.color(color)
                    setSelectedColor(color)
                    setShowColorPicker(false)
                  }}
                />
              ))}
            </div>
            <div className="p-2 border-t border-gray-700">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full h-8 rounded cursor-pointer"
              />
              <Button
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  actions.color(selectedColor)
                  setShowColorPicker(false)
                }}
              >
                Appliquer la couleur
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor/Preview Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-700/50">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Édition
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Aperçu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-0">
          <textarea
            ref={textareaRef}
            className={`w-full ${height} p-4 bg-transparent text-white resize-none focus:outline-none font-mono text-sm leading-relaxed`}
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              addToHistory(e.target.value)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Commencez à écrire votre markdown ici...

# Titre principal
## Sous-titre
### Titre de section

**Texte en gras** et *texte en italique*

- Liste à puces
- Autre élément

1. Liste numérotée
2. Deuxième élément

[Lien](https://example.com)
![Image](https://example.com/image.jpg)

`code inline` et blocs de code:"
          />
        </TabsContent>
        <TabsContent value="preview" className="mt-0">
          <div dangerouslySetInnerHTML={{ __html: renderPreview(value) }} className="p-4 bg-gray-900/50 text-white" />
        </TabsContent>
      </Tabs>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
    </div>
  )
}

export default MarkdownEditor
