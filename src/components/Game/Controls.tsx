import React, { useRef, useState } from 'react'
import { Box } from '@mui/material'
import { usePermissions } from 'hooks/usePermissions'
import {
  addBotToGame,
  startGame,
  setPlayerReady,
  transferCreatorRights,
  updateMaxPlayers, updateRoomTimer, updateRoomCards,
} from 'services/gameService'
import { useAuth } from 'contexts/AuthContext'
import { useUser } from 'contexts/UserContext'
import GameTimer from './Timer'
import PhaseAction from './PhaseAction'
import { PlayerType, RoomData } from 'hooks/useGame'
import EditCompoModal from 'components/Game/EditComposition'
import axios from 'axios'

interface GameControlsProps {
  gameId: string | undefined
  roomData: RoomData
  player: PlayerType | null
  isCreator: boolean
  canBeReady: boolean
  canStartGame: boolean
  gameStarted: boolean
  gameFinished: boolean
  setGameStarted: (gameStarted: boolean) => void
  fetchGameDetails: () => void
  slots: number
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
  gameStarted,
  gameFinished,
  setGameStarted,
  slots,
  setSlots,
  setRoomData,
}) => {
  const { token } = useAuth()
  const { user } = useUser()
  const { checkPermission } = usePermissions()
  const canAddBot = checkPermission('godPowers', 'addBot')
  const canEditGame = checkPermission('game', 'edit')
  const [timer, setTimer] = useState<number>(3)
  const [isEditCompositionOpen, setIsEditCompositionOpen] = useState(false)

  const openEditComposition = () => setIsEditCompositionOpen(true)
  const closeEditComposition = async () => {
    if (roomData.maxPlayers !== slots) {
      const response = await updateMaxPlayers(slots, String(gameId), token)
      if (response.status !== 200) {
        setSlots(roomData.maxPlayers)
      } else setRoomData({ ...roomData, maxPlayers: slots })
    }

    await updateRoomCards(roomData.cards, String(gameId), token)

    setIsEditCompositionOpen(false)
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
      await startGame(gameId)
      fetchGameDetails()
      setGameStarted(true)
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
    if (!gameId || gameStarted || gameFinished || timer <= 2) return

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
    if (!gameId || gameStarted || gameFinished || timer >= 5) return

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

  const handleTransferCreator = async (newCreatorId: string) => {
    if (!gameId || gameStarted || gameFinished) return
    try {
      await transferCreatorRights(gameId, newCreatorId)
      fetchGameDetails()
    } catch (error) {
      console.error('Erreur lors du transfert des droits de créateur:', error)
    }
  }

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
                        Je suis prêt(e) !
                      </Box>
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

                  <Box className="button_secondary sound-tick crea_lead">Léguer
                    les droits du salon
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
                          Vous
                          êtes <strong>{ player.card?.name }</strong>.<br/>
              </p>
              <GameTimer gameStarted={ gameStarted }
                gameFinished={ gameFinished }/>
              <PhaseAction player={ player }
                roomId={ Number(gameId!) }/>
            </Box>
          </Box>
          <Box id="card_wrapper" className="card_animation">
            <Box id="card_flipper" className="card_animation">
              <img className="card_role"
                src={ `/assets/images/carte${ player.card?.id }.png` }/>
              <img className="card_anon"
                src="/assets/images/carte0.png"/>
            </Box>
          </Box>
        </>
      ): !player ? (
        <Box id="block_ia"
          className="shadow rounded bgblue game-started spectator">
          <Box id="block_infos">
            { gameFinished ?
              <b>La partie est terminée.</b>:
              <>
                <Box style={{ marginTop: '4rem' }}>
                  <GameTimer gameStarted={ gameStarted }
                    gameFinished={ gameFinished }/>
                </Box>

                <Box className="mt-4">
                  <b>Vous êtes spectateur de la partie.</b>
                </Box>
              </>
            }
          </Box>
        </Box>
      ): null }

      {isEditCompositionOpen && (
        <EditCompoModal roomId={roomData.id} onClose={closeEditComposition} />
      )}
    </Box>
  )
}

export default GameControls
