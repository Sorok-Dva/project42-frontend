import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import 'styles/GamePage.css'
import { useUser } from 'context/UserContext'
import { Box } from '@mui/material'

const GamePage = () => {
  const { id: gameId } = useParams<{ id: string }>()
  const { user } = useUser()
  const playerId = user?.id

  const [isCreator, setIsCreator] = useState(false) // Si l'utilisateur est le créateur
  const [players, setPlayers] = useState<any[]>([]) // Liste des joueurs
  const [chatMessages, setChatMessages] = useState<string[]>([]) // Messages du chat
  const [newMessage, setNewMessage] = useState('') // Nouveau message du chat
  const [gameDetails, setGameDetails] = useState<any>(null) // Détails de la partie

  useEffect(() => {
    fetchGameDetails()
    fetchPlayers()
    fetchChatMessages()
  }, [])

  const fetchGameDetails = async () => {
    try {
      const { data } = await axios.get(`/api/games/${gameId}`)
      setGameDetails(data)
      setIsCreator(data.creatorId === playerId) // Vérifie si l'utilisateur est le créateur
    } catch (error) {
      console.error('Erreur lors du chargement des détails de la partie:', error)
    }
  }

  const fetchPlayers = async () => {
    try {
      const { data } = await axios.get(`/api/games/${gameId}/players`)
      setPlayers(data)
    } catch (error) {
      console.error('Erreur lors du chargement des joueurs:', error)
    }
  }

  const fetchChatMessages = async () => {
    try {
      const { data } = await axios.get(`/api/games/${gameId}/chat`)
      setChatMessages(data)
    } catch (error) {
      console.error('Erreur lors du chargement du chat:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    try {
      await axios.post(`/api/games/${gameId}/chat`, { message: newMessage, playerId })
      setNewMessage('')
      fetchChatMessages() // Actualise les messages
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
    }
  }

  const handleClearChat = async () => {
    try {
      await axios.delete(`/api/games/${gameId}/chat`)
      fetchChatMessages()
    } catch (error) {
      console.error('Erreur lors de l\'effacement du chat:', error)
    }
  }

  const handleLeaveGame = async () => {
    try {
      await axios.post(`/api/games/${gameId}/leave`, { playerId })
      alert('Vous avez quitté la partie.')
      window.location.href = '/' // Redirection
    } catch (error) {
      console.error('Erreur lors de la sortie de la partie:', error)
    }
  }

  const handleStartGame = async () => {
    try {
      await axios.post(`/api/games/${gameId}/start`)
      fetchGameDetails() // Actualiser les détails
    } catch (error) {
      console.error('Erreur lors du lancement de la partie:', error)
    }
  }

  const handleTransferCreator = async (newCreatorId: string) => {
    try {
      await axios.post(`/api/games/${gameId}/transfer`, { newCreatorId })
      fetchGameDetails() // Actualiser les détails
    } catch (error) {
      console.error('Erreur lors du transfert des droits de créateur:', error)
    }
  }

  return (
    <Box display="flex" marginTop="6rem" height="55vh">
      <div className="game-page">
        <div className="left-panel">
          {isCreator && (
            <div className="creator-panel">
              <h2>Panel du créateur</h2>
              <button onClick={handleStartGame}>Lancer la partie</button>
              <div>
                <h4>Transférer les droits de créateur :</h4>
                {players.map((player) =>
                  player.id !== playerId ? (
                    <button key={player.id} onClick={() => handleTransferCreator(player.id)}>
                      {player.nickname}
                    </button>
                  ) : null,
                )}
              </div>
            </div>
          )}
        </div>

        <div className="chat">
          <h2>Chat</h2>
          <div className="chat-messages">
            {chatMessages.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
          <input
            type="text"
            placeholder="Écrire un message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={handleSendMessage}>Envoyer</button>
          <div className="chat-controls">
            <button onClick={fetchChatMessages}>Actualiser</button>
            <button onClick={handleClearChat}>Effacer le chat</button>
            <button onClick={handleLeaveGame}>Quitter la partie</button>
          </div>
        </div>

        <div className="right-panel">
          <h2>Composition de la partie</h2>
          {gameDetails && (
            <div>
              <p>Nom : {gameDetails.name}</p>
              <p>Max joueurs : {gameDetails.maxPlayers}</p>
              <p>Statut : {gameDetails.status}</p>
            </div>
          )}
          <h2>Liste des joueurs</h2>
          <ul>
            {players.map((player) => (
              <li key={player.id}>
                {player.nickname} {player.ready ? '(Prêt)' : ''}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Box>
  )
}

export default GamePage
