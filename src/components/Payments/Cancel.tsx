'use client'

import React, { useRef } from 'react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from 'components/UI/Button'
import { Card, CardContent } from 'components/UI/Card'
import { Badge } from 'components/UI/Badge'
import { toast } from 'react-toastify'
import { useAuth } from 'contexts/AuthContext'
import { useUser } from 'contexts/UserContext'
import axios from 'axios'
import {
  Check,
  Gift,
  Crown,
  Coins,
  Calendar,
  ArrowRight,
  Sparkles,
  Cross,
} from 'lucide-react'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { useLocation } from 'react-router-dom'
import { HiXMark } from 'react-icons/hi2'

interface CreditPack {
  id: number
  credits: number
  bonus: number
  price: number
  popular: boolean
}

interface PremiumPlan {
  id: number
  name: string
  price: number
  credits: number
  duration: number
  popular: boolean
  discount: number
}

const PaymentCancel: React.FC = () => {
  const { token } = useAuth()
  const { user } = useUser()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)

  if (!user) return
  const hasConfirmedRef = useRef(false)
  const [isProcessing, setIsProcessing] = useState(true)
  const [purchasedPack, setPurchasedPack] = useState<CreditPack | null>(null)
  const [purchasedPlan, setPurchasedPlan] = useState<PremiumPlan | null>(null)
  const [animationStep, setAnimationStep] = useState(0)

  // Récupération des paramètres URL
  const provider = searchParams.get('provider') || (searchParams.get('paymentId') ? 'paypal' : 'stripe')
  const paymentId = searchParams.get('paymentId')
  const payerId = searchParams.get('PayerID')
  const sessionId = searchParams.get('session_id')
  const packId = searchParams.get('packId')
  const planId = searchParams.get('planId')

  useEffect(() => {
    const cancelPayment = async () => {
      setIsProcessing(true)

      if (provider === 'stripe' && sessionId) {
        await axios.post(
          '/api/payments/stripe/cancel',
          { sessionId },
          { headers: { Authorization: `Bearer ${token}` } },
        )
      }

      if (provider === 'paypal' && paymentId && payerId) {
        await axios.post(
          '/api/payments/stripe/cancel',
          { paymentId, payerId, packId, planId },
          { headers: { Authorization: `Bearer ${token}` } },
        )
      }

      // Récupération des détails de l'achat
      if (packId) {
        const response = await axios.get(`/api/shop/credits_packs/${packId}`)
        setPurchasedPack(response.data)
      } else if (planId) {
        const response = await axios.get(`/api/shop/premium_plans/${planId}`)
        setPurchasedPlan(response.data)
      }

      setIsProcessing(false)

      // Démarrer l'animation après un délai
      setTimeout(() => setAnimationStep(1), 1000)
      setTimeout(() => setAnimationStep(2), 2000)
    }

    if (!token || hasConfirmedRef.current) return
    hasConfirmedRef.current = true

    cancelPayment()
    toast.error('Le paiement a été annulé.', ToastDefaultOptions)
  }, [token, provider, paymentId, payerId, sessionId, packId, planId])

  const handleContinue = () => {
    window.location.href = '/shop'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <motion.div
        className="max-w-2xl w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header de succès */}
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          >
            <HiXMark className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">Paiement annulé</h1>
          <p className="text-xl text-gray-300">Vous avez annulé votre achat.</p>
        </motion.div>

        {/* Détails de l'achat */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 mb-6">
            <CardContent className="p-6">
              {purchasedPack && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Coins className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-2xl font-bold text-white">Pack de Crédits</h3>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-300">Crédits de base</p>
                        <p className="text-2xl font-bold text-white">{purchasedPack.credits}</p>
                      </div>
                      {purchasedPack.bonus > 0 && (
                        <>
                          <div className="text-2xl text-green-400">+</div>
                          <div className="text-center">
                            <p className="text-sm text-green-300">Bonus</p>
                            <p className="text-2xl font-bold text-green-400">{purchasedPack.bonus}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {purchasedPlan && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Crown className="w-6 h-6 text-purple-400" />
                    <h3 className="text-2xl font-bold text-white">{purchasedPlan.name}</h3>
                    {purchasedPlan.popular && (
                      <Badge className="bg-purple-500 hover:bg-purple-600">Populaire</Badge>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-300">Durée</p>
                        <p className="text-xl font-bold text-white">{purchasedPlan.duration} jours</p>
                      </div>
                      <div className="text-center">
                        <Coins className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-300">Crédits inclus</p>
                        <p className="text-xl font-bold text-white">{purchasedPlan.credits}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Boutons d'action */}
        {animationStep >= 2 && (
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Button
              onClick={handleContinue}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
            >
              Continuer vos achats
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 px-8 py-3 rounded-lg font-semibold"
            >
              Retour au jeu
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default PaymentCancel
