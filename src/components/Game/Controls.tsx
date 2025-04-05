import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { usePermissions } from 'hooks/usePermissions'
import {
  addBotToGame,
  startGame,
  setPlayerReady,
  updateMaxPlayers,
  updateRoomTimer,
  updateRoomCards,
  addFavoriteGame,
} from 'services/gameService'
import { useAuth } from 'contexts/AuthContext'
import { useUser } from 'contexts/UserContext'
import GameTimer from './Timer'
import PhaseAction from './PhaseAction'
import { PlayerType, RoomData } from 'hooks/useGame'
import EditCompoModal from 'components/Game/EditComposition'
import TransferLeadModal from 'components/Game/TransferLead'
import axios from 'axios'
import CardImage from 'components/Game/CardImage'

interface GameControlsProps {
  gameId: string | undefined
  roomData: RoomData
  player: PlayerType | null
  players: PlayerType[]
  isCreator: boolean
  canBeReady: boolean
  canStartGame: boolean
  gameStarted: boolean
  gameFinished: boolean
  setGameStarted: (gameStarted: boolean) => void
  fetchGameDetails: () => void
  slots: number
  isArchive: boolean
  setSlots: React.Dispatch<React.SetStateAction<number>>
  setRoomData: React.Dispatch<React.SetStateAction<RoomData>>
  isInn: boolean
}

/**
 * Contrôles du salon
 */
const GameControls: React.FC<GameControlsProps> = ({
  isCreator,
  roomData,
  gameId,
  fetchGameDetails,
  canBeReady,
  canStartGame,
  player,
  players,
  gameStarted,
  gameFinished,
  setGameStarted,
  slots,
  setSlots,
  setRoomData,
  isArchive,
  isInn,
}) => {
  const { token } = useAuth()
  const { user } = useUser()
  const { checkPermission } = usePermissions()
  const canAddBot = checkPermission('godPowers', 'addBot')
  const canEditGame = checkPermission('game', 'edit')
  const [timer, setTimer] = useState<number>(3)
  const [isEditCompositionOpen, setIsEditCompositionOpen] = useState(false)
  const [isTransferLeadOpen, setIsTransferLeadOpen] = useState(false)
  const [isFavoriteArchive, setIsFavoriteArchive] = useState<boolean>(false)
  const [favoriteComment, setFavoriteComment] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])
  const openEditComposition = () => {
    if (!isCreator || isArchive) return
    setIsEditCompositionOpen(true)
  }
  const closeEditComposition = async () => {
    if (!isCreator || isArchive) return
    try {
      if (roomData.maxPlayers !== slots) {
        const response = await updateMaxPlayers(slots, String(gameId), token)
        if (response.status !== 200) {
          setSlots(roomData.maxPlayers)
        } else setRoomData({ ...roomData, maxPlayers: slots })
      }

      await updateRoomCards(roomData.cards, String(gameId), token)

      setIsEditCompositionOpen(false)
    } catch (e) {
      if (axios.isAxiosError(e)) {
        alert(e.response?.data.error)
      } else {
        alert(e)
      }
    }
  }

  const handleAddBot = async () => {
    if (!gameId || gameStarted || gameFinished) return
    try {
      if (!canAddBot) {
        throw new Error('Vous n\'avez pas la permission d\'ajouter un bot')
      }
      await addBotToGame(gameId, token)
    } catch (error) {
      console.error('Erreur lors de l\'ajout du bot:', error)
    }
  }

  const handleStartGame = async () => {
    if (!gameId || gameStarted || gameFinished || !canStartGame || !token) return
    try {
      await startGame(gameId, token)
      fetchGameDetails()
      setGameStarted(true)
    } catch (error) {
      alert(error)
    }
  }

  const handleAddFavorite = async () => {
    if (!gameId || gameStarted || !gameFinished || !isArchive) return
    try {
      addFavoriteGame(gameId, token)
      setIsFavoriteArchive(!isFavoriteArchive)
    } catch (error) {
      alert(error)
    }
  }

  const handleBeReady = async () => {
    if (!gameId || !player || gameStarted || gameFinished) return
    try {
      const response = await setPlayerReady(gameId, token)
      if (response.status === 200) {
        player.ready = true
      }
    } catch (error) {
      console.error('Erreur lors du set ready:', error)
    }
  }

  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const removePlace = () => {
    if (!gameId || gameStarted || gameFinished || slots <= 6) return

    setSlots(prevSlots => prevSlots - 1)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await updateMaxPlayers(slots - 1, gameId, token)
        if (response.status !== 200) {
          setSlots(prevSlots => prevSlots + 1)
        }
      } catch (error) {
        console.error('Erreur lors du set updateMaxPlayers:', error)
        setSlots(prevSlots => prevSlots + 1)
        if (axios.isAxiosError(error)) {
          alert(error.response?.data.error)
        }
      }
    }, 750)
  }

  const addPlace = () => {
    if (!gameId || gameStarted || gameFinished || slots >= 24) return

    setSlots(prevSlots => prevSlots + 1)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await updateMaxPlayers(slots + 1, gameId, token)
        if (response.status !== 200) {
          setSlots(prevSlots => prevSlots - 1)
        }
      } catch (error) {
        console.error('Erreur lors du set updateMaxPlayers:', error)
        setSlots(prevSlots => prevSlots - 1)
      }
    }, 750)
  }

  const removeTimer = () => {
    if (!gameId || !isCreator || gameStarted || gameFinished || timer <= 2) return

    setTimer(prevTimer => prevTimer - 1)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await updateRoomTimer(timer - 1, gameId, token)
        if (response.status !== 200) {
          setTimer(prevTimer => prevTimer + 1)
        }
      } catch (error) {
        console.error('Erreur lors du removeTimer:', error)
        setTimer(prevTimer => prevTimer + 1)
      }
    }, 750)
  }

  const addTimer = () => {
    if (!gameId || !isCreator || gameStarted || gameFinished || timer >= 5) return

    setTimer(prevTimer => prevTimer + 1)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await updateRoomTimer(timer + 1, gameId, token)
        if (response.status !== 200) {
          setTimer(prevTimer => prevTimer - 1)
        }
      } catch (error) {
        console.error('Erreur lors du set addTimer:', error)
        setTimer(prevTimer => prevTimer - 1)
      }
    }, 750)
  }

  const handleTransferCreator = async () => {
    if (!gameId || gameStarted || gameFinished) return
    try {
      setIsTransferLeadOpen(true)
    } catch (error) {
      console.error('Erreur lors du transfert des droits de créateur:', error)
    }
  }

  const closeTransferLead = async () => {
    setIsTransferLeadOpen(false)
  }

  const getGameDuration = () => {
    if (!roomData) return

    const start = new Date(roomData.createdAt).getTime()
    const end = new Date(roomData.updatedAt).getTime()

    if (isNaN(start) || isNaN(end)) return 'Durée invalide'

    const diffMs = end - start

    if (diffMs <= 0) return 'Durée invalide'

    const minutes = Math.floor(diffMs / 60000)
    const seconds = Math.floor((diffMs % 60000) / 1000)

    return `${minutes} min ${seconds} sec`
  }

  const cardId = player?.card?.id
  const memoizedCardImage = useMemo(() => <CardImage cardId={cardId} />, [cardId])

  // Rendu conditionnel selon l'état du jeu
  if (!gameStarted && !gameFinished) {
    return (
      <div className="space-y-4">
        {/* Bloc d'invitation */ }
        <motion.div
          className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.5 } }
        >
          <div
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-3 border-b border-blue-500/30">
            <h3 className="text-lg font-bold text-white">Inviter vos amis</h3>
          </div>
        </motion.div>

        {/* Options pour les joueurs non créateurs */ }
        { !isCreator && (
          <motion.div
            className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
            initial={ { opacity: 0, y: 20 } }
            animate={ { opacity: 1, y: 0 } }
            transition={ { duration: 0.5, delay: 0.1 } }
          >
            <div
              className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-3 border-b border-blue-500/30">
              <h3 className="text-lg font-bold text-white">Options de la
                partie</h3>
            </div>

            <div className="p-4 text-center">
              { player && canBeReady && !player.ready ? (
                <motion.button
                  className="sound-tick px-6 py-3 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white rounded-lg shadow-lg shadow-green-500/20 animate-pulse"
                  whileHover={ { scale: 1.05 } }
                  whileTap={ { scale: 0.95 } }
                  onClick={ handleBeReady }
                >
                  Je suis prêt{ user?.isMale ? '': 'e' } !
                </motion.button>
              ): player && player.ready ? (
                <div className="bg-black/40 rounded-lg p-4 text-blue-300">
                  <div className="flex items-center justify-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-green-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={ 2 } d="M5 13l4 4L19 7"/>
                    </svg>
                    <span
                      className="text-green-400 font-medium">Tu es prêt{ user?.isMale ? '': 'e' } !</span>
                  </div>
                  <p>En attente du lancement par le créateur de la partie</p>
                </div>
              ): null }
            </div>
          </motion.div>
        ) }

        {/* Options pour le créateur */ }
        { isCreator && (
          <motion.div
            className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
            initial={ { opacity: 0, y: 20 } }
            animate={ { opacity: 1, y: 0 } }
            transition={ { duration: 0.5, delay: 0.2 } }
          >
            <div
              className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-3 border-b border-blue-500/30">
              <h3 className="text-lg font-bold text-white">Configurer la
                partie</h3>
            </div>

            <div className="p-4 space-y-4">
              {/* Nombre de places */ }
              <div className="flex items-center justify-center space-x-2">
                <button
                  className="sound-tick w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-blue-300 hover:text-white hover:bg-black/60 transition-colors"
                  onClick={ removePlace }
                  disabled={ slots <= 6 }
                >
                  –
                </button>
                <div className="px-4 py-2 bg-black/40 rounded-lg text-white">
                  <span className="font-bold">{ slots }</span> places
                </div>
                <button
                  className="sound-tick w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-blue-300 hover:text-white hover:bg-black/60 transition-colors"
                  onClick={ addPlace }
                  disabled={ slots >= 24 }
                >
                  +
                </button>
              </div>

              {/* Temps de débat */ }
              <div className="flex items-center justify-center space-x-2">
                <button
                  className="sound-tick w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-blue-300 hover:text-white hover:bg-black/60 transition-colors"
                  onClick={ removeTimer }
                  disabled={ timer <= 2 }
                >
                  –
                </button>
                <div className="px-4 py-2 bg-black/40 rounded-lg text-white">
                  <span className="font-bold">{ timer }</span> min de débat
                </div>
                <button
                  className="sound-tick w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-blue-300 hover:text-white hover:bg-black/60 transition-colors"
                  onClick={ addTimer }
                  disabled={ timer >= 5 }
                >
                  +
                </button>
              </div>

              {/* Boutons d'action */ }
              <div className="space-y-2">
                <motion.button
                  className="sound-tick w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20"
                  whileHover={ { scale: 1.02 } }
                  whileTap={ { scale: 0.98 } }
                  onClick={ openEditComposition }
                >
                  Gérer la composition
                </motion.button>

                <motion.button
                  className="sound-tick w-full px-4 py-2 bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all"
                  whileHover={ { scale: 1.02 } }
                  whileTap={ { scale: 0.98 } }
                  onClick={ handleTransferCreator }
                >
                  Léguer les droits du salon
                </motion.button>

                { user?.role && canAddBot && (
                  <motion.button
                    className="sound-tick w-full px-4 py-2 bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all"
                    whileHover={ { scale: 1.02 } }
                    whileTap={ { scale: 0.98 } }
                    onClick={ handleAddBot }
                  >
                    Ajouter un bot
                  </motion.button>
                ) }

                {isEditCompositionOpen && (
                  <EditCompoModal roomId={roomData.id} onClose={closeEditComposition} />
                )}
                {isTransferLeadOpen && (
                  <TransferLeadModal roomId={roomData.id} players={players} creator={roomData.creator} onClose={closeTransferLead} />
                )}
              </div>

              {/* Bouton de lancement */ }
              <motion.button
                className={ `sound-tick w-full px-6 py-3 bg-gradient-to-r ${
                  canStartGame
                    ? 'from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 animate-pulse'
                    : 'from-gray-600 to-gray-800 opacity-70 cursor-not-allowed'
                } text-white rounded-lg shadow-lg shadow-green-500/20 transition-all` }
                whileHover={ canStartGame ? { scale: 1.05 }: {} }
                whileTap={ canStartGame ? { scale: 0.95 }: {} }
                onClick={ handleStartGame }
                disabled={ !canStartGame }
              >
                <span className="text-lg font-bold">Lancer la partie</span>
              </motion.button>
            </div>
          </motion.div>
        ) }
      </div>
    )
  }

  // Partie en cours
  if (player && gameStarted && !gameFinished) {
    return (
      <div className="space-y-4">
        <motion.div
          className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.5 } }
        >
          <div
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-3 border-b border-blue-500/30">
            <h3 className="text-lg font-bold text-white">Informations</h3>
          </div>

          <div className="p-4">
            <div className="bg-black/40 rounded-lg p-3 mb-4">
              <p className="text-center text-blue-200 mb-2">
                Vous êtes <span
                  className="strong font-bold">{ player.card?.name }</span>
              </p>

              {/* Carte du joueur */ }
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <img
                    src={ `/assets/images/carte${ player.card?.id }.png` }
                    alt={ player.card?.name }
                    className="w-30 h-30 object-cover rounded-md border-2 border-blue-500/50"
                  />
                  <div
                    className="absolute inset-0 bg-blue-500/10 rounded-md"></div>
                </div>
              </div>
            </div>

            {/* Timer */ }
            <GameTimer gameStarted={ gameStarted }
              gameFinished={ gameFinished }/>

            {/* Actions de phase */ }
            <PhaseAction player={ player } roomId={ Number(gameId!) }
              isInn={ isInn }/>
          </div>
        </motion.div>
      </div>
    )
  }

  // Partie terminée (archive)
  if (isArchive) {
    const cardId = 1
    const winStates: Record<number, string> = {
      90: 'Les <b>Aliens infiltrés</b> ont gagné !',
      91: 'Les <b>Membres de la station</b> ont gagné !',
      92: 'Les <b>Amoureux</b> ont gagné !',
      94: 'Le <b>Maître des Ondes</b> a gagné !',
      95: 'Le <b>Séraphin</b> a gagné !',
      99: 'Tout le monde est mort !',
    }

    const cardsIds: Record<number, number> = {
      90: 2,
      91: 1,
      92: 6,
      94: 15,
      95: 9,
      99: -1,
    }

    return (
      <div className="space-y-4">
        <motion.div
          className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.5 } }
        >
          <div
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-3 border-b border-blue-500/30">
            <h3 className="text-lg font-bold text-white">Archive de la
              partie { roomData.name }</h3>
          </div>

          <div className="p-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <div className="relative">
                <img
                  src={ `/assets/images/carte${cardsIds[roomData.phase] ?? cardId}.png` }
                  alt="Carte gagnante"
                  className="w-24 h-32 object-cover rounded-md border-2 border-blue-500/50"
                />
                <div
                  className="absolute inset-0 bg-blue-500/10 rounded-md"></div>
              </div>

              <div className="flex-1">
                <h3
                  className="text-xl font-bold mb-2 text-white"
                  dangerouslySetInnerHTML={ { __html: winStates[roomData.phase] || 'Partie terminée' } }
                />
                <p className="text-blue-300">
                  <span
                    className="font-bold">Durée de la partie:</span> { getGameDuration() }
                </p>
              </div>
            </div>

            {/* Boutons d'action */ }
            <div className="space-y-3">
              <motion.button
                className={ `w-full px-4 py-2 flex items-center justify-center gap-2 sound-tick ${
                  !isFavoriteArchive
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700'
                    : 'bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900'
                } text-white rounded-lg transition-all shadow-lg` }
                whileHover={ { scale: 1.02 } }
                whileTap={ { scale: 0.98 } }
                onClick={ handleAddFavorite }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
                  viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                { !isFavoriteArchive ? 'Ajouter à mes favoris': 'Retirer de mes favoris' }
              </motion.button>

              { isFavoriteArchive && (
                <div className="bg-black/40 rounded-lg p-3">
                  <textarea
                    value={ favoriteComment }
                    onChange={ (e) => setFavoriteComment(e.target.value) }
                    placeholder="Un commentaire sur cette partie ? 😊"
                    className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    rows={ 4 }
                  />
                </div>
              ) }
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return null
}

export default GameControls

