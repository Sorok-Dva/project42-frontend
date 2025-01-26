import axios from 'axios'

/**
 * Récupère les informations globales d'une salle/room (roomData + player courant)
 */
export const fetchRoomData = async (gameId: string, token?: string) => {
  const response = await axios.get(`/api/games/room/${gameId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

/**
 * Récupère les détails d'une partie (gameDetails)
 */
export const fetchGameDetails = async (gameId: string) => {
  const response = await axios.get(`/api/games/room/${gameId}`)
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
 * Récupère l'historique du chat
 */
export const fetchChatMessages = async (gameId: string) => {
  const response = await axios.get(`/api/games/room/${gameId}/tchat`)
  return response.data
}

/**
 * Lance la partie
 */
export const startGame = async (gameId: string) => {
  const response = await axios.post(`/api/games/${gameId}/start`)
  return response.data
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
