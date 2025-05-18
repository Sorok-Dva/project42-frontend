export interface DailyReward {
  day: number
  credits: number
  claimed: boolean
}

export interface DailyRewardsState {
  currentStreak: number
  lastClaimDate: string | null
  rewards: DailyReward[]
  showPopup: boolean
}
