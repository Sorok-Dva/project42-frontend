'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import NewsItem from 'components/News/NewsItem'
import NewsPagination from 'components/News/NewsPagination'
import { News } from 'types/news'
import { Spinner } from 'reactstrap'

import { staticStars } from 'utils/animations'
import axios from 'axios'

const NewsPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [news, setNews] = useState<News[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 15

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get<{
          news: News[]
          lastPage: number,
          page: number,
          total: number,
        }>('/api/news/')
        const totalItems = response.data.total
        const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage)
        setTotalPages(calculatedTotalPages)

        // Get current page items
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        const paginatedNews = response.data.news.slice(startIndex, endIndex)

        setNews(paginatedNews)
        setLoading(false)
      } catch (err: any) {
        console.log('failed to fetch news', err)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
        <div className="container mx-auto px-4 py-6 mt-24">
          <motion.h1
            className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Actualités de la station Mir
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
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="spinner-wrapper">
              <Spinner className="custom-spinner" />
              <div className="mt-4 text-blue-300">Chargement des actualités...</div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {news.length > 0 ? (
              news.map((item: News, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <NewsItem news={item} />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20">
                <p className="text-xl text-gray-400">Aucune actualité disponible pour le moment.</p>
              </div>
            )}

            {/* Pagination */}
            {news.length > 0 && (
              <div className="mt-12">
                <NewsPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default NewsPage
