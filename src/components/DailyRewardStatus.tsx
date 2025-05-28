'use client'

import React from 'react'
import { useDailyRewards } from 'contexts/DailyRewardsContext'
import { Card, CardContent, CardDescription, CardHeader } from './UI/Card'
import { Button } from './UI/Button'
import { Progress } from './UI/Progress'
import { Gift } from 'lucide-react'

const DailyRewardsStatus: React.FC = () => {
  const { rewards, currentStreak, canClaimToday, claimReward, showPopup } = useDailyRewards()

  const canClaim = canClaimToday

  const currentDay = Math.min(currentStreak + (canClaim ? 1 : 0), 7)

  const weekProgress = (currentStreak / 7) * 100

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardDescription>
            Connectez-vous chaque jour pour obtenir des récompenses
          </CardDescription>
          {canClaim && (
            <div className="animate-pulse">
              <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                Disponible
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Progression de la semaine */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-400">Progression de la semaine</span>
              <span className="text-sm font-medium">{currentDay}/7 jours</span>
            </div>
            <Progress value={weekProgress} className="h-2" />
          </div>

          {/* Grille des jours */}
          <div className="grid grid-cols-7 gap-1">
            {rewards.map((reward, idx) => {
              const isPast = idx < currentStreak
              const isCurrent = idx === currentStreak && canClaim
              // futur = pas encore dispo
              const isFuture = idx > currentStreak || (idx === currentStreak && !canClaim)

              return (
                <div
                  key={reward.day}
                  className={`relative flex flex-col items-center justify-center p-1 rounded-md ${
                    isCurrent
                      ? 'bg-indigo-900/50 border border-indigo-500'
                      : isPast
                        ? 'bg-gray-700/50 border border-gray-600'
                        : 'bg-gray-800/30 border border-gray-700'
                  }`}
                >
                  <span className="text-xs">Jour {reward.day}</span>
                  <span className="text-xs font-bold text-yellow-400">{reward.credits} crédits</span>

                  {isPast && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-2 w-2 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Bouton de claim */}
          {canClaim ? (
            <Button
              onClick={claimReward}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Gift className="h-4 w-4 mr-2" />
              Réclamer {rewards[currentStreak]?.credits || 0} crédits
            </Button>
          ) : (
            <Button disabled className="w-full bg-gray-700 cursor-not-allowed">
              Déjà réclamé aujourd'hui
            </Button>
          )}

          {/* Bonus semaine complète */}
          {currentDay === 7 && (
            <div className="p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-center">
              <span className="text-yellow-300 text-sm">
                Bonus de semaine complète disponible! 🎉
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default DailyRewardsStatus
