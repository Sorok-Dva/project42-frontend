import React, { useMemo, useRef, useState } from 'react'
import { Box } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart, faHeartCircleXmark } from '@fortawesome/free-solid-svg-icons'
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
    if (!gameId || gameStarted || gameFinished || !canStartGame) return
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

  return (
    <Box id="block_actions">
      { !gameStarted && !gameFinished && (
        <Box id="block_ami" className="block rounded bgblue">
          <Box className="block_header">
            <h3>Inviter vos amis</h3>
          </Box>

          <Box className="block_content block_scrollable_wrapper scrollbar-light">
            <Box className="block_scrollable_content">
              <Box className="invite_show">
                <Box className="invite_friends">Chargement...</Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {!isCreator && !gameStarted && !gameFinished && (
        <>
          <Box id="block_options" className="block rounded bgblue">
            <Box className="block_header">
              <h3>Options de la partie</h3>
            </Box>
            <Box className="block_content block_scrollable_wrapper scrollbar-light">
              <Box className="block_scrollable_content">
                <Box className="block_content_section text-center">
                  <Box>
                    {player && canBeReady && !player.ready && (
                      <Box
                        className="button array_selectable sound-tick bglightblue animate__animated animate__bounce animate__infinite"
                        onClick={handleBeReady}
                      >
                        Je suis prêt{user?.isMale ? '' : 'e'} !
                      </Box>
                    )}

                    {player && player.ready && (
                      <p>
                        Tu es prêt{user?.isMale ? '' : 'e'} !
                        En attente du lancement par le créateur de la partie
                      </p>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
          <hr/>
        </>
      )}

      {isCreator && !gameStarted && !gameFinished && (
        <>
          <Box id="block_crea" className="block rounded bgblue">
            <Box className="block_header">
              <h3>Configurer la partie</h3>
            </Box>
            <Box
              className="block_content block_scrollable_wrapper scrollbar-light">
              <Box className="block_scrollable_content">
                <Box className="block_content_section">
                  <Box className="game-options">
                    <Box className="premium-options">
                      <Box id="crea_places">
                        <Box
                          className="buttons_array buttons_array_small bglightblue">
                          {/*$places == 6 || $places == count($joueurs))*/ }
                          <Box
                            className="button array_clickable sound-tick sound-unselect"
                            data-tooltip="Supprimer une place"
                            onClick={ removePlace }>–
                          </Box>

                          <Box className="button unclickable"><span
                            className="places">{ slots }</span> places
                          </Box>

                          {/*if (($salonType < 2 && $places == 50) || ($salonType == 2 && $places == 30)):*/ }
                          <Box
                            className="button array_clickable sound-tick sound-select"
                            onClick={ addPlace }>+
                          </Box>
                        </Box>
                      </Box>
                      <Box id="crea_debat">
                        <Box
                          className="buttons_array buttons_array_small bglightblue mt-1">
                          {/*if (isset($debateMin) && $debate == $debateMin)*/ }
                          <Box
                            className="button array_clickable sound-tick sound-unselect"
                            onClick={ removeTimer }>–
                          </Box>

                          <Box className="button unclickable">
                            <span
                              className="debat">{ timer }</span> min
                            de débat
                          </Box>

                          {/*if (isset($debateMax) && $debate == $debateMax)*/ }
                          <Box
                            className="button array_clickable sound-tick sound-select"
                            onClick={ addTimer }>+
                          </Box>
                        </Box>
                      </Box>

                      {/*<Box id="crea_params">
                        <Box className="buttons_array bglightblue">
                          <Box
                            className="button array_selectable sound-tick selected'"
                            data-action="cacheVote">
                            <img src="/assets/images/icon-votecache.png"
                              alt="Cacher les votes"/>
                          </Box>

                          <Box
                            className="button array_selectable sound-tick selected"
                            data-action="muteSpec">
                            <img src="/assets/images/icon-mutespec.png"
                              alt="Muter les spectateurs"/>
                          </Box>
                        </Box>
                      </Box>*/}
                    </Box>
                  </Box>

                  <Box onClick={openEditComposition}
                    className="button sound-tick rounded bglightblue">
                    <h3>Gérer la composition</h3>
                  </Box>

                  <Box className="button_secondary sound-tick crea_lead" onClick={handleTransferCreator}>
                    Léguer les droits du salon
                  </Box>
                  <Box className="button_secondary sound-tick join_spec">
                    <span>Rejoindre les spectateurs</span>
                  </Box>

                  { ['SuperAdmin', 'Admin', 'Developers', 'Moderator', 'ModeratorTest', 'Animator']
                    .includes(user?.role as string) && (
                    <Box style={{ width: '100%' }}>
                      <Box className="flex-row gutter">
                        { canEditGame && (
                          <Box className="button_secondary sound-tick">
                            Modifier le salon
                          </Box>
                        ) }
                        { canAddBot && (
                          <Box className="button_secondary sound-tick"
                            onClick={ handleAddBot }>Ajouter un bot
                          </Box>
                        ) }
                      </Box>
                    </Box>
                  ) }

                  <Box id="crea_launch" className="block_content_section">
                    <Box
                      className={ `button sound-tick rounded bglightblue ${ !canStartGame ? 'disabled': 'animation-bounce' }` }
                      onClick={ handleStartGame }
                    >
                      <h3>Lancer la partie</h3>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </>
      ) }

      { player && gameStarted && !gameFinished ? (
        <>
          <Box id="block_ia"
            className="shadow rounded bgblue game-started">
            <Box id="block_infos">
              <p className="wait_for_card_reveal">
                Vous êtes <strong>{ player.card?.name }</strong>.<br/>
              </p>
              <GameTimer gameStarted={ gameStarted }
                gameFinished={ gameFinished }/>
              <PhaseAction player={ player }
                roomId={ Number(gameId!) }/>
            </Box>
          </Box>
          {memoizedCardImage}
        </>
      ): <>
        { isArchive && (() => {
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
            <Box id="block_ia" className="shadow rounded bgblue game-started spectator">
              <Box id="block_infos">
                <h3>Archive de la partie {roomData.name}</h3>
                <Box>
                  <Box id="block_infos">
                    <Box style={{ marginTop: '1rem', marginLeft: '2rem' }}>
                      <h3 dangerouslySetInnerHTML={{ __html: winStates[roomData.phase] }} />
                      <p><b>Durée de la partie</b>: {getGameDuration()}</p>
                    </Box>
                  </Box>
                  <CardImage cardId={cardsIds[roomData.phase] ?? cardId} />
                </Box>
                <Box className="block_content_section mt-4">
                  <Box
                    className="button sound-tick rounded bglightblue heart"
                    onClick={handleAddFavorite}
                  >
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      { !isFavoriteArchive ? (
                        <>
                          <FontAwesomeIcon icon={faHeart} style={{ color: 'pink', fontSize: '1.5em' }} />
                          Ajouter à mes favoris
                        </>
                      ): (
                        <>
                          <FontAwesomeIcon icon={faHeartCircleXmark} style={{ color: 'pink', fontSize: '1.5em' }} />
                          Retirer de mes favoris
                        </>
                      )}
                    </h3>
                  </Box>
                  { isFavoriteArchive && (
                    <Box
                      className="button sound-tick rounded bglightblue heart"
                    >
                      <textarea
                        value={favoriteComment}
                        onChange={(e) => setFavoriteComment(e.target.value)}
                        placeholder="Un commentaire sur cette partie ? 😊"
                        className="border rounded p-2 w-full"
                        cols={40}
                        rows={4}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          )
        })()}
      </> }

      {isEditCompositionOpen && (
        <EditCompoModal roomId={roomData.id} onClose={closeEditComposition} />
      )}
      {isTransferLeadOpen && (
        <TransferLeadModal roomId={roomData.id} players={players} creator={roomData.creator} onClose={closeTransferLead} />
      )}
    </Box>
  )
}

export default GameControls
