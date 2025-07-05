import React from 'react'
import { motion } from 'framer-motion'

interface QuickEndPhaseVoteProps {
  votes: number
  required: number
  hasVoted: boolean
  onVote: () => void
}

const QuickEndPhaseVote: React.FC<QuickEndPhaseVoteProps> = ({ votes, required, hasVoted, onVote }) => {
  const progress = Math.min((votes / required) * 100, 100)

  return (
    <motion.div
      className="bg-black/40 rounded-lg p-3 flex items-center gap-3 mt-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-1">
        <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-green-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-gray-300 mt-1 text-center">
          {votes}/{required} votes pour
        </div>
      </div>
      <motion.button
        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onVote}
        disabled={hasVoted}
      >
        {hasVoted ? 'Vote envoyé' : 'Voter'}
      </motion.button>
    </motion.div>
  )
}

export default QuickEndPhaseVote
