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

    const last = new Date(state.lastClaimDate)
    const now = new Date()
    const diff = now.getTime() - last.getTime()
    // on autorise le claim uniquement si au moins 24 h se sont écoulées
    return diff >= 86400000
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
      const now = new Date()
      const last = lastClaimDate ? new Date(lastClaimDate) : null
      const diff = last ? now.getTime() - last.getTime() : Infinity
      const canClaim = diff >= 86400000

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
      const now = new Date()
      const last = state.lastClaimDate ? new Date(state.lastClaimDate): null

      const oneDayMs = 24 * 60 * 60 * 1000
      const twoDaysMs = 2 * oneDayMs

      // 1) Calcul du nouveau streak (1 à 7, reset sinon)
      let newStreak = 1
      if (last) {
        const diff = now.getTime() - last.getTime()
        // si on est entre 24 h et 48 h depuis le dernier claim ET streak < 7, on incrémente
        if (diff >= oneDayMs && diff < twoDaysMs && state.currentStreak < 7) {
          newStreak = state.currentStreak + 1
        }
        // sinon newStreak reste à 1 (reset automatique)
      }

      // 2) On récupère la récompense du jour (en fonction de newStreak)
      const todayReward = state.rewards.find((r) => r.day === newStreak)
      if (!todayReward) return

      await axios.post(
        '/api/daily-rewards/claim',
        { day: newStreak },
        { headers: { Authorization: `Bearer ${ token }` } },
      )

      if (setUser) {
        setUser({
          ...user,
          credits: (user.credits || 0) + todayReward.credits,
        })
      }

      const updatedRewards = state.rewards.map((reward) =>
        reward.day === newStreak
          ? { ...reward, claimed: true }
          : reward,
      )

      const newState = {
        currentStreak: newStreak,
        lastClaimDate: now.toISOString(),
        rewards: updatedRewards,
        showPopup: false,
      }
      setState(newState)
      localStorage.setItem('dailyRewards', JSON.stringify(newState))

      toast.success(
        `Vous avez reçu ${ todayReward.credits } crédits pour votre connexion du jour ${ newStreak }!`,
        ToastDefaultOptions,
      )

      if (newStreak === 7) {
        toast.info(
          'Félicitations ! Vous avez complété une semaine entière de connexions !',
          { ...ToastDefaultOptions, autoClose: 5000 },
        )
      }
    } catch (error) {
      console.error('Erreur lors de la réclamation de la récompense :', error)
      toast.error(
        'Une erreur est survenue lors de la réclamation de votre récompense.',
        ToastDefaultOptions,
      )
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
