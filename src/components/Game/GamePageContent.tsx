import React, { useCallback, useEffect, useState } from 'react'
import { Box } from '@mui/material'
import { Container, Spinner } from 'reactstrap'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'

import { useAuth } from 'contexts/AuthContext'
import { useUser } from 'contexts/UserContext'
import { useSocket } from 'contexts/SocketContext'
import { useGameContext } from 'contexts/GameContext'

import {
  fetchGameDetails,
  leaveGame,
} from 'services/gameService'
import Controls from './Controls'
import Chat from './Chat'
import PlayersList from './PlayersList'
import { getRandomColor } from 'utils/getRandomColor'

import 'styles/Game.scss'
import Composition from './Composition'
import { parallaxStars, staticStars } from 'utils/animations'

export const GAME_TYPES: Record<number, string> = {
  0: 'Normal',
  1: 'Fun',
  2: 'Sérieuse',
  3: 'Carnage',
}

/**
 * The GamePage component manages and renders the game interface, user interactions, and real-time updates.
 * It integrates various elements like player controls, chat, and a list of players.
 *
 * @return {JSX.Element} The rendered JSX for the main game interface, including headers, chat, controls, and player list.
 */
const GamePage = () => {
  const { id: gameId } = useParams<{ id: string }>()
  const { user } = useUser()
  const { token } = useAuth()
  const { socket } = useSocket()

  const [highlightedPlayers, setHighlightedPlayers] = useState<{ [nickname: string]: string }>({})

  /**
   * Toggles the highlighting of a player based on their nickname.
   * If the player is already highlighted, they will be removed from the highlighted list.
   * If the player is not highlighted, they will be added with a random color.
   *
   * @param {string} nickname - The nickname of the player to toggle highlighting for.
   * @returns {void}
   */
  const toggleHighlightPlayer = (nickname: string) => {
    setHighlightedPlayers((prev) => {
      if (prev[nickname]) {
        const newState = { ...prev }
        delete newState[nickname]
        return newState
      } else {
        return { ...prev, [nickname]: getRandomColor() }
      }
    })
  }

  // Hook custom "useGame"
  const {
    roomData,
    player,
    viewer,
    viewers,
    players,
    creator,
    isCreator,
    messages,
    canBeReady,
    canStartGame,
    gameError,
    error,
    loading,
    isNight,
    gameStarted,
    gameFinished,
    passwordRequired,
    isAuthorized,
    password,
    alienList,
    sistersList,
    brothersList,
    coupleList,
    slots,
    isArchive,
    isInn,
    innList,
    setIsArchive,
    setSlots,
    setPlayer,
    handlePasswordSubmit,
    setPassword,
    setGameError,
    setRoomData,
    setMessages,
    setIsCreator,
    setGameStarted,
    setGameFinished,
  } = useGameContext()

  // Debug - Écouter tous les événements socket
  useEffect(() => {
    if (!socket) return

    socket.onAny((eventName, ...args) => {
      console.log(`Événement reçu : ${eventName}`, args)
    })

    socket.on('bipNotReadyPlayers', () => {
      // Afficher une notification uniquement si le joueur n'est pas prêt
      if (player && !player.ready && player.nickname !== creator?.nickname) {
        // Créer une notification sonore
        const notificationSound = new Audio('/assets/sounds/sos.mp3')
        notificationSound.play().catch((err) => console.error('Erreur lors de la lecture du son:', err))

        // Afficher une alerte visuelle
        const notificationDiv = document.createElement('div')
        notificationDiv.className =
          'fixed top-4 right-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white p-4 rounded-lg shadow-lg z-50 animate-bounce'
        notificationDiv.innerHTML = `
          <p class="font-bold">Attention !</p>
          <p>${creator?.nickname} vous demande de vous mettre prêt !</p>
        `
        document.body.appendChild(notificationDiv)

        // Supprimer la notification après 5 secondes
        setTimeout(() => {
          notificationDiv.classList.add('opacity-0', 'transition-opacity')
          setTimeout(() => {
            document.body.removeChild(notificationDiv)
          }, 500)
        }, 5000)
      }
    })

    return () => {
      socket.offAny()
      socket.off('bipNotReadyPlayers')
    }
  }, [socket, player])

  useEffect(() => {
    setIsCreator(player?.nickname === creator?.nickname)
  }, [creator])

  /**
   * Requête pour recharger certains détails du jeu (ex : titre, etc.)
   * @todo check if this is used anymore
   */
  const handleFetchGameDetails = useCallback(async () => {
    if (!gameId) return
    try {
      const data = await fetchGameDetails(gameId, token || undefined)
      setRoomData(data.room)
      if (data.player) setPlayer(data.player)
      setGameStarted(data.room.status === 'in_progress')
      setGameFinished(data.room.status === 'completed')
    } catch (error) {
      console.error('Erreur lors du fetchGameDetails: ', error)
    }
  }, [gameId])

  /**
   * Gère l'effacement du chat côté front
   */
  const handleClearChat = () => {
    setMessages([])
  }

  /**
   * Quitter la partie
   */
  const handleLeaveGame = async () => {
    if (!socket || !gameId) return
    if (confirm('Êtes-vous sûr de vouloir quitter la partie ?')) {
      try {
        const response = await leaveGame(token)
        if (response.message) {
          socket.emit('leaveRoom', {
            roomId: gameId,
            player: player ? { id: user?.id, nickname: user?.nickname } : null,
            viewer,
          })
        }
        localStorage.removeItem(`game_auth_${gameId}`)
        setGameError('Vous avez bien quitté la partie. Vous pouvez fermer cet onglet.')
      } catch (error) {
        console.error('Erreur lors de la sortie de la partie:', error)
      }
    }
  }

  if (gameError) {
    localStorage.setItem('gameFinished', 'true')

    const isLeaveMessage = gameError.includes('Vous avez bien quitté la partie.')
    return (
      <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black flex items-center justify-center text-white">
        <div className="absolute inset-0 z-0">{ staticStars }</div>

        {/* Nébuleuses colorées */ }
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 opacity-40"
            style={ {
              background:
                'radial-gradient(circle at 70% 30%, rgba(111, 66, 193, 0.6), transparent 60%), radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.6), transparent 60%), radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3), transparent 70%)',
            } }
          />
        </div>

        {/* Étoiles avec parallaxe */ }
        <div className="absolute inset-0 z-1">{ parallaxStars }</div>

        <motion.div
          className={`z-20 bg-black/60 backdrop-blur-md rounded-xl border ${isLeaveMessage ? 'border-green-500/30' : 'border-red-500/30'} p-8 max-w-md text-center`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {!isLeaveMessage && <div className="text-red-500 text-5xl mb-4">⚠️</div>}
          <h1 className={`text-2xl font-bold mb-4 ${isLeaveMessage ? 'text-green-400' : 'text-red-400'}`}>
            {isLeaveMessage ? 'Partie quittée' : 'Erreur'}
          </h1>
          <p className="text-gray-300 mb-6">{gameError}</p>
          <button
            onClick={() => window.close()}
            className={`px-4 py-2 ${isLeaveMessage ? 'bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900' : 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900'} text-white rounded-lg transition-all`}
          >
            Fermer
          </button>
        </motion.div>
      </div>
    )
  }

  if (passwordRequired && !isAuthorized) {
    return (
      <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black flex items-center justify-center text-white">
        <div className="absolute inset-0 z-0">{ staticStars }</div>

        {/* Nébuleuses colorées */ }
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 opacity-40"
            style={ {
              background:
                'radial-gradient(circle at 70% 30%, rgba(111, 66, 193, 0.6), transparent 60%), radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.6), transparent 60%), radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3), transparent 70%)',
            } }
          />
        </div>

        {/* Étoiles avec parallaxe */ }
        <div className="absolute inset-0 z-1">{ parallaxStars }</div>

        <motion.div
          className="bg-black/60 backdrop-blur-md rounded-xl border border-blue-500/30 p-8 max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-blue-500 text-5xl mb-4 flex justify-center">🔒</div>
          <h1 className="text-2xl font-bold mb-4 text-center">Partie protégée</h1>
          <p className="text-blue-300 mb-6 text-center">Entrez le mot de passe pour rejoindre la partie.</p>

          <div className="space-y-4">
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            />

            <motion.button
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePasswordSubmit}
            >
              Valider
            </motion.button>

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">{error}</div>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  return isAuthorized && creator ? (
    <>
      <Box className="game-page" display="flex" flexDirection="column"
        sx={{
          backgroundImage: (isNight || gameFinished) ?
            'url(/assets/images/games/background-night.png)'
            : 'url(/assets/images/games/background2.png)',
          backgroundSize: 'cover',
        }}
      >
        {/* En-tête */}
        <div className="relative z-10 bg-gradient-to-r from-black/80 to-blue-900/30 backdrop-blur-sm border-b border-blue-500/30 shadow-lg">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                <span className="font-bold text-lg">P42</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  <span className="text-blue-300">[{GAME_TYPES[roomData.type]}]</span> {roomData.name}
                </h1>
                <p className="text-sm text-blue-300">
                  {players.length}/{slots} joueurs • {isNight ? 'Phase nocturne' : 'Phase diurne'}
                </p>
              </div>
            </div>

            {!isArchive && (
              <div className="flex gap-2">
                <motion.button
                  className="px-3 py-1 bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearChat}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Effacer
                </motion.button>
                <motion.button
                  className="px-3 py-1 bg-red-900/40 hover:bg-red-900/60 text-red-300 hover:text-white border border-red-500/30 rounded-lg transition-all flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLeaveGame}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-4-4H3zm9 2.586L14.586 8H12V5.586zM5 5h5v2H5V5zm0 4h10v6H5V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Quitter
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Contenu principal */}
        <Box display="flex" flex={1} p={2} className="game-page-container">
          {/* Colonne gauche : Controls */}
          <Box
            display="flex"
            flexDirection="column"
            width="25%"
            className="left-column"
            mr={2}
          >
            <Box mb={2}>
              <Controls
                gameId={gameId}
                roomData={roomData}
                fetchGameDetails={handleFetchGameDetails}
                isCreator={isCreator}
                creator={creator}
                canBeReady={canBeReady}
                canStartGame={canStartGame}
                player={player}
                players={players}
                gameStarted={gameStarted}
                gameFinished={gameFinished}
                isArchive={isArchive}
                setGameStarted={setGameStarted}
                slots={slots}
                setSlots={setSlots}
                setRoomData={setRoomData}
                isInn={isInn}
                viewer={viewer}
                setPlayer={setPlayer}
              />
            </Box>
          </Box>

          {/* Colonne centrale : Chat */}
          <Box
            display="flex"
            flexDirection="column"
            width="50%"
            className="chat-column"
            mr={2}
            height="85vh"
          >
            {loading ? (
              <Container className="loader-container loader-container-two">
                <div className="spinner-wrapper">
                  <Spinner className="custom-spinner" />
                  <div className="loading-text">Chargement du chat...</div>
                </div>
              </Container>
            ) : (
              <Chat
                gameId={gameId!}
                playerId={user?.id}
                player={player ?? undefined}
                viewer={viewer ?? undefined}
                players={players}
                user={user ?? undefined}
                userRole={user?.role}
                messages={messages}
                highlightedPlayers={highlightedPlayers}
                isNight={isNight}
                gameStarted={gameStarted}
                gameFinished={gameFinished}
                isArchive={isArchive}
                isInn={isInn}
              />
            )}
          </Box>

          {/* Colonne droite : Liste des joueurs */}
          <Box
            display="flex"
            flexDirection="column"
            width="25%"
            className="right-column"
          >
            <Composition roomData={roomData} />
            <PlayersList
              players={players}
              player={player}
              viewers={viewers}
              viewer={viewer}
              isCreator={isCreator}
              creatorNickname={creator!.nickname}
              gameId={gameId!}
              socket={socket}
              toggleHighlightPlayer={toggleHighlightPlayer}
              highlightedPlayers={highlightedPlayers}
              gameStarted={gameStarted}
              gameFinished={gameFinished}
              alienList={alienList}
              sistersList={sistersList}
              brothersList={brothersList}
              coupleList={coupleList}
              isNight={isNight}
              isInn={isInn}
              innList={innList}
            />
          </Box>
        </Box>
      </Box>

      <div className="relative z-10 bg-gradient-to-r from-black/80 to-blue-900/30 backdrop-blur-sm border-t border-blue-500/30 py-2 px-4 text-xs text-blue-300">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            {!isArchive ? 'Partie' : 'Archive'} #{gameId} • v{process.env.REACT_APP_GAME_VERSION}
          </div>
          {player && (
            <div>
              Connecté en tant que: <span className="text-white font-medium">{player.nickname}</span>
            </div>
          )}
        </div>
      </div>
    </>
  ): (
    <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black flex items-center justify-center text-white">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="mt-4 text-blue-300">Chargement de la partie...</p>
      </div>
    </div>
  )
}

export default GamePage
