'use client'

import type React from 'react'
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'
import { useUser } from './UserContext'
import type { DailyReward, DailyRewardsState } from '../types/dailyReward'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from '../utils/toastOptions'

interface DailyRewardsContextType {
  rewards: DailyReward[]
  currentStreak: number
  showPopup: boolean
  canClaimToday: boolean
  claimReward: () => Promise<void>
  closePopup: () => void
  checkRewards: () => Promise<void>
}

const DailyRewardsContext = createContext<DailyRewardsContextType | undefined>(undefined)

export const useDailyRewards = () => {
  const context = useContext(DailyRewardsContext)
  if (!context) {
    throw new Error('useDailyRewards must be used within a DailyRewardsProvider')
  }
  return context
}

const DEFAULT_REWARDS: DailyReward[] = [
  { day: 1, credits: 50, claimed: false },
  { day: 2, credits: 100, claimed: false },
  { day: 3, credits: 150, claimed: false },
  { day: 4, credits: 200, claimed: false },
  { day: 5, credits: 250, claimed: false },
  { day: 6, credits: 300, claimed: false },
  { day: 7, credits: 500, claimed: false }, // Bonus pour une semaine complète
]

export const DailyRewardsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token } = useAuth()
  const { user, setUser } = useUser()
  const [state, setState] = useState<DailyRewardsState>({
    currentStreak: 0,
    lastClaimDate: null,
    rewards: [...DEFAULT_REWARDS],
    showPopup: false,
  })

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  const isConsecutiveDay = (lastDate: Date, currentDate: Date) => {
    const oneDayInMs = 24 * 60 * 60 * 1000
    const twoDaysInMs = 2 * oneDayInMs

    const diffInMs = currentDate.getTime() - lastDate.getTime()

    // Considérer comme consécutif si c'est le jour suivant ou le même jour
    return diffInMs < twoDaysInMs
  }

  const canClaimToday = (): boolean => {
    if (!state.lastClaimDate) return true

    const lastClaimDate = new Date(state.lastClaimDate)
    const today = new Date()

    // Ne peut pas réclamer deux fois le même jour
    return !isSameDay(lastClaimDate, today)
  }

  const checkRewards = async () => {
    if (!token || !user) return

    try {
      // Récupérer les données de récompenses depuis l'API
      const response = await axios.get('/api/daily-rewards', {
        headers: { Authorization: `Bearer ${token}` },
      })

      const { currentStreak, lastClaimDate, rewards } = response.data

      // Vérifier si l'utilisateur peut réclamer aujourd'hui
      const canClaim = lastClaimDate ? !isSameDay(new Date(lastClaimDate), new Date()) : true

      setState({
        currentStreak,
        lastClaimDate,
        rewards: rewards || [...DEFAULT_REWARDS],
        showPopup: canClaim, // Afficher la popup si l'utilisateur peut réclamer
      })
    } catch (error) {
      console.error('Erreur lors de la vérification des récompenses journalières:', error)

      // Fallback sur les données locales si l'API échoue
      const storedData = localStorage.getItem('dailyRewards')
      if (storedData) {
        const parsedData = JSON.parse(storedData)
        setState({
          ...parsedData,
          showPopup: canClaimToday(),
        })
      }
    }
  }

  const claimReward = async () => {
    if (!token || !user || !canClaimToday()) return

    try {
      const today = new Date().toISOString()
      const newStreak = state.lastClaimDate
        ? isConsecutiveDay(new Date(state.lastClaimDate), new Date())
          ? state.currentStreak + 1
          : 1
        : 1

      // Limiter le streak à 7 jours (une semaine)
      const limitedStreak = Math.min(newStreak, 7)

      // Trouver la récompense du jour
      const todayReward = state.rewards.find((r) => r.day === limitedStreak)

      if (!todayReward) return

      // Appeler l'API pour réclamer la récompense
      const response = await axios.post(
        '/api/daily-rewards/claim',
        {
          day: limitedStreak,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Mettre à jour les crédits de l'utilisateur
      if (user && setUser) {
        setUser({
          ...user,
          credits: (user.credits || 0) + todayReward.credits,
        })
      }

      // Mettre à jour l'état local
      const updatedRewards = state.rewards.map((reward) =>
        reward.day === limitedStreak ? { ...reward, claimed: true } : reward,
      )

      const newState = {
        currentStreak: limitedStreak,
        lastClaimDate: today,
        rewards: updatedRewards,
        showPopup: false,
      }

      setState(newState)

      // Sauvegarder dans localStorage comme fallback
      localStorage.setItem('dailyRewards', JSON.stringify(newState))

      toast.success(
        `Vous avez reçu ${todayReward.credits} crédits pour votre connexion du jour ${limitedStreak}!`,
        ToastDefaultOptions,
      )

      // Si c'est le 7ème jour, féliciter l'utilisateur
      if (limitedStreak === 7) {
        toast.info('Félicitations! Vous avez complété une semaine entière de connexions!', {
          ...ToastDefaultOptions,
          autoClose: 5000,
        })
      }
    } catch (error) {
      console.error('Erreur lors de la réclamation de la récompense:', error)
      toast.error('Une erreur est survenue lors de la réclamation de votre récompense.', ToastDefaultOptions)
    }
  }

  const closePopup = () => {
    setState((prev) => ({ ...prev, showPopup: false }))
  }

  // Vérifier les récompenses au chargement
  useEffect(() => {
    if (token && user) {
      checkRewards()
    }
  }, [token, user])

  return (
    <DailyRewardsContext.Provider
      value={{
        rewards: state.rewards,
        currentStreak: state.currentStreak,
        showPopup: state.showPopup,
        canClaimToday: canClaimToday(),
        claimReward,
        closePopup,
        checkRewards,
      }}
    >
      {children}
    </DailyRewardsContext.Provider>
  )
}
