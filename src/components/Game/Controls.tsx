import React from 'react'
import { Box, Button, Paper, Typography } from '@mui/material'
import { usePermissions } from 'hooks/usePermissions'
import { addBotToGame, startGame, setPlayerReady, transferCreatorRights } from 'services/gameService'
import { useAuth } from 'contexts/AuthContext'
import { useUser } from 'contexts/UserContext'
import GameTimer from './Timer'
import PhaseAction from './PhaseAction'
import { PlayerType, RoomData } from 'hooks/useGame'

interface GameControlsProps {
  gameId: string | undefined
  roomData: RoomData
  player: PlayerType
  isCreator: boolean
  canBeReady: boolean
  canStartGame: boolean
  gameStarted: boolean
  gameFinished: boolean
  setGameStarted: (gameStarted: boolean) => void
  fetchGameDetails: () => void
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
}) => {
  const { token } = useAuth()
  const { user } = useUser()
  const { checkPermission } = usePermissions()

  const canAddBot = checkPermission('godPowers', 'addBot')
  const canEditGame = checkPermission('game', 'edit')

  const handleAddBot = async () => {
    if (!gameId || gameStarted || gameFinished) return
    try {
      if (!canAddBot) {
        throw new Error('Vous n\'avez pas la permission d\'ajouter un bot')
      }
      await addBotToGame(gameId, token)
      fetchGameDetails()
    } catch (error) {
      console.error('Erreur lors de l\'ajout du bot:', error)
    }
  }

  const handleStartGame = async () => {
    if (!gameId || gameStarted || gameFinished) return
    try {
      await startGame(gameId)
      fetchGameDetails()
      setGameStarted(true)
    } catch (error) {
      console.error('Erreur lors du lancement de la partie:', error)
    }
  }

  const handleBeReady = async () => {
    if (!gameId || gameStarted || gameFinished) return
    try {
      const response = await setPlayerReady(gameId, token)
      if (response.status === 200) {
        player.ready = true
      }
    } catch (error) {
      console.error('Erreur lors du set ready:', error)
    }
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
    <div id="block_actions">
      { !gameStarted && !gameFinished && (
        <div id="block_ami" className="block rounded bgblue">
          <div className="block_header">
            <h3>Inviter vos amis</h3>
          </div>

          <div className="block_content block_scrollable_wrapper scrollbar-light">
            <div className="block_scrollable_content">
              <div className="invite_show">
                <div className="invite_friends">Chargement...</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isCreator && !gameStarted && !gameFinished && (
        <>
          <div id="block_options" className="block rounded bgblue">
            <div className="block_header">
              <h3>Options de la partie</h3>
            </div>
            <div className="block_content block_scrollable_wrapper scrollbar-light">
              <div className="block_scrollable_content">
                <div className="block_content_section text-center">
                  <Box>
                    {canBeReady && !player.ready && (
                      <div
                        className="button array_selectable sound-tick bglightblue animate__animated animate__bounce animate__infinite"
                        onClick={handleBeReady}
                      >
                        Je suis prêt(e) !
                      </div>
                    )}
                  </Box>
                </div>
              </div>
            </div>
          </div>
          <hr/>
        </>
      )}

      {isCreator && !gameStarted && !gameFinished && (
        <>
          <div id="block_crea" className="block rounded bgblue">
            <div className="block_header">
              <h3>Configurer la partie</h3>
            </div>
            <div
              className="block_content block_scrollable_wrapper scrollbar-light">
              <div className="block_scrollable_content">
                <div className="block_content_section">
                  <div className="game-options">
                    <div className="premium-options">
                      <div id="crea_places">
                        <div
                          className="buttons_array buttons_array_small bglightblue">
                          {/*$places == 6 || $places == count($joueurs))*/ }
                          <div
                            className="button array_clickable sound-tick sound-unselect"
                            data-tooltip="<?= $LG->lang('delPlace'); ?>"
                            data-action="removePlace">–
                          </div>

                          <div className="button unclickable"><span
                            className="places">{ roomData.maxPlayers }</span> places
                          </div>

                          {/*if (($salonType < 2 && $places == 50) || ($salonType == 2 && $places == 30)):*/ }
                          <div
                            className="button array_clickable sound-tick sound-select"
                            data-action="addPlace">+
                          </div>
                        </div>
                      </div>
                      <div id="crea_debat">
                        <div
                          className="buttons_array buttons_array_small bglightblue mt-1">
                          {/*if (isset($debateMin) && $debate == $debateMin)*/ }
                          <div
                            className="button array_clickable sound-tick sound-unselect"
                            data-action="debatDown">–
                          </div>

                          <div className="button unclickable">
                            <span
                              className="debat">{ roomData.timer }</span> min
                            de débat
                          </div>

                          {/*if (isset($debateMax) && $debate == $debateMax)*/ }
                          <div
                            className="button array_clickable sound-tick sound-select"
                            data-action="debatUp">+
                          </div>
                        </div>
                      </div>

                      <div id="crea_params">
                        <div className="buttons_array bglightblue">
                          <div
                            className="button array_selectable sound-tick selected'"
                            data-action="cacheVote">
                            <img src="/assets/images/icon-votecache.png"
                              alt="Cacher les votes"/>
                          </div>

                          <div
                            className="button array_selectable sound-tick selected"
                            data-action="muteSpec">
                            <img src="/assets/images/icon-mutespec.png"
                              alt="Muter les spectateurs"/>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="button_secondary sound-tick crea_lead">Léguer
                    les droits du salon
                  </div>
                  <div className="button_secondary sound-tick join_spec">
                    <span>Rejoindre les spectateurs</span>
                  </div>

                  { ['SuperAdmin', 'Admin', 'Developers', 'Moderator', 'ModeratorTest', 'Animator']
                    .includes(user?.role as string) && (
                    <div>
                      <div className="flex-row gutter">
                        { canEditGame && (
                          <div className="button_secondary sound-tick">
                            Modifier le salon
                          </div>
                        ) }
                        { canAddBot && (
                          <div className="button_secondary sound-tick"
                            onClick={ handleAddBot }>Ajouter un bot
                          </div>
                        ) }
                      </div>
                    </div>
                  ) }

                  <div id="crea_launch" className="block_content_section">
                    <div
                      className={ `button sound-tick rounded bglightblue animation-bounce ${!canStartGame ? 'disabled' : ''}` }
                      onClick={handleStartGame}
                    >
                      <h3>Lancer la partie</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      { player && gameStarted && !gameFinished ? (
        <>
          <div id="block_ia"
            className="shadow rounded bgblue game-started">
            <div id="block_infos">
              <p className="wait_for_card_reveal">
                          Vous
                          êtes <strong>{ player.card?.name }</strong>.<br/>
              </p>
              <GameTimer gameStarted={ gameStarted }
                gameFinished={ gameFinished }/>
              <PhaseAction player={ player }
                roomId={ Number(gameId!) }/>
            </div>
          </div>
          <div id="card_wrapper" className="card_animation">
            <div id="card_flipper" className="card_animation">
              <img className="card_role"
                src={ `/assets/images/carte${ player.card?.id }.png` }/>
              <img className="card_anon"
                src="/assets/images/carte0.png"/>
            </div>
          </div>
        </>
      ): !player ? (
        <div id="block_ia"
          className="shadow rounded bgblue game-started spectator">
          <div id="block_infos">
            { gameFinished ? <b>La partie est terminée.</b>:
              <p>Vous êtes spectateur de la partie.</p> }
          </div>
        </div>
      ): null }
    </div>
  )
}

export default GameControls
