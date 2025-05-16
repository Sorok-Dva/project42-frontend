import type { RoomAttributes, RoomStats } from 'types/room'

// Fonction pour générer une date aléatoire dans les 30 derniers jours
const randomDate = () => {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * 30))
  return date
}

// Fonction pour générer un nombre aléatoire entre min et max
const randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Types de parties avec leurs noms
export const roomTypes = [
  { id: 1, name: 'Standard' },
  { id: 2, name: 'Rapide' },
  { id: 3, name: 'Tournoi' },
  { id: 4, name: 'Personnalisée' },
  { id: 5, name: 'Entraînement' },
]

// Génération de données fictives pour les parties
export const mockRooms: RoomAttributes[] = Array.from({ length: 50 }, (_, i) => {
  const createdAt = randomDate()
  const status = ['waiting', 'in_progress', 'completed'][Math.floor(Math.random() * 3)] as
    | 'waiting'
    | 'in_progress'
    | 'completed'
  const type = randomNumber(1, 5)
  const maxPlayers = [6, 8, 10, 12, 15][Math.floor(Math.random() * 5)]
  const playerCount = status === 'completed' ? maxPlayers : randomNumber(1, maxPlayers)

  return {
    id: i + 1,
    name: `Partie ${i + 1} ${roomTypes.find((t) => t.id === type)?.name}`,
    creator: `Joueur${randomNumber(1, 100)}`,
    instance: randomNumber(1, 3),
    type,
    maxPlayers,
    anonymousVotes: Math.random() > 0.5,
    privateGame: Math.random() > 0.7,
    password: Math.random() > 0.7 ? 'password123' : null,
    status,
    phase: status === 'completed' ? 10 : randomNumber(1, 10),
    limitPhase: new Date(Date.now() + 1000 * 60 * 15),
    timer: randomNumber(30, 120),
    currentRound: status === 'completed' ? randomNumber(5, 10) : randomNumber(1, 5),
    maxRounds: 10,
    pointsMultiplier: randomNumber(1, 3),
    players: Array.from({ length: playerCount }, (_, j) => ({
      id: `player-${j}`,
      username: `Joueur${randomNumber(1, 100)}`,
      isAlive: Math.random() > 0.3,
      isReady: true,
    })),
    cards: Array.from({ length: randomNumber(3, 8) }, (_, j) => ({
      id: j,
      name: `Carte ${j}`,
      type: ['Attaque', 'Défense', 'Spécial'][Math.floor(Math.random() * 3)],
      description: 'Description de la carte',
    })),
    createdAt,
    updatedAt: new Date(createdAt.getTime() + randomNumber(1000 * 60 * 10, 1000 * 60 * 120)),
  }
})

// Statistiques fictives
export const mockRoomStats: RoomStats = {
  totalRooms: mockRooms.length,
  activeRooms: mockRooms.filter((room) => room.status === 'in_progress').length,
  completedRooms: mockRooms.filter((room) => room.status === 'completed').length,
  averagePlayers: Math.round(mockRooms.reduce((acc, room) => acc + (room.players?.length || 0), 0) / mockRooms.length),
  totalPoints: mockRooms.reduce((acc, room) => {
    if (room.status === 'completed') {
      return acc + room.pointsMultiplier * (room.players?.length || 0) * 10
    }
    return acc
  }, 0),

  roomsByType: roomTypes.map((type) => ({
    type: type.id,
    label: type.name,
    count: mockRooms.filter((room) => room.type === type.id).length,
  })),

  roomsByStatus: [
    { status: 'waiting', count: mockRooms.filter((room) => room.status === 'waiting').length },
    { status: 'in_progress', count: mockRooms.filter((room) => room.status === 'in_progress').length },
    { status: 'completed', count: mockRooms.filter((room) => room.status === 'completed').length },
  ],

  pointsDistribution: Array.from({ length: 14 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    return {
      date: dateStr,
      points: randomNumber(100, 1000),
    }
  }).reverse(),

  playerVictories: [
    { role: 'Humain', victories: randomNumber(30, 50) },
    { role: 'Loup-Garou', victories: randomNumber(20, 40) },
    { role: 'Voyante', victories: randomNumber(5, 15) },
    { role: 'Sorcière', victories: randomNumber(5, 15) },
    { role: 'Chasseur', victories: randomNumber(3, 10) },
    { role: 'Cupidon', victories: randomNumber(3, 10) },
  ],
}
