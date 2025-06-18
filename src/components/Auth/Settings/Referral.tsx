'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUser } from 'contexts/UserContext'
import { Users, Copy, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from 'contexts/AuthContext'

interface Referral {
  id: number
  nickname: string
  avatar: string
  level: number
  points: number
  validated: boolean
}

const Referral: React.FC = () => {
  const { user } = useUser()
  const { token } = useAuth()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const referralLink = `https://project42.sorokdva.eu/register?ref=${user?.nickname}`

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/users/referrals', {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des filleuls')
        }

        const data = await response.json()
        setReferrals(data.mentees)
        setError(null)
      } catch (err) {
        setError('Impossible de charger vos filleuls. Veuillez réessayer plus tard.')
        console.error('Erreur:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchReferrals()
  }, [])

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(referralLink)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((err) => {
        console.error('Erreur lors de la copie:', err)
      })
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Système de Parrainage</h2>
          <p className="text-blue-300">Invitez vos amis et gagnez des récompenses</p>
        </div>
      </div>

      {/* Section d'explication */}
      <motion.div
        className="bg-black/30 border border-blue-500/30 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-xl font-semibold text-blue-400 mb-4">Comment ça marche ?</h3>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 font-bold">1</span>
            </div>
            <div>
              <p className="text-white">Partagez votre lien de parrainage avec vos amis</p>
              <p className="text-blue-300 text-sm">Envoyez votre lien unique à vos amis qui ne jouent pas encore</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 font-bold">2</span>
            </div>
            <div>
              <p className="text-white">Vos amis s'inscrivent avec votre lien</p>
              <p className="text-blue-300 text-sm">Ils doivent utiliser votre lien lors de leur inscription</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 font-bold">3</span>
            </div>
            <div>
              <p className="text-white">Ils valident leur compte</p>
              <p className="text-blue-300 text-sm">
                Votre filleul doit valider son compte pour activer les récompenses
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-purple-400 font-bold">4</span>
            </div>
            <div>
              <p className="text-white">Vous recevez tous les deux des récompenses</p>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-blue-300 font-medium mb-1">Pour vous (parrain) :</p>
                  <ul className="list-disc list-inside text-white text-sm space-y-1">
                    <li>5 jours de premium</li>
                    <li>100 crédits</li>
                  </ul>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                  <p className="text-purple-300 font-medium mb-1">Pour votre filleul :</p>
                  <ul className="list-disc list-inside text-white text-sm">
                    <li>5 jours de premium</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section lien de parrainage */}
      <motion.div
        className="bg-black/30 border border-blue-500/30 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-semibold text-blue-400 mb-4">Parrainer un joueur</h3>

        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 border border-blue-500/20">
          <p className="text-blue-300 mb-3">Votre lien de parrainage unique :</p>

          <div className="flex items-center">
            <div className="bg-black/40 border border-blue-500/30 rounded-lg py-2 px-4 flex-grow overflow-x-auto whitespace-nowrap text-white">
              {referralLink}
            </div>

            <motion.button
              className={`ml-3 p-2 rounded-lg ${copied ? 'bg-green-600' : 'bg-blue-600'} text-white`}
              onClick={handleCopyLink}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </motion.button>
          </div>

          <p className="text-xs text-blue-300 mt-2">
            {copied ? 'Lien copié !' : 'Cliquez sur le bouton pour copier le lien'}
          </p>
        </div>
      </motion.div>

      {/* Liste des filleuls */}
      <motion.div
        className="bg-black/30 border border-blue-500/30 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-xl font-semibold text-blue-400 mb-4">Vos filleuls</h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <span className="ml-3 text-blue-300">Chargement de vos filleuls...</span>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-300">{error}</p>
          </div>
        ) : referrals.length === 0 ? (
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-8 text-center">
            <Users className="w-12 h-12 text-blue-400 mx-auto mb-3 opacity-50" />
            <h4 className="text-lg font-medium text-white mb-2">Aucun filleul pour le moment</h4>
            <p className="text-blue-300">Partagez votre lien de parrainage pour commencer à gagner des récompenses !</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {referrals.map((referral) => (
                <motion.div
                  key={referral.id}
                  className="bg-black/40 border border-blue-500/20 rounded-lg p-4 flex items-center gap-3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  data-profile={referral.nickname}
                >
                  <div className="relative">
                    <img
                      src={referral.avatar || '/placeholder.svg?height=40&width=40'}
                      alt={referral.nickname}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/30"
                    />
                    {referral.validated ? (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-black">
                        <CheckCircle className="w-3 h-3 text-black" />
                      </div>
                    ) : (
                      <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-black">
                        <AlertCircle className="w-3 h-3 text-black" />
                      </div>
                    )}
                  </div>

                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">{referral.nickname}</h4>
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                        Niv. {referral.level}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-blue-300">{referral.points} points</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          referral.validated
                            ? 'bg-green-900/30 text-green-300 border border-green-500/30'
                            : 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/30'
                        }`}
                      >
                        {referral.validated ? 'Validé' : 'En attente'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <p className="text-sm text-blue-300 text-center mt-4">
              Total : {referrals.length} filleul{referrals.length > 1 ? 's' : ''} •
              {referrals.filter((r) => r.validated).length} validé
              {referrals.filter((r) => r.validated).length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Referral
