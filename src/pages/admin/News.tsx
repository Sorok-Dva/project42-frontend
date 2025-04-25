'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import NewsForm from 'components/Admin/NewsForm'
import type { News as NewsItem } from 'types/news'
import { staticStars } from 'utils/animations'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { useAuth } from 'contexts/AuthContext'

const AdminNewsPage: React.FC = () => {
  const { token } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (newsData: Partial<NewsItem>) => {
    setIsSubmitting(true)
    setSubmitSuccess(false)
    setSubmitError(null)

    try {
      const { data } = await axios.post(
        '/api/admin/news',
        newsData,
        {
          headers: {
            Authorization: `Bearer ${ token }`,
          },
        },
      )
      if (data.id) {
        toast.success('L\'actualité a été publiée avec succès !', ToastDefaultOptions)
      } else {
        toast.error(`L'actualité n'a pas été publiée: ${ data.error }.`, ToastDefaultOptions)
      }

      setSubmitSuccess(true)
      setIsSubmitting(false)
    }  catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(
          `L'actualité n'a pas été publiée: ${ err.response?.data.error }.`,
          ToastDefaultOptions,
        )
      } else {
        console.log(err)
      }
      setSubmitError('Une erreur est survenue lors de la publication. Veuillez réessayer.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black text-white">
      {/* Background stars */}
      <div className="fixed inset-0 z-0">{staticStars}</div>

      {/* Nebula effect */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(circle at 70% 30%, rgba(111, 66, 193, 0.6), transparent 60%), radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.6), transparent 60%), radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3), transparent 70%)',
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-black/80 to-blue-900/30 backdrop-blur-sm border-b border-blue-500/30 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <motion.h1
            className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Administration des Actualités
          </motion.h1>
          <motion.div
            className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full mt-2"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Créer une nouvelle actualité</h2>

              {submitSuccess && (
                <motion.div
                  className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg text-green-300"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <p className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    L'actualité a été publiée avec succès !
                  </p>
                </motion.div>
              )}

              {submitError && (
                <motion.div
                  className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <p className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {submitError}
                  </p>
                </motion.div>
              )}

              <NewsForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            </div>
          </motion.div>

          <div className="mt-8 text-center">
            <a
              href="/news"
              className="inline-flex items-center px-4 py-2 bg-black/60 hover:bg-black/80 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Retour à la liste des actualités
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminNewsPage
