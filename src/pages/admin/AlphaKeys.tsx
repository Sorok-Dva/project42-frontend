'use client'

import type React from 'react'
import { Container } from 'reactstrap'
import AlphaKeys from 'components/Admin/AlphaKeys'
import { motion } from 'framer-motion'
import { Key } from 'lucide-react'

const AlphaKeysPage: React.FC = () => {
  return (
    <>
      <div className="relative z-10 bg-gradient-to-r from-black/80 to-blue-900/30 backdrop-blur-sm border-b border-blue-500/30 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <motion.h1
            className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Clés Alpha
          </motion.h1>
          <motion.div
            className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full mt-2"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </div>
      </div>
      <main className="p-4 md:p-6 space-y-6">
        <AlphaKeys />
      </main>
    </>
  )
}

export default AlphaKeysPage
