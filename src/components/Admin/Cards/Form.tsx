'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Card, CardFormData } from 'types/card'
import { X, Upload, Loader2 } from 'lucide-react'
import { Img as Image } from 'react-image'

interface CardFormProps {
  card?: Card
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CardFormData, id?: number) => void
}

const CardForm: React.FC<CardFormProps> = ({ card, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CardFormData>({
    name: '',
    description: '',
    imageUrl: '/placeholder.svg?height=200&width=150',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    if (card) {
      setFormData({
        name: card.name,
        description: card.description,
        imageUrl: card.imageUrl,
      })
      setPreviewImage(card.imageUrl)
    } else {
      setFormData({
        name: '',
        description: '',
        imageUrl: '/placeholder.svg?height=200&width=150',
      })
      setPreviewImage(null)
    }
  }, [card, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Dans une application réelle, vous téléchargeriez le fichier sur un serveur
      // Pour cette démo, nous créons simplement une URL d'objet local
      const imageUrl = URL.createObjectURL(file)
      setPreviewImage(imageUrl)
      setFormData((prev) => ({ ...prev, imageUrl }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simuler un délai de traitement
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onSubmit(formData, card?.id)
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gray-900 border border-blue-500/30 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center p-4 border-b border-blue-500/30">
            <h2 className="text-xl font-bold text-white">
              {card ? 'Modifier la carte' : 'Ajouter une nouvelle carte'}
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full">
              <X className="text-gray-400 hover:text-white" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Nom de la carte
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom de la carte"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description de la carte"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="image" className="block text-sm font-medium text-gray-300">
                Image
              </label>
              <div className="flex items-start gap-4">
                <div className="relative w-32 h-32 border border-dashed border-gray-600 rounded-md overflow-hidden">
                  {previewImage ? (
                    <Image src={previewImage || '/placeholder.svg'} alt="Aperçu" className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-800">
                      <span className="text-gray-500 text-sm">Aucune image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md cursor-pointer"
                  >
                    <Upload size={16} className="mr-2" />
                    <span>Télécharger une image</span>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <p className="mt-2 text-xs text-gray-500">Formats acceptés: JPG, PNG, GIF. Taille max: 2MB</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>Enregistrer</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default CardForm
