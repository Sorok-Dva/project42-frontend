import axios from 'axios'
import { RoomCard } from 'hooks/useGame'

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
 * Récupère la liste des joueurs
 */
export const fetchPlayers = async (gameId: string) => {
  const response = await axios.get(`/api/games/room/${gameId}/players`)
  return response.data
}

/**
 * Récupère la liste des joueurs
 */
export const fetchViewers = async (gameId: string) => {
  const response = await axios.get(`/api/games/room/${gameId}/viewers`)
  return response.data
}

/**
 * Récupère l'historique du chat
 */
export const fetchChatMessages = async (gameId: string, token: string | null) => {
  const response = await axios.get(
    `/api/games/room/${gameId}/tchat`,
    token ? {
      headers: { Authorization: `Bearer ${token}` },
    } : {}
  )
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
 * Indique qu'un joueur est "ready"
 */
export const setPlayerReady = async (gameId: string, token: string | null) => {
  const response = await axios.post(
    `/api/games/room/${gameId}/ready`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )
  return response
}

/**
 * Ajuste le nombre de joueur pour la room
 */
export const updateMaxPlayers = async (maxPlayers: number, gameId: string, token: string | null) => {
  const response = await axios.put(
    `/api/games/room/${gameId}/maxPlayers`,
    { maxPlayers },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )
  return response
}

/**
 * Modifie les cartes du salon
 */
export const updateRoomCards = async (cards: RoomCard[], gameId: string, token: string | null) => {
  const response = await axios.put(
    `/api/games/room/${gameId}/cards`,
    { cards },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )
  return response
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
export const transferCreatorRights = async (gameId: string, newCreatorId: string) => {
  const response = await axios.post(`/api/games/${gameId}/transfer`, { newCreatorId })
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
export const addFavoriteGame = async (gameId: string, token: string | null) => {
  const response = await axios.post(
    `/api/admin/games/favorite/${gameId}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )
  return response.data
}

