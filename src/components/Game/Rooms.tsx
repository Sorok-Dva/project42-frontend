import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { Button } from '@mui/material'
import { Spinner } from 'reactstrap'
import { Tooltip } from 'react-tooltip'
import { useUser } from 'contexts/UserContext'
import { useSocket } from 'contexts/SocketContext'
import { PlayerType, RoomCard, RoomData } from 'hooks/useGame'
import { useAuth } from 'contexts/AuthContext'

const GenerateBloc: React.FC<{
  className: string;
  title: string,
  rooms: RoomData[],
  inGame: boolean,
}> = ({ className, title, rooms, inGame }) => {
  return (
    <aside className={className}>
      <header>{title}</header>
      <article className="waiting-game title">
        <div></div>
        <aside>Nom</aside>
        <aside>Créateur</aside>
        <aside>Places</aside>
        <aside>Options</aside>
      </article>
      <main>
        { !rooms && (
          <article className="empty">
            <div className="spinner-wrapper">
              <Spinner animation="border" role="status" className="custom-spinner">
                <span className="sr-only">Chargement en cours</span>
              </Spinner>
              <div className="loading-text">Chargement en cours</div>
            </div>
          </article>
        )}

        { rooms && rooms.length === 0 ? (
          <article className="empty">
            <h2>Aucune partie en cours.</h2>
            {!inGame && (
              <Button className="creer-partie bgblue">
                <img src="/assets/images/hr_v1.png" width={25} height={25} alt="Icon" />  CRÉER UNE PARTIE
              </Button>
            )}
          </article>
        ) : rooms.map((game) => generateRoomHtml(game)) }
      </main>
    </aside>
  )
}

const generateCards = (cards: RoomCard[]) => {
  return cards.map((c) => {
    const amount = c.quantity > 1 ? (
      <div className="amount">
        <span>{c.quantity}</span>
      </div>
    ) : null
    return (
      <div key={c.id} style={{ display: 'inline-block', position: 'relative' }}>
        <img src={`/assets/images/miniatures/carte${c.id}_90_90.png`} alt={`Carte ${c.id}`} />
        {amount}
      </div>
    )
  })
}

const generateRoomHtml = (game: RoomData, featuring: boolean = true): JSX.Element => {
  return (
    <div
      className={`waiting-game type-${game.type} phase-0`}
      data-tooltip="${tooltip}">
      <div className="white-background"></div>
      <aside>{ game.name }</aside>
      <aside>{ game.creator }</aside>
      <aside>.../{ game.maxPlayers }</aside>
      <aside>...</aside>
      <div className="big_options"></div>
      <div className="join-buttons">
        <a href={ `/game/${ game.id }` } target="_blank"
          className="button_secondary viewer" rel="noreferrer">Observer</a>
        <button className="button btn-primary join-nec">Jouer</button>
      </div>
    </div>
  )
}

const RoomList = () => {
  const { user } = useUser()
  const { token } = useAuth()
  const socket = useSocket().socket
  const [inGame, setInGame] = useState(false)
  const [ingameVisible, setIngameVisible] = useState(inGame)
  const [roomsWaitingFun, setRoomsWaitingFun] = useState<RoomData[]>([]) // Rooms détente en attente
  const [roomsInProgressFun, setRoomsInProgressFun] = useState<RoomData[]>([]) // Rooms détente en cours
  const [roomsInProgressSerious, setRoomsInProgressSerious] = useState<RoomData[]>([]) // Rooms reflexion en cours
  const [roomsWaitingSerious, setRoomsWaitingSerious] = useState<RoomData[]>([]) // Rooms reflexion en attente
  const [playerRoomId, setPlayerRoomId] = useState<number | null>(null) // Room actuelle du joueur
  const [hoveredRow, setHoveredRow] = useState<number | null>(null) // Ligne survolée
  const [showForm, setShowForm] = useState(false)
  const [gameId, setGameId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: `Partie de ${user?.nickname}`,
    maxPlayers: 6,
    anonymousVotes: false,
    privateGame: false,
    password: '',
    timer: 3,
    whiteFlag: false,
  })

  useEffect(() => {
    fetchRooms()
    fetchPlayerRoom()

    socket.on('roomsUpdated', fetchRooms)

    return () => {
      socket.off('roomsUpdated')
    }
  }, [])

  useEffect(() => {
    if (!socket) return

    socket.onAny((eventName, ...args) => {
      console.log(`Événement reçu : ${eventName}`, args)
    })

    return () => {
      socket.offAny()
    }
  }, [socket])

  useEffect(() => {
    if (!socket || !user) return

    const handlePlayerLeft = (data: { message: string }) => {
      alert(data.message.includes(user?.nickname))

      if (data.message.includes(user?.nickname)) {
        setPlayerRoomId(null)
        fetchRooms()
      }
    }

    socket.on('selfLeaveGame', handlePlayerLeft)

    return () => {
      socket.off('playerLeft', handlePlayerLeft)
    }
  }, [socket, user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSubmit = async () => {
    if (inGame) return
    try {
      const response = await axios.post('/api/games/room',
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
      setGameId(response.data.gameId)
      setPlayerRoomId(response.data.gameId)
      setInGame(true)
      window.open(`/game/${response.data.game.id}`, '_blank')
    } catch (error: any) {
      if (error.response?.data?.error) {
        alert(error.response.data.error)
      } else {
        alert('Erreur lors de la création de la partie.')
      }
    }
  }

  const fetchRooms = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/games/rooms')
      const waitingFun = data.filter((room: RoomData) => room.status === 'waiting' && [1, 3].includes(room.type))
      const inProgressFun = data.filter((room: RoomData) => room.status === 'in_progress' && [1, 3].includes(room.type))
      const waitingSerious = data.filter((room: RoomData) => room.status === 'waiting' && [0, 2].includes(room.type))
      const inProgressSerious = data.filter((room: RoomData) => room.status === 'in_progress' && [0, 2].includes(room.type))

      setRoomsWaitingFun(waitingFun)
      setRoomsInProgressFun(inProgressFun)
      setRoomsWaitingSerious(waitingSerious)
      setRoomsInProgressSerious(inProgressSerious)
    } catch (error) {
      console.error('Erreur lors de la récupération des rooms :', error)
    }
  }, [])

  useEffect(() => {
    fetchRooms()
    const interval = setInterval(fetchRooms, 60000)
    return () => clearInterval(interval)
  }, [fetchRooms])

  const fetchPlayerRoom = async () => {
    try {
      const { data } = await axios.get('/api/games/players/room', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      setPlayerRoomId(data?.roomId || null)
      setInGame(data?.roomId !== null)
    } catch (error) {
      console.error('Erreur lors de la récupération de la room du joueur :', error)
    }
  }

  const handleJoinRoom = async (roomId: number) => {
    if (playerRoomId) {
      alert('Vous êtes déjà dans une partie. Quittez votre partie actuelle pour en rejoindre une autre.')
      return
    }
    try {
      const response = await axios.post(`/api/games/room/${roomId}/join`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      setPlayerRoomId(roomId)
      window.open(`/game/${response.data.game.id}`, '_blank')
      fetchRooms()
    } catch (error: any) {
      if (error.response?.data?.error) {
        alert(error.response.data.error)
      } else {
        alert('Erreur lors de la tentative de rejoindre la partie.')
      }
    }
  }

  const handleSpectateRoom = async (roomId: number) => {
    if (playerRoomId) {
      alert('Vous êtes déjà dans une partie. Quittez votre partie actuelle pour en regarder une autre.')
      return
    }
    try {
      const response = await axios.post(`/api/games/room/${roomId}/spectate`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setPlayerRoomId(roomId)
      window.open(`/game/${response.data.game.id}`, '_blank')
      fetchRooms()
    } catch (error: any) {
      if (error.response?.data?.error) {
        alert(error.response.data.error)
      } else {
        alert('Erreur lors de la tentative de rejoindre la partie.')
      }
    }
  }

  const handleJoinCurrentRoom = async () => {
    if (!playerRoomId) {
      alert('Vous n\'êtes pas dans une partie.')
      return
    }
    window.open(`/game/${playerRoomId}`, '_blank')
  }

  const handleLeaveRoom = async () => {
    if (!playerRoomId) {
      alert('Vous n\'êtes dans aucune partie.')
      return
    }
    try {
      const response = await axios.post('/api/games/players/room/leave', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (response.data.message) {
        socket.emit('leaveRoom', {
          roomId: playerRoomId,
          player: { id: user?.id, nickname: user?.nickname },
        })
        setPlayerRoomId(null)
        setInGame(false)
        localStorage.removeItem(`game_auth_${playerRoomId}`)
        alert('Vous avez bien quitter votre partie.')
        fetchRooms()
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        alert(error.response.data.error)
      } else {
        alert('Erreur lors de la tentative de quitter la partie.')
      }
    }
  }

  const fillGameList = (rooms: RoomData[], type: string): JSX.Element => {
    if (rooms.length === 0) {
      return (
        <article className="empty">
          <h2>Aucune partie en cours.</h2>
          {!inGame && (
            <Button className="creer-partie" data-type={type}>
              <img src="/static/img/icon-wolf-head_v2.png" alt="Icon" /> CRÉER UNE PARTIE
            </Button>
          )}
        </article>
      )
    }
    return (
      <>
        {rooms.map((game) => generateRoomHtml(game))}
      </>
    )
  }

  return (
    <section className="room-page list-room">
      {/* Section Ingame */}
      {inGame && (
        <section className="ingame-page">
          <h1 className="with-borders">
            <div></div>
            <span>Tu es déjà en jeu</span>
            <div></div>
          </h1>
          <article>
            { playerRoomId && (
              <>
                <Button className="btn btn-primary" onClick={handleJoinCurrentRoom}> Rejoindre la partie en cours</Button>
                <Button className="btn btn-warning" onClick={handleLeaveRoom}>Quitter la partie</Button>
              </>
            )}
          </article>
          <div>
            <i className="mdi mdi-information-outline"></i>
            <span>
              Tu dois quitter ta partie en cours pour <b>observer</b> ou <b>jouer</b> une autre partie !
            </span>
          </div>
        </section>
      )}

      {/* Contenu de la Room Page */}
      {/* Bannières éventuelles */}
      {/* <RoomBanners /> */}
      <div className="gametypes-modal-content">
        <article className="labels">
          <aside>
            <header>
              <div style={{ backgroundColor: '#4a86e8' }}></div>
              <strong style={{ verticalAlign: 'middle' }}>
                Partie <span style={{ color: '#4a86e8' }}>FUN</span> <em>(bandeau Bleu)</em>
              </strong>
            </header>
            <div>Des parties rapides, ambiance détente, peu de prise de tête.</div>
          </aside>
          <aside>
            <header>
              <div style={{ backgroundColor: '#38761d' }}></div>
              <strong style={{ verticalAlign: 'middle' }}>
                Partie <span style={{ color: '#38761d' }}>NORMALE</span> <em>(bandeau Vert)</em>
              </strong>
            </header>
            <div>Des parties comme dans la vraie vie, réflexion et bluff sont de rigueur.</div>
          </aside>
          <aside>
            <header>
              <div style={{ backgroundColor: '#a08aa6' }}></div>
              <strong style={{ verticalAlign: 'middle' }}>
                Partie <span style={{ color: '#a08aa6' }}>CARNAGE</span> <em>(bandeau Violet)</em>
              </strong>
            </header>
            <div>Très rapide, 6 rôles, peu voire aucune stratégie, beaucoup d'éliminations à chaque tour.</div>
          </aside>
          <aside>
            <header>
              <div style={{ backgroundColor: '#ef3a3a' }}></div>
              <strong style={{ verticalAlign: 'middle' }}>
                Partie <span style={{ color: '#ef3a3a' }}>SÉRIEUSE</span> <em>(bandeau Rouge)</em>
              </strong>
            </header>
            <div>Demande beaucoup de concentration et de persuasion. Règles strictes favorisant le débat.</div>
          </aside>
          <aside>
            <header>
              <img
                src="/assets/img/chatelain.png"
                style={{ width: 30, height: 30, verticalAlign: 'middle' }}
                alt="Partie Premium"
              />
              <strong style={{ verticalAlign: 'middle' }}>Partie Premium</strong>
            </header>
            <div>Plus de rôles, plus d'options, plus de tout !</div>
          </aside>
        </article>
      </div>

      {!showForm && (
        <>
          {/*<h1 className="with-borders">*/}
          {/*  <div></div>*/}
          {/*  <span>*/}
          {/*Lancement rapide{' '}*/}
          {/*    <img*/}
          {/*      className="infotop"*/}
          {/*      data-tooltip-id="infotop"*/}
          {/*      data-tooltip-content="Clique ici pour en savoir plus sur les différents types de partie"*/}
          {/*      src="/assets/images/information.png"*/}
          {/*      alt="Information"*/}
          {/*    />*/}
          {/*    <Tooltip id="infotop" />*/}
          {/*  </span>*/}
          {/*  <div></div>*/}
          {/*</h1>*/}
          {/*<article className="featured-games">*/}
          {/*   Ici vous afficherez vos parties en vedette via generateRoomHtml */}
          {/*</article>*/}

          {/*<h1 className="with-borders header-levels">
        <div></div>
        <span>Quêtes & Niveaux</span>
        <div></div>
      </h1>*/}
          {/* Composant ou contenu des quêtes */}

          <h1 className="with-borders header-waiting">
            <div></div>
            <span>Liste des parties en attente</span>
            <div></div>
          </h1>
          <article className="games-list games-waiting">
            <GenerateBloc className="d-games" title="Espace détente" rooms={roomsWaitingFun} inGame={inGame} />
            <GenerateBloc className="r-games" title="Espace réflexion" rooms={roomsWaitingSerious} inGame={inGame}/>
          </article>

          <h1 className="with-borders header-launched">
            <div></div>
            <span>Liste des parties en cours</span>
            <div></div>
          </h1>
          <article className="games-list games-launched">

            <GenerateBloc className="d-games" title="Espace détente" rooms={roomsInProgressFun} inGame={inGame} />
            <GenerateBloc className="r-games" title="Espace réflexion" rooms={roomsInProgressSerious} inGame={inGame} />
          </article>
        </>
      )}
      {!showForm && !inGame && (
        <>
          <h1>Vous n'avez pas trouvé votre bonheur ?</h1>
          <article>
            <Button
              data-type="1"
              className={!inGame ? 'creer-partie' : 'creer-partie disabled'}
              onClick={() => setShowForm(true)}
            >
              <img src="/assets/images/hr_v1.png" width={25} height={25} alt="Icon" /> CRÉER UNE PARTIE
            </Button>
          </article>
        </>
      )}
      { showForm && !inGame && (
        <section className="creer-page">
          <article>
            <Button className="retour-room" onClick={() => setShowForm(false)}>
              <a
                className="back-btn" href="#">
                <i className="ti ti-arrow-narrow-left fs-2xl" onClick={() => setShowForm(false)}></i></a>
            </Button>
            <aside className="header-bloc">Créer une partie</aside>
            <aside className="header-advice">
    Assurez-vous qu’aucune partie similaire à celle que vous souhaitez créer n'existe. Les doublons rendent les temps pour lancer une partie plus longs.
            </aside>
            <aside className="type-partie">
              <header>1 - Choisis le type de partie</header>
              <main>
                <Button value="3" disabled={true}>CARNAGE</Button>
                <Button value="1" disabled={true}>FUN</Button>
                <Button className="active" value="0">NORMALE</Button>
                <Button value="2" disabled={true}>SÉRIEUSE</Button>
                {/* Afficher Animation si applicable */}
              </main>
              <footer>
                <div className="infos-type" data-type="3">
        Viens t'amuser avant tout, partie rapide et composition définie.
                </div>
                <div className="infos-type" data-type="1">
        Parties idéales pour discuter avec ses amis et jouer dans une ambiance détendue.
                </div>
                <div className="infos-type active" data-type="0">
        Tu y trouveras de la réflexion et une bonne ambiance. La participation au débat et l'argumentation sont requises.
                </div>
                <div className="infos-type" data-type="2">
        Règles strictes pour joueurs aimant le challenge. Concentration et participation active. Accroche-toi !
                </div>
              </footer>
            </aside>
            <aside className="nom-partie">
              <header>2 - Donne un nom à ta partie</header>
              <main>
                <input
                  id="game-name"
                  name="name"
                  maxLength={15}
                  type="text"
                  placeholder="Nom de partie"
                  onChange={handleChange}
                />
              </main>
            </aside>
            <aside className="not-box">
              <aside></aside>
              <aside>
                <img src="/assets/images/carte1.png" alt="Carte 1" />
                <h2>Paramétrage de la Partie</h2>
              </aside>
              <aside></aside>
            </aside>
            <aside className="debat-partie">
              <aside>3 - Choisis le temps de débat</aside>
              <aside>
                {[2, 3, 4, 5].map((timerValue) => (
                  <Button
                    key={timerValue}
                    className={`grey ${formData.timer === timerValue ? 'active' : ''}`}
                    onClick={() => setFormData((prev) => ({ ...prev, timer: timerValue }))}
                  >
                    {timerValue} min
                  </Button>
                ))}
              </aside>
              <aside></aside>
            </aside>
            <aside className="options-partie">
              <aside>4 - Options supplémentaires</aside>
              <aside>
                <Button
                  className={`grey ${formData.whiteFlag ? 'active' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, whiteFlag: !prev.whiteFlag }))}
                >
                  Sans points
                </Button>
                {/*<Button className="event-option" value="st-patrick">
                  St-Patrick
                </Button>
                <Button className="event-option" value="halloween">
                  Halloween
                </Button>
                <Button className="event-option" value="summer">
                  <img src="/stuff/salle_de_jeu/partie_ete.png" alt="Ete" /> Été
                </Button>
                <Button className="event-option" value="cadeau">
                  Cadeau explosif
                </Button>
                <Button className="event-option" value="stValentin">
                  Couple Maudit
                </Button>
                <Button className="event-option" value="easter">
                  Pâques
                </Button>
                <Button className="event-option" value="ultrafast">
                  Ultra-rapide
                </Button>
                <Button className="event-option" value="hiddenDeadsRoles">
                  Rôles des morts cachés
                </Button>
                <Button id="gm_mode" className="grey" value="reel">
                  Meneur réel
                </Button>*/}
                <Button className="grey" value="anonyme" disabled={true}>
                  Anonyme
                </Button>
                <Button className="grey" value="selective" disabled={true}>
                  Sélective
                </Button>
                <Button
                  className={`grey ${formData.privateGame ? 'active' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, privateGame: !prev.privateGame }))}
                >
                  Privée
                </Button>
              </aside>
              <aside></aside>
            </aside>

            {formData.privateGame && (
              <aside className="password-partie">
                <header>4b - Donne un mot de passe à ta partie</header>
                <main>
                  <input
                    id="game-password"
                    name="password"
                    maxLength={15}
                    type="text"
                    placeholder="Mot de passe"
                    onChange={handleChange}
                  />
                </main>
              </aside>
            )}

            <aside className="nbj-partie">
              <aside>5 - Nombre de joueurs</aside>
              <aside>
                <Button className="grey active" value="8">
                  de 6 j à 24 j
                </Button>
              </aside>
              <aside></aside>
            </aside>
            <aside>
              <Button className="creer-partie bgblue" onClick={handleSubmit}>CRÉER</Button>
            </aside>
          </article>
        </section>
      )}
    </section>
  )
}

export default RoomList
