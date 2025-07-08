'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { News as NewsItemType } from 'types/news'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import DOMPurify from 'dompurify'

interface NewsItemProps {
  news: NewsItemType
}

const NewsItem: React.FC<NewsItemProps> = ({ news }) =>  {
  const formattedDate = formatDistanceToNow(new Date(news.publishDate), {
    addSuffix: true,
    locale: fr,
  })

  return (
    <motion.article
      className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden shadow-lg"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {news.tags.split(',').map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-xs font-medium rounded-full bg-blue-900/40 text-blue-300 border border-blue-500/30"
            >
              {tag}
            </span>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-3 text-white">{news.title}</h2>

        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {news.author.avatar ? (
              <img
                src={news.author.avatar || '/placeholder.svg'}
                alt={news.author.nickname}
                className="w-8 h-8 rounded-full mr-3 border border-blue-500/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full mr-3 bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                {news.author.nickname.charAt(0)}
              </div>
            )}
            <span className="text-blue-300 text-sm">{news.author.nickname}</span>
          </div>
          <span className="mx-3 text-gray-500">•</span>
          <span className="text-gray-400 text-sm">{formattedDate}</span>
        </div>

        {news.image && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <img
              src={news.image || '/placeholder.svg'}
              alt={news.title}
              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="prose prose-invert prose-blue max-w-none">
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.content) }} />
        </div>
      </div>
    </motion.article>
  )
}

export default NewsItem
