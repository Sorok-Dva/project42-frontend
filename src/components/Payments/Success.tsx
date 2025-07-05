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

const PaymentSuccess: React.FC = () => {
  const { token } = useAuth()
  const { user, setUser } = useUser()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)

  if (!user) return
  const hasConfirmedRef = useRef(false)
  const [isProcessing, setIsProcessing] = useState(true)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [purchasedPack, setPurchasedPack] = useState<CreditPack | null>(null)
  const [purchasedPlan, setPurchasedPlan] = useState<PremiumPlan | null>(null)
  const [animationStep, setAnimationStep] = useState(0)
  const [creditsAnimation, setCreditsAnimation] = useState(0)
  const [premiumDaysAnimation, setPremiumDaysAnimation] = useState(0)

  // Récupération des paramètres URL
  const provider = searchParams.get('provider') || (searchParams.get('paymentId') ? 'paypal' : 'stripe')
  const paymentId = searchParams.get('paymentId')
  const payerId = searchParams.get('PayerID')
  const sessionId = searchParams.get('session_id')
  const packId = searchParams.get('packId')
  const planId = searchParams.get('planId')

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        setIsProcessing(true)

        // Confirmation du paiement
        if (provider === 'paypal' && paymentId && payerId && token) {
          const response = await axios.post(
            '/api/payments/paypal/execute',
            { paymentId, payerId },
            { headers: { Authorization: `Bearer ${token}` } },
          )

          if (response.data.error) {
            setPaymentConfirmed(false)
            setPaymentError(response.data.error)
          } else {
            setPaymentConfirmed(true)
            toast.success('Paiement confirmé ! Votre achat a été traité avec succès.', ToastDefaultOptions)
          }
        } else if (provider === 'stripe' && sessionId) {
          const response = await axios.post(
            '/api/payments/stripe/confirm',
            { sessionId },
            { headers: { Authorization: `Bearer ${token}` } },
          )

          if (response.data.error) {
            setPaymentConfirmed(false)
            setPaymentError(response.data.error)
          } else {
            setPaymentConfirmed(true)
            toast.success('Paiement confirmé ! Votre achat a été traité avec succès.', ToastDefaultOptions)
          }
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
      } catch (error) {
        console.error('Erreur lors de la validation du paiement:', error)
        setIsProcessing(false)
        setPaymentConfirmed(false)
        toast.error('Une erreur est survenue lors de la validation du paiement.', ToastDefaultOptions)
      }
    }

    if (!token || hasConfirmedRef.current) return
    hasConfirmedRef.current = true

    if (token) {
      confirmPayment()
    }
  }, [token, provider, paymentId, payerId, sessionId, packId, planId])

  // Animation des crédits
  useEffect(() => {
    if (animationStep >= 2 && purchasedPack && user) {
      const totalCredits = purchasedPack.credits + purchasedPack.bonus
      const startCredits = (user.credits || 0)
      const duration = 2000
      const steps = 60
      const increment = totalCredits / steps

      let currentStep = 0
      const interval = setInterval(() => {
        currentStep++
        setCreditsAnimation(Math.floor(startCredits + increment * currentStep))

        if (currentStep >= steps) {
          clearInterval(interval)
          setCreditsAnimation(user.credits || 0)
        }
      }, duration / steps)

      if (user) {
        user.credits = startCredits + totalCredits
        setUser(user)
      }
      return () => clearInterval(interval)
    }
  }, [animationStep, purchasedPack, user])

  useEffect(() => {
    if (animationStep >= 2 && purchasedPlan && user) {
      const totalCredits = purchasedPlan.credits
      const startCredits = (user.credits || 0)
      const duration = 2000
      const steps = 60
      const increment = totalCredits / steps

      let currentStep = 0
      const interval = setInterval(() => {
        currentStep++
        setCreditsAnimation(Math.floor(startCredits + increment * currentStep))

        if (currentStep >= steps) {
          clearInterval(interval)
          setCreditsAnimation(user.credits || 0)
        }
      }, duration / steps)

      if (user) {
        user.credits = startCredits + totalCredits
        setUser(user)
      }
      return () => clearInterval(interval)
    }
  }, [animationStep, purchasedPlan, user])


  // Animation des jours premium
  useEffect(() => {
    if (animationStep >= 2 && purchasedPlan && user) {
      const duration = 2000
      const steps = 60
      const increment = purchasedPlan.duration / steps

      let currentStep = 0
      const interval = setInterval(() => {
        currentStep++
        setPremiumDaysAnimation(Math.floor(increment * currentStep))

        if (currentStep >= steps) {
          clearInterval(interval)
          setPremiumDaysAnimation(purchasedPlan.duration)
        }
      }, duration / steps)

      return () => clearInterval(interval)
    }
  }, [animationStep, purchasedPlan])

  const handleContinue = () => {
    window.location.href = '/shop'
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Validation du paiement...</h2>
          <p className="text-gray-300">Veuillez patienter pendant que nous confirmons votre achat.</p>
        </motion.div>
      </div>
    )
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
          { paymentConfirmed ? (
            <>
              <motion.div
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold text-white mb-2">Paiement réussi !</h1>
              <p className="text-xl text-gray-300">Merci pour votre achat</p>
            </>
          ) : (
            <>
              <motion.div
                className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              >
                <HiXMark className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold text-white mb-2">Paiement échoué</h1>
              <p className="text-xl text-gray-300">Erreur : {paymentError}</p>
            </>
          )}
        </motion.div>

        {/* Détails de l'achat */}
        { paymentConfirmed && (
          <AnimatePresence>
            {animationStep >= 1 && (
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

                        {animationStep >= 2 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-center"
                          >
                            <p className="text-gray-300 mb-2">Vos crédits actuels :</p>
                            <motion.div
                              className="text-4xl font-bold text-yellow-400 flex items-center justify-center gap-2"
                              key={creditsAnimation}
                            >
                              <Sparkles className="w-8 h-8" />
                              {creditsAnimation.toLocaleString()}
                              <Sparkles className="w-8 h-8" />
                            </motion.div>
                          </motion.div>
                        )}
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

                        {animationStep >= 2 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-center"
                          >
                            <p className="text-gray-300 mb-2">Premium ajouté :</p>
                            <motion.div
                              className="text-4xl font-bold text-purple-400 flex items-center justify-center gap-2"
                              key={premiumDaysAnimation}
                            >
                              <Crown className="w-8 h-8" />+{premiumDaysAnimation} jours
                              <Crown className="w-8 h-8" />
                            </motion.div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Informations utilisateur */}
        {animationStep >= 2 && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 mb-6">
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-green-400" />
                  Votre compte
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-black/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Coins className="w-5 h-5 text-yellow-400" />
                      <span className="text-gray-300">Crédits totaux</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-400">{creditsAnimation.toLocaleString()}</p>
                  </div>
                  {user.premium && (
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-5 h-5 text-purple-400" />
                        <span className="text-gray-300">Statut Premium</span>
                      </div>
                      <p className="text-lg font-semibold text-purple-400">
                        {new Date(user.premium) > new Date() ? 'Actif' : 'Expiré'}
                      </p>
                      {new Date(user.premium) > new Date() && (
                        <p className="text-sm text-gray-200">jusqu'au {new Date(user.premium).toLocaleDateString()} {new Date(user.premium).toLocaleTimeString()}</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

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

export default PaymentSuccess
