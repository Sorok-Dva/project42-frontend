'use client'

import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { useUser } from 'contexts/UserContext'
import { useSocket } from 'contexts/SocketContext'
import type { RoomData } from 'hooks/useGame'
import { useAuth } from 'contexts/AuthContext'
import { leaveGame } from 'services/gameService'
import { hasRole } from 'utils/rolify'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Mic,
  Flag,
  Ghost,
  Lock,
} from 'lucide-react'
import { Tooltip } from 'react-tooltip'

const RoomList = () => {
  const { user } = useUser()
  const { token } = useAuth()
  const socket = useSocket().socket
  const [inGame, setInGame] = useState(false)
  const [roomsWaitingFun, setRoomsWaitingFun] = useState<RoomData[]>([]) // Rooms détente en attente
  const [roomsInProgressFun, setRoomsInProgressFun] = useState<RoomData[]>([]) // Rooms détente en cours
  const [roomsInProgressSerious, setRoomsInProgressSerious] = useState<
    RoomData[]
  >([]) // Rooms reflexion en cours
  const [roomsWaitingSerious, setRoomsWaitingSerious] = useState<RoomData[]>(
    [],
  ) // Rooms reflexion en attente
  const [playerRoomId, setPlayerRoomId] = useState<number | null>(null) // Room actuelle du joueur
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: `Partie de ${user?.nickname}`,
    maxPlayers: 6,
    anonymousVotes: false,
    privateGame: false,
    discordGame: false,
    password: '',
    timer: 3,
    whiteFlag: false,
    anonymousGame: false,
    type: 3,
  })
  const [isGameTypesInfoExpanded, setIsGameTypesInfoExpanded] = useState(true)
  const premiumDate = user?.premium ? new Date(user.premium) : null
  const isPremium = premiumDate ? new Date().getTime() < premiumDate.getTime() : false

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      timer: formData.type === 3 ? 2 : formData.timer,
    }))
  }, [formData.type])

  useEffect(() => {
    fetchRooms()
    fetchPlayerRoom()

    socket.on('roomsUpdated', fetchRooms)
    window.addEventListener('storage', (e) => {
      if (e.key === 'gameFinished') {
        fetchRooms()
        setPlayerRoomId(null)
        setInGame(false)
        localStorage.removeItem('gameFinished')
      }
    })
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
      /* alert(data.message.includes(user.nickname))

      if (data.message.includes(user.nickname)) {
        setPlayerRoomId(null)
        fetchRooms()
      }*/
    }

    socket.on('playerLeft', handlePlayerLeft)

    return () => {
      socket.off('playerLeft', handlePlayerLeft)
    }
  }, [socket, user])

  const fetchRooms = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/games/rooms')
      const waitingFun = data.filter(
        (room: RoomData) =>
          room.status === 'waiting' && [1, 3, 4, 5].includes(room.type),
      )
      const inProgressFun = data.filter(
        (room: RoomData) =>
          room.status === 'in_progress' && [1, 3, 4, 5].includes(room.type),
      )
      const waitingSerious = data.filter(
        (room: RoomData) =>
          room.status === 'waiting' && [0, 2, 4, 5].includes(room.type),
      )
      const inProgressSerious = data.filter(
        (room: RoomData) =>
          room.status === 'in_progress' && [0, 2, 4, 5].includes(room.type),
      )

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSubmit = async () => {
    if (inGame || !token) return
    try {
      const response = await axios.post('/api/games/room', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setPlayerRoomId(response.data.game.id)
      setInGame(true)
      setShowForm(false)
      fetchRooms()
      window.open(`/game/${response.data.game.id}`, '_blank')
    } catch (error: any) {
      if (error.response?.data?.error) {
        alert(error.response.data.error)
      } else {
        alert('Erreur lors de la création de la partie.')
      }
    }
  }

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
      console.error(
        'Erreur lors de la récupération de la room du joueur :',
        error,
      )
    }
  }

  const handleJoinRoom = async (roomId: number) => {
    if (playerRoomId) {
      alert(
        'Vous êtes déjà dans une partie. Quittez votre partie actuelle pour en rejoindre une autre.',
      )
      return
    }
    try {
      const response = await axios.post(
        `/api/games/room/${roomId}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      )
      setPlayerRoomId(roomId)
      setInGame(true)
      window.open(`/game/${response.data.roomId}`, '_blank')
      setInGame(true)
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
      alert(
        'Vous êtes déjà dans une partie. Quittez votre partie actuelle pour en regarder une autre.',
      )
      return
    }
    try {
      const response = await axios.post(
        `/api/games/room/${roomId}/spectate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setPlayerRoomId(roomId)
      window.open(`/game/${response.data.game.id}`, '_blank')
      setInGame(true)
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
      const response = await leaveGame(token)
      if (response.data.message) {
        socket.emit('leaveRoom', {
          roomId: playerRoomId,
          player: user
            ? {
              id: user?.id,
              nickname: response?.nickname,
              realNickname: response?.realNickname,
            }
            : null,
        })
        setPlayerRoomId(null)
        setInGame(false)
        localStorage.removeItem(`game_auth_${playerRoomId}`)
        alert('Vous avez bien quitté votre partie.')
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

  const generateRoomLine = (
    game: RoomData,
    waitingRoom = false,
    featuring = true,
  ): JSX.Element => {
    // Define type colors
    const typeColors = {
      0: 'border-green-600 bg-green-600', // NORMAL
      1: 'bg-blue-500', // FUN
      2: 'bg-red-600', // SERIOUS
      3: 'bg-purple-600', // CARNAGE
      4: 'special-gradient border-yellow-300', // SPECIAL
      5: 'bg-orange-600', // TEST
    }

    const typeColor =
      typeColors[game.type as keyof typeof typeColors] || 'bg-gray-500'

    return (
      <div
        className={`mb-2 backdrop-blur-sm rounded-lg border-l-4 ${typeColor} overflow-hidden`}
      >
        <div className="grid grid-cols-12 items-center p-3">
          <div className="col-span-4 font-medium text-white flex items-center gap-1">
            {game.name}
            <span className="flex gap-1 ml-1">
              {game.discordChannelId && (
                <>
                  <Mic size={16} data-tooltip-id={`voice_${game.id}`} />
                  <Tooltip id={`voice_${game.id}`} content="Partie vocale" />
                </>
              )}
              {game.whiteFlag && (
                <>
                  <Flag size={16} data-tooltip-id={`flag_${game.id}`} />
                  <Tooltip id={`flag_${game.id}`} content="Sans points" />
                </>
              )}
              {game.anonymousGame && (
                <>
                  <Ghost size={16} data-tooltip-id={`anon_${game.id}`} />
                  <Tooltip id={`anon_${game.id}`} content="Partie anonyme" />
                </>
              )}
              {game.password && (
                <>
                  <Lock size={16} data-tooltip-id={`private_${game.id}`} />
                  <Tooltip id={`private_${game.id}`} content="Partie privée" />
                </>
              )}
            </span>
          </div>
          <div className="col-span-3 text-blue-300">{game.creator}</div>
          <div
            className="col-span-2 text-center text-gray-300"
            data-tooltip-id={`${game.id}_players`}
            data-tooltip-html={`<h5>Joueurs dans la partie:</h5><br>${game.players?.map(p => p.nickname).join(', ')}`}
          >
            {game.players?.length}/{game.maxPlayers}
          </div>
          <div className="col-span-3 flex justify-end gap-2">
            {!inGame ? (
              <>
                <button
                  className="px-3 py-1 bg-black/60 hover:bg-black/80 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-colors text-sm"
                  onClick={() => handleSpectateRoom(game.id)}
                >
                  Observer
                </button>
                {waitingRoom && (
                  <>
                    <button
                      className={`px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors text-sm ${game.discordChannelId && !user?.discordId ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleJoinRoom(game.id)}
                      disabled={!!(game.discordChannelId && !user?.discordId)}
                      data-tooltip-id={
                        game.discordChannelId && !user?.discordId
                          ? `discord_${game.id}`
                          : undefined
                      }
                      data-tooltip-content={
                        game.discordChannelId && !user?.discordId
                          ? 'Liez votre compte Discord pour rejoindre une partie vocale'
                          : undefined
                      }
                    >
                      Jouer
                    </button>
                    {game.discordChannelId && !user?.discordId && (
                      <Tooltip id={`discord_${game.id}`} />
                    )}
                  </>
                )}
              </>
            ) : (
              inGame &&
              game.id === playerRoomId && (
                <>
                  <button
                    className="px-3 py-1 bg-red-900/40 hover:bg-red-900/60 text-red-300 hover:text-white border border-red-500/30 rounded-lg transition-colors text-sm"
                    onClick={handleLeaveRoom}
                  >
                    Quitter
                  </button>
                  <button
                    className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors text-sm"
                    onClick={handleJoinCurrentRoom}
                  >
                    Rejoindre
                  </button>
                </>
              )
            )}
          </div>
        </div>
      </div>
    )
  }

  const GenerateBloc: React.FC<{
    className: string;
    title: string;
    rooms: RoomData[];
    inGame: boolean;
    waiting: boolean;
  }> = ({ className, title, rooms, inGame, waiting }) => {
    return (
      <div className="w-full lg:w-1/2 px-2">
        <div className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-3 border-b border-blue-500/30">
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-12 items-center px-3 py-2 mb-2 bg-black/30 rounded-lg text-sm text-gray-400">
              <div className="col-span-4">Nom</div>
              <div className="col-span-3">Créateur</div>
              <div className="col-span-2 text-center">Places</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            {!rooms ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <div className="text-blue-300">Chargement en cours</div>
              </div>
            ) : rooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <h2 className="text-xl text-gray-400 mb-4">
                  Aucune partie en cours.
                </h2>
                {!inGame && (
                  <button
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                    onClick={() => setShowForm(true)}
                  >
                    <img
                      src="/assets/images/hr_v1.png"
                      width={25}
                      height={25}
                      alt="Icon"
                      className="w-5 h-5"
                    />
                    CRÉER UNE PARTIE
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-1">

                {rooms.map((game) => <Tooltip key={game.id} id={`${game.id}_players`} />)}
                {rooms.map((game) => generateRoomLine(game, waiting))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black text-white p-4">
      {/* Section Ingame */}
      {inGame && (
        <div className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden mb-6 p-6">
          <h2 className="text-2xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Tu es déjà en jeu
          </h2>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            {playerRoomId && (
              <>
                <button
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20"
                  onClick={handleJoinCurrentRoom}
                >
                  Rejoindre la partie en cours
                </button>
                <button
                  className="px-6 py-3 bg-red-900/40 hover:bg-red-900/60 text-red-300 hover:text-white border border-red-500/30 rounded-lg transition-all"
                  onClick={handleLeaveRoom}
                >
                  Quitter la partie
                </button>
              </>
            )}
          </div>

          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-yellow-300">
              Tu dois quitter ta partie en cours pour <b>observer</b> ou{' '}
              <b>jouer</b> une autre partie !
            </span>
          </div>
        </div>
      )}

      {/* Game Types Info */}
      <div className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-3 border-b border-blue-500/30 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Types de parties</h3>
          <button
            onClick={() =>
              setIsGameTypesInfoExpanded(!isGameTypesInfoExpanded)
            }
            className="bg-transparent text-white hover:text-gray-300 p-1 rounded-md"
          >
            {isGameTypesInfoExpanded ? (
              <ChevronUpIcon size={24} />
            ) : (
              <ChevronDownIcon size={24} />
            )}
          </button>
        </div>

        {isGameTypesInfoExpanded && (
          <>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-black/40 rounded-lg p-4 border border-blue-500/20">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-sm mr-2"></div>
                  <h4 className="font-bold">
                    Partie <span className="text-blue-400">FUN</span>
                  </h4>
                </div>
                <p className="text-sm text-gray-300">
                  Des parties rapides, ambiance détente, peu de prise de tête.
                </p>
              </div>

              <div className="bg-black/40 rounded-lg p-4 border border-blue-500/20">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-green-600 rounded-sm mr-2"></div>
                  <h4 className="font-bold">
                    Partie <span className="text-green-500">NORMALE</span>
                  </h4>
                </div>
                <p className="text-sm text-gray-300">
                  Des parties comme dans la vraie vie, réflexion et bluff sont
                  de rigueur.
                </p>
              </div>

              <div className="bg-black/40 rounded-lg p-4 border border-blue-500/20">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-purple-600 rounded-sm mr-2"></div>
                  <h4 className="font-bold">
                    Partie <span className="text-purple-400">CARNAGE</span>
                  </h4>
                </div>
                <p className="text-sm text-gray-300">
                  Très rapide, 6 rôles, peu voire aucune stratégie, beaucoup
                  d'éliminations à chaque tour.
                </p>
              </div>

              <div className="bg-black/40 rounded-lg p-4 border border-blue-500/20">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-red-600 rounded-sm mr-2"></div>
                  <h4 className="font-bold">
                    Partie <span className="text-red-500">SÉRIEUSE</span>
                  </h4>
                </div>
                <p className="text-sm text-gray-300">
                  Demande beaucoup de concentration et de persuasion. Règles
                  strictes favorisant le débat.
                </p>
              </div>
              {/*<div className="bg-black/40 rounded-lg p-4 border border-blue-500/20">
            <div className="flex items-center mb-2">
              <img src="/assets/img/chatelain.png" className="w-6 h-6 mr-2" alt="Partie Premium" />
              <h4 className="font-bold">Partie Premium</h4>
            </div>
            <p className="text-sm text-gray-300">Plus de rôles, plus d'options, plus de tout !</p>
          </div>*/}
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              <div className="bg-black/40 rounded-lg p-4 border border-blue-500/20">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 special-gradient border-yellow-300 rounded-sm mr-2"></div>
                  <h4 className="font-bold">
                    Partie <span className="text-yellow-500">SPÉCIALE</span>
                  </h4>
                </div>
                <p className="text-sm text-gray-300">
                  Une partie spéciale animée par l'équipe du site ! Venez jouer
                  une partie spéciale et unique !
                </p>
              </div>

              <div className="bg-black/40 rounded-lg p-4 border border-blue-500/20">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-orange-600 rounded-sm mr-2"></div>
                  <h4 className="font-bold">
                    Partie <span className="text-orange-500">TEST</span>
                  </h4>
                </div>
                <p className="text-sm text-gray-300">
                  Des parties animées par les développeurs pour tester et
                  déveloper de nouvelles fonctionnalités !
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {!showForm && (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Liste des parties en attente
            </h2>
            <div className="flex flex-wrap -mx-2">
              <GenerateBloc
                className="d-games"
                title="Espace détente"
                rooms={roomsWaitingFun}
                inGame={inGame}
                waiting={true}
              />
              <GenerateBloc
                className="r-games"
                title="Espace réflexion"
                rooms={roomsWaitingSerious}
                inGame={inGame}
                waiting={true}
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Liste des parties en cours
            </h2>
            <div className="flex flex-wrap -mx-2">
              <GenerateBloc
                className="d-games"
                title="Espace détente"
                rooms={roomsInProgressFun}
                inGame={inGame}
                waiting={false}
              />
              <GenerateBloc
                className="r-games"
                title="Espace réflexion"
                rooms={roomsInProgressSerious}
                inGame={inGame}
                waiting={false}
              />
            </div>
          </div>
        </>
      )}

      {!showForm && !inGame && (
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-6">
            Vous n'avez pas trouvé votre bonheur ?
          </h2>
          <button
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 mx-auto"
            onClick={() => setShowForm(true)}
          >
            <img
              src="/assets/images/hr_v1.png"
              width={25}
              height={25}
              alt="Icon"
              className="w-5 h-5"
            />
            CRÉER UNE PARTIE
          </button>
        </div>
      )}

      {showForm && !inGame && (
        <div className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-3 border-b border-blue-500/30 flex items-center">
            <button
              className="mr-4 p-2 hover:bg-black/40 rounded-full transition-colors"
              onClick={() => setShowForm(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-300"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <h3 className="text-xl font-bold text-white">Créer une partie</h3>
          </div>

          <div className="p-6">
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <p className="text-yellow-300">
                Assurez-vous qu'aucune partie similaire à celle que vous
                souhaitez créer n'existe. Les doublons rendent les temps pour
                lancer une partie plus longs.
              </p>
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="text-lg font-medium text-blue-300 mb-4">
                  1 - Choisis le type de partie
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <button
                    className={`px-4 py-2
                    ${formData.type !== 3 ? 'bg-black/40 text-gray-400 rounded-lg border border-gray-700 ' : 'bg-gradient-to-r  from-purple-600 to-purple-900  text-white rounded-lg shadow-lg'}`}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, type: 3, timer: 2 }))
                    }
                  >
                    CARNAGE
                  </button>
                  <button
                    className={`px-4 py-2
                    ${formData.type !== 1 ? 'bg-black/40 text-gray-400 rounded-lg border border-gray-700 ' : 'bg-gradient-to-r from-blue-400 to-blue-600  text-white rounded-lg shadow-lg'}`}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, type: 1 }))
                    }
                  >
                    FUN
                  </button>
                  <button
                    className={`px-4 py-2
                    ${formData.type !== 0 ? 'bg-black/40 text-gray-400 rounded-lg border border-gray-700 ' : 'bg-gradient-to-r from-green-600 to-green-800  text-white rounded-lg shadow-lg'}`}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, type: 0 }))
                    }
                  >
                    NORMALE
                  </button>
                  <button
                    className={`px-4 py-2
                    ${formData.type !== 2 ? 'bg-black/40 text-gray-400 rounded-lg border border-gray-700' : 'bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg shadow-lg'}`}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, type: 2 }))
                    }
                  >
                    SÉRIEUSE
                  </button>
                  {user && hasRole(user, 'Animator') && (
                    <button
                      className={`px-4 py-2
                      ${formData.type !== 4 ? 'bg-black/40 text-gray-400 rounded-lg border border-gray-700' : 'bg-gradient-to-r from-yellow-600 to-yellow-800 text-white rounded-lg shadow-lg'}`}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, type: 4 }))
                      }
                    >
                      SPÉCIALE
                    </button>
                  )}
                  {user && hasRole(user, 'Developer') && (
                    <button
                      className={`px-4 py-2
                      ${formData.type !== 5 ? 'bg-black/40 text-gray-400 rounded-lg border border-gray-700' : 'bg-gradient-to-r from-orange-600 to-orange-800 text-white rounded-lg shadow-lg'}`}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, type: 5 }))
                      }
                    >
                      TEST
                    </button>
                  )}
                </div>

                {formData.type === 3 && (
                  <div className="bg-black/40 rounded-lg p-4 border border-purple-500/20">
                    <p className="text-purple-300">
                      Viens t'amuser avant tout, partie rapide et composition
                      définie.
                    </p>
                  </div>
                )}

                {formData.type === 1 && (
                  <div className="bg-black/40 rounded-lg p-4 border border-blue-500/20">
                    <p className="text-blue-300">
                      Parties idéales pour discuter avec ses amis et jouer dans
                      une ambiance détendue.
                    </p>
                  </div>
                )}

                {formData.type === 0 && (
                  <div className="bg-black/40 rounded-lg p-4 border border-green-500/20">
                    <p className="text-green-300">
                      Tu y trouveras de la réflexion et une bonne ambiance. La
                      participation au débat et l'argumentation sont requises.
                    </p>
                  </div>
                )}

                {formData.type === 2 && (
                  <div className="bg-black/40 rounded-lg p-4 border border-red-500/20">
                    <p className="text-red-300">
                      Règles strictes pour joueurs aimant le challenge.
                      Concentration et participation active. Accroche-toi !
                    </p>
                  </div>
                )}

                {formData.type === 4 && (
                  <div className="bg-black/40 rounded-lg p-4 border border-yellow-500/20">
                    <p className="text-yellow-300">
                      Partie spéciale animée par l'équipe d'animation.
                    </p>
                  </div>
                )}

                {formData.type === 5 && (
                  <div className="bg-black/40 rounded-lg p-4 border border-orange-500/20">
                    <p className="text-orange-300">
                      Partie test pour les développeurs. Aucun points ni badges
                      enregistrés.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-lg font-medium text-blue-300 mb-4">
                  2 - Donne un nom à ta partie
                </h4>
                <input
                  id="game-name"
                  name="name"
                  maxLength={15}
                  type="text"
                  placeholder="Nom de partie"
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-blue-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="flex items-center justify-center py-4">
                <div className="h-px bg-blue-500/20 flex-grow"></div>
                <div className="flex items-center mx-4 space-x-3">
                  <img
                    src="/assets/images/carte1.png"
                    alt="Carte 1"
                    className="w-14 h-14"
                  />
                  <h4 className="text-lg font-medium text-white">
                    Paramétrage de la Partie
                  </h4>
                </div>
                <div className="h-px bg-blue-500/20 flex-grow"></div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-blue-300 mb-4">
                  3 - Choisis le temps de débat
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[2, 3, 4, 5].map((timerValue) => (
                    <button
                      key={timerValue}
                      className={`px-4 py-2 ${formData.timer === timerValue || (formData.type === 3 && timerValue === 2) ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-black/40 border border-blue-500/30 text-blue-300'} rounded-lg transition-colors ${formData.type === 3 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, timer: timerValue }))
                      }
                      disabled={formData.type === 3}
                    >
                      {timerValue} min
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-blue-300 mb-4">
                  4 - Options supplémentaires
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button
                    className={`px-4 py-2 rounded-lg transition-colors ${formData.whiteFlag ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-black/40 border border-blue-500/30 text-blue-300'}`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        whiteFlag: !prev.whiteFlag,
                      }))
                    }
                  >
                    Sans points
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg transition-colors ${formData.anonymousGame ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-black/40 border border-blue-500/30 text-blue-300'}  ${!isPremium ? 'bg-black/40 text-gray-400 rounded-lg border border-gray-700 cursor-not-allowed' : ''}`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        anonymousGame: !prev.anonymousGame,
                      }))
                    }
                    disabled={!isPremium}
                    data-tooltip-id='premiumOptionDisabled1'
                    data-tooltip-content={!isPremium ? 'Réservé aux Premium' : ''}
                  >
                    Anonyme
                  </button>
                  <button
                    className="px-4 py-2 bg-black/40 text-gray-400 rounded-lg border border-gray-700 cursor-not-allowed"
                    disabled={true}
                    data-tooltip-id='premiumOptionDisabled2'
                    data-tooltip-content={!isPremium ? 'Réservé aux Premium' : ''}
                  >
                    Sélective
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg transition-colors ${formData.discordGame ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-black/40 border border-blue-500/30 text-blue-300'}`}
                    onClick={() => setFormData((prev) => ({ ...prev, discordGame: !prev.discordGame }))}
                  >
                    Vocale
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg transition-colors ${formData.privateGame ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-black/40 border border-blue-500/30 text-blue-300'} ${!isPremium ? 'bg-black/40 text-gray-400 rounded-lg border border-gray-700 cursor-not-allowed' : ''}`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        privateGame: !prev.privateGame,
                      }))
                    }
                    disabled={!isPremium}
                    data-tooltip-id='premiumOptionDisabled3'
                    data-tooltip-content={!isPremium ? 'Réservé aux Premium' : ''}
                  >
                    Privée
                  </button>
                </div>
                { [1, 2, 3].map((i) => {
                  return <Tooltip id={`premiumOptionDisabled${i}`} key={`premiumOptionDisabled${i}`} />
                })}
              </div>

              {formData.privateGame && isPremium && (
                <div>
                  <h4 className="text-lg font-medium text-blue-300 mb-4">
                    4b - Donne un mot de passe à ta partie
                  </h4>
                  <input
                    id="game-password"
                    name="password"
                    maxLength={15}
                    type="text"
                    placeholder="Mot de passe"
                    onChange={handleChange}
                    className="w-full bg-black/60 border border-blue-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              )}

              <div>
                <h4 className="text-lg font-medium text-blue-300 mb-4">
                  5 - Nombre de joueurs
                </h4>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg">
                  {formData.type === 3 ? '6 joueurs' : 'de 6 j à 24 j'}
                </button>
              </div>

              <div className="pt-4 text-center">
                <button
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20 text-lg font-medium"
                  onClick={handleSubmit}
                >
                  CRÉER
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default RoomList
