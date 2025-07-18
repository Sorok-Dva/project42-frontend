import axios from 'axios'

/**
 * Récupère les détails d'une partie (gameDetails) (roomData + player courant)
 */
export const fetchGameDetails = async (gameId: string, token?: string | null) => {
  const response = await axios.get(`/api/games/room/${gameId}`, token ? {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  } : {})
  return response.data
}

/**
 * Lance la partie
 */
export const startGame = async (gameId: string, token: string | null) => {
  try {
    const response = await axios.post(`/api/games/room/${gameId}/start`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.error || error.message)
    }
    throw error
  }
}

/**
 * Ajoute un bot au salon
 */
export const addBotToGame = async (gameId: string, token: string | null) => {
  const response = await axios.post(
    `/api/admin/games/room/${gameId}/add-bot`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )
  return response.data
}

/**
 * Ajuste le temps de débat la room
 */
export const updateRoomTimer = async (timer: number, gameId: string, token: string | null) => {
  const response = await axios.put(
    `/api/games/room/${gameId}/timer`,
    { timer },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )
  return response
}

/**
 * Transfère les droits du créateur vers un autre joueur
 */
export const transferCreatorRights = async (gameId: string, nickname: string, token: string) => {
  const response = await axios.post(`/api/games/room/${gameId}/setLeader`, { nickname }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  return response.data
}

/**
 * Quitter la partie
 */
export const leaveGame = async (token: string | null) => {
  const response = await axios.post(
    '/api/games/players/room/leave',
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )
  return response.data
}

/**
 * Ajoute la partie dans les favoris
 */
export const addFavoriteGame = async (gameId: string, action: 'add' | 'delete', comment: string, token: string | null) => {
  const response = await axios.post(
    `/api/games/favorite/${gameId}/${action}`,
    { comment },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )
  return response.data
}

/**
 * Lie un salon vocal Discord à la partie
 */
export const linkDiscordChannel = async (
  gameId: string,
  channelId: string,
  token: string | null,
) => {
  const response = await axios.post(
    `/api/games/room/${gameId}/discord-channel`,
    { channelId },
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return response.data
}

/**
 * Récupère la liste des joueurs présents dans le salon vocal Discord
 */
export const fetchDiscordVoiceStatus = async (gameId: string) => {
  const response = await axios.get('/api/discord/voice-status', {
    params: { gameId },
  })
  return response.data
}

