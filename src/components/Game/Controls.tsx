import React from 'react'
import { Box, Button, Paper, Typography } from '@mui/material'
import { usePermissions } from 'hooks/usePermissions'
import { addBotToGame, startGame, setPlayerReady, transferCreatorRights } from 'services/gameService'
import { useAuth } from 'contexts/AuthContext'
import { useUser } from 'contexts/UserContext'
import GameTimer from './Timer'
import PhaseAction from './PhaseAction'
import { PlayerType } from 'hooks/useGame'

interface GameControlsProps {
  gameId: string | undefined
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
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleStartGame}
                  disabled={!canStartGame}
                >
                  Lancer la partie
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleTransferCreator('1')}
                >
                  Léguer les droits du salon
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {player && gameStarted && !gameFinished ? (
        <div id="block_ia" className="shadow rounded bgblue game-started">
          <div id="block_infos">
            <p>
              Vous êtes <strong>{player.card}</strong>.<br />
            </p>
            <GameTimer gameStarted={gameStarted} gameFinished={gameFinished} />
            <PhaseAction player={player} roomId={Number(gameId!)} />
          </div>
        </div>
      ) : !player ? (
        <div id="block_ia" className="shadow rounded bgblue game-started spectator">
          <div id="block_infos">
            {gameFinished ? <b>La partie est terminée.</b> : <p>Vous êtes spectateur de la partie.</p>}
          </div>
        </div>
      ) : null}

      {/*<Box
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Paper
          elevation={4}
          sx={{
            padding: '2rem',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)'
          }}
        >
          <GameTimer gameStarted={gameStarted} gameFinished={gameFinished} />
          <PhaseAction player={player} roomId={Number(gameId!)} />

          {gameFinished && (
            <h3>Cette partie est terminée.</h3>
          )}


          {[ 'SuperAdmin', 'Admin', 'Developers', 'Moderator', 'ModeratorTest', 'Animator' ]
            .includes(user?.role as string) && !gameStarted && !gameFinished && (
            <div>
              {canEditGame && (
                <>
                  <button>Modifier le salon</button>
                </>
              )}
              {canAddBot && (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={handleAddBot}
                >
                  Ajouter un bot
                </Button>
              )}
            </div>
          )}
          {!isCreator && !gameStarted && !gameFinished && (
            <Box>
              {canBeReady && !player.ready && (
                <Button
                  variant="contained"
                  color="success"
                  className="animate__animated animate__bounce animate__infinite"
                  onClick={handleBeReady}
                >
                Je suis prêt(e) !
                </Button>
              )}
            </Box>
          )}
        </Paper>
      </Box>*/ }
    </div>
  )
}

export default GameControls
