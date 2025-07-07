import React from 'react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange, className }) => {
  return (
    <textarea
      className={`w-full h-64 p-3 bg-gray-800/40 text-white rounded-md border border-gray-600 focus:outline-none ${className ?? ''}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export default MarkdownEditor
