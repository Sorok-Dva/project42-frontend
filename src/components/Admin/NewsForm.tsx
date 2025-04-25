'use client'

import React, { lazy, Suspense, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { News as NewsItem } from 'types/news'

// Lazy-load de ReactQuill
const ReactQuill = lazy(() => import('react-quill'))
import 'react-quill/dist/quill.snow.css'

interface NewsFormProps {
  initialData?: Partial<NewsItem>
  onSubmit: (data: Partial<NewsItem>) => void
  isSubmitting: boolean
}

type NewsTag = ['jeu', 'site', 'event', 'maintenance', 'mise à jour', 'communauté']

const NewsForm: React.FC<NewsFormProps> = ({ initialData, onSubmit, isSubmitting }) => {
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [selectedTags, setSelectedTags] = useState<NewsTag[]>([])
  const [imageUrl, setImageUrl] = useState(initialData?.image || '')
  const [scheduledDate, setScheduledDate] = useState<string>('')
  const [isScheduled, setIsScheduled] = useState(false)

  const availableTags: string[] = ['Jeu', 'Site', 'Évènement', 'Maintenance', 'Recrutement', 'Communauté']

  // Set scheduled date if provided in initialData
  useEffect(() => {
    if (initialData?.publishDate) {
      const date = new Date(initialData.publishDate)
      setScheduledDate(date.toISOString().split('T')[0])
      setIsScheduled(true)
    }
  }, [initialData])

  const handleTagToggle = (tag: NewsTag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!title.trim()) {
      alert('Le titre est requis')
      return
    }

    if (!content.trim()) {
      alert('Le contenu est requis')
      return
    }

    // Create news data object
    const newsData: Partial<NewsItem> = {
      title,
      content,
      tags: selectedTags.join(','),
      image: imageUrl || undefined,
      publishDate: scheduledDate,
    }

    onSubmit(newsData)
  }

  // Quill editor modules and formats
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
      [{ color: [] }, { background: [] }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
    history: {
      delay: 2500,
      userOnly: true
    },
  }

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'color',
    'background',
    'link',
    'image',
  ]

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-blue-300 mb-1">
            Titre <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-black/60 border border-blue-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder="Titre de l'actualité"
            required
          />
        </div>

        {/* Image URL */}
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-blue-300 mb-1">
            URL de l'image (optionnel)
          </label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full bg-black/60 border border-blue-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-blue-300 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag as unknown as NewsTag)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedTags.includes(tag as unknown as NewsTag)
                    ? 'bg-blue-600 text-white'
                    : 'bg-black/60 text-blue-300 border border-blue-500/30 hover:bg-blue-900/40'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Excerpt */}
        {/*<div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-blue-300 mb-1">
            Extrait (optionnel)
          </label>
          <textarea
            id="excerpt"
            className="w-full bg-black/60 border border-blue-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder="Bref résumé de l'actualité (laissez vide pour générer automatiquement)"
            rows={3}
          />
        </div>*/}

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-blue-300 mb-1">
            Contenu <span className="text-red-400">*</span>
          </label>
          <div className="bg-black/60 border border-blue-500/30 rounded-lg overflow-hidden">
            <Suspense fallback={<div>Chargement de l’éditeur…</div>}>
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                className="text-white bg-black/60 h-64"
              />
            </Suspense>
          </div>
        </div>

        {/* Publishing options */}
        <div className="bg-black/40 rounded-lg p-4 border border-blue-500/20">
          <h3 className="text-lg font-medium mb-4">Options de publication</h3>

          <div className="space-y-4">
            {/* Publish immediately */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublished"
                checked={!isScheduled}
                onChange={(e) => {
                  if (e.target.checked) {
                    setIsScheduled(false)
                  }
                }}
                className="w-4 h-4 text-blue-600 bg-black/60 border-blue-500/30 rounded focus:ring-blue-500/50"
              />
              <label htmlFor="isPublished" className="ml-2 text-sm text-blue-300">
                Publier immédiatement
              </label>
            </div>

            {/* Schedule for later */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isScheduled"
                checked={isScheduled}
                onChange={(e) => {
                  setIsScheduled(e.target.checked)
                }}
                className="w-4 h-4 text-blue-600 bg-black/60 border-blue-500/30 rounded focus:ring-blue-500/50"
              />
              <label htmlFor="isScheduled" className="ml-2 text-sm text-blue-300">
                Programmer la publication
              </label>
            </div>

            {/* Scheduled date */}
            {isScheduled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pl-6"
              >
                <label htmlFor="scheduledDate" className="block text-sm font-medium text-blue-300 mb-1">
                  Date de publication <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="scheduledDate"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-black/60 border border-blue-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required={isScheduled}
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <motion.button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Publication en cours...
              </span>
            ) : (
              <span>Publier l'actualité</span>
            )}
          </motion.button>
        </div>
      </div>
    </form>
  )
}

export default NewsForm
