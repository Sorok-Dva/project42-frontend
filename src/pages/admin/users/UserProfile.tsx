'use client'

import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from 'contexts/AuthContext'
import {
  Award,
  Ban,
  Calendar,
  Edit,
  Eye,
  GamepadIcon as GameController,
  MessageSquare,
  Trophy,
  Users,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/UI/Tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/UI/Card'
import { Badge } from 'components/UI/Badge'
import { Avatar, AvatarFallback, AvatarImage } from 'components/UI/Avatar'
import { Progress } from 'components/UI/Progress'
import { Button } from 'components/UI/Button'
import { Separator } from 'components/UI/Separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'components/UI/Table'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from 'components/UI/Chart'
import { toast } from 'react-toastify'

// Données fictives pour la démo
const mockUser = {
  id: 1,
  email: 'player@example.com',
  nickname: 'SpaceCommander',
  avatar: '/placeholder.svg?height=128&width=128',
  isMale: true,
  role: { id: 3, name: 'Modérateur', color: '#4CAF50' },
  points: 12450,
  level: 42,
  title: 'Explorateur Galactique',
  signature: 'Vers l\'infini et au-delà!',
  premium: new Date('2023-12-31'),
  validated: true,
  registerIp: '192.168.1.1',
  lastLoginIp: '192.168.1.2',
  behaviorPoints: 950,
  moderatorPoints: 320,
  discordId: 'discord123456',
  lastNicknameChange: new Date('2023-06-15'),
  createdAt: new Date('2022-01-15'),
  guildMembership: {
    guild: {
      id: 5,
      name: 'Guardians of the Galaxy',
      tag: 'GOTG',
      points: 45000,
      leader: 1,
    },
    role: 'captain',
  },
}

const mockAchievements = [
  {
    id: 1,
    name: 'Premier Pas',
    description: 'Jouer sa première partie',
    level: 1,
    maxLevel: 3,
    progress: 100,
    icon: '🚀',
    date: '2022-01-16',
  },
  {
    id: 2,
    name: 'Bavard',
    description: 'Envoyer des messages',
    level: 3,
    maxLevel: 5,
    progress: 60,
    icon: '💬',
    date: '2022-02-20',
  },
  {
    id: 3,
    name: 'Stratège',
    description: 'Gagner des parties',
    level: 2,
    maxLevel: 5,
    progress: 40,
    icon: '🏆',
    date: '2022-03-10',
  },
  {
    id: 4,
    name: 'Explorateur',
    description: 'Découvrir différents modes de jeu',
    level: 4,
    maxLevel: 4,
    progress: 100,
    icon: '🔭',
    date: '2022-05-22',
  },
  {
    id: 5,
    name: 'Fidèle',
    description: 'Se connecter plusieurs jours de suite',
    level: 2,
    maxLevel: 3,
    progress: 66,
    icon: '📅',
    date: '2022-04-05',
  },
]

const mockNicknameChanges = [
  { id: 1, oldNickname: 'SpaceCadet', newNickname: 'SpaceExplorer', date: '2022-03-15' },
  { id: 2, oldNickname: 'SpaceExplorer', newNickname: 'GalacticHero', date: '2022-09-22' },
  { id: 3, oldNickname: 'GalacticHero', newNickname: 'SpaceCommander', date: '2023-06-15' },
]

const mockBans = [
  {
    id: 1,
    reason: 'Langage inapproprié',
    moderator: 'AdminSupreme',
    expiration: '2022-05-15',
    date: '2022-05-01',
    playerComment: 'Je ne recommencerai pas',
    teamComment: 'Premier avertissement',
  },
  {
    id: 2,
    reason: 'Triche',
    moderator: 'ModeratorX',
    expiration: '2022-08-30',
    date: '2022-08-15',
    playerComment: 'Ce n\'était pas intentionnel',
    teamComment: 'Récidive, ban plus long',
  },
]

const mockRooms = [
  {
    id: 1,
    name: 'Bataille Spatiale',
    type: 'Compétitif',
    status: 'completed',
    result: 'Victoire',
    date: '2023-01-05',
    players: 8,
    points: 120,
  },
  {
    id: 2,
    name: 'Mission Alpha',
    type: 'Casual',
    status: 'completed',
    result: 'Défaite',
    date: '2023-01-12',
    players: 6,
    points: 45,
  },
  {
    id: 3,
    name: 'Exploration Nébuleuse',
    type: 'Compétitif',
    status: 'completed',
    result: 'Victoire',
    date: '2023-01-20',
    players: 10,
    points: 150,
  },
  {
    id: 4,
    name: 'Défense Stellaire',
    type: 'Tournoi',
    status: 'completed',
    result: 'Top 3',
    date: '2023-02-05',
    players: 16,
    points: 200,
  },
  {
    id: 5,
    name: 'Conquête Galactique',
    type: 'Compétitif',
    status: 'in_progress',
    result: 'En cours',
    date: '2023-02-15',
    players: 8,
    points: 0,
  },
]

const mockMessages = [
  { id: 1, roomId: 1, channel: 'Global', message: 'Bonjour à tous!', date: '2023-01-05 14:30' },
  { id: 2, roomId: 1, channel: 'Équipe', message: 'On se positionne à gauche', date: '2023-01-05 14:35' },
  { id: 3, roomId: 2, channel: 'Global', message: 'Bonne chance!', date: '2023-01-12 19:22' },
  { id: 4, roomId: 3, channel: 'Privé', message: 'On peut s\'allier?', date: '2023-01-20 20:15' },
  { id: 5, roomId: 4, channel: 'Global', message: 'Bien joué tout le monde', date: '2023-02-05 21:45' },
]

// Données pour les graphiques
const gameActivityData = [
  { name: 'Jan', parties: 5, messages: 45 },
  { name: 'Fév', parties: 8, messages: 62 },
  { name: 'Mar', parties: 12, messages: 78 },
  { name: 'Avr', parties: 7, messages: 51 },
  { name: 'Mai', parties: 15, messages: 85 },
  { name: 'Juin', parties: 10, messages: 70 },
  { name: 'Juil', parties: 18, messages: 92 },
  { name: 'Août', parties: 14, messages: 88 },
  { name: 'Sep', parties: 20, messages: 110 },
  { name: 'Oct', parties: 16, messages: 95 },
  { name: 'Nov', parties: 22, messages: 120 },
  { name: 'Déc', parties: 25, messages: 135 },
]

const gameResultsData = [
  { name: 'Victoires', value: 65, color: '#4CAF50' },
  { name: 'Défaites', value: 25, color: '#F44336' },
  { name: 'Égalités', value: 10, color: '#2196F3' },
]

const messageTypeData = [
  { name: 'Global', value: 45, color: '#9C27B0' },
  { name: 'Équipe', value: 30, color: '#3F51B5' },
  { name: 'Privé', value: 15, color: '#FF9800' },
  { name: 'Système', value: 10, color: '#607D8B' },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

const UserDetailsPage: React.FC = () => {
  const params = useParams()
  const userId = params.id
  const [user, setUser] = useState(mockUser)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simuler le chargement des données
    const fetchUserData = async () => {
      try {
        // Dans une implémentation réelle, vous feriez un appel API ici
        // const response = await fetch(`/api/admin/users/${userId}`)
        // const data = await response.json()
        // setUser(data)

        // Simulation de chargement
        setTimeout(() => {
          setUser(mockUser)
          setLoading(false)
        }, 1000)
      } catch (err) {
        setError('Erreur lors du chargement des données utilisateur')
        setLoading(false)
      }
    }

    fetchUserData()
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin"></div>
          <p className="text-xl font-semibold text-gray-700">Chargement des données utilisateur...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    )
  }

  const isPremium = user.premium && new Date(user.premium) > new Date()
  const daysSinceRegistration = Math.floor(
    (new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 3600 * 24),
  )

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            Retour
          </Button>
          <h1 className="text-3xl font-bold">Détails de l'utilisateur</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Edit size={16} />
            Modifier
          </Button>
          <Button variant="destructive" className="flex items-center gap-2">
            <Ban size={16} />
            Bannir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Carte de profil */}
        <Card className="md:col-span-1 backdrop-blur-md bg-opacity-80 bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Profil</CardTitle>
            <CardDescription>Informations de base</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-32 h-32 border-4 border-primary">
                <AvatarImage src={user.avatar || '/placeholder.svg'} alt={user.nickname} />
                <AvatarFallback>{user.nickname.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-2xl font-bold">{user.nickname}</h2>
                <p className="text-muted-foreground">{user.title}</p>
                <div className="flex justify-center mt-2 space-x-2">
                  <Badge variant="outline" className="bg-primary/20">
                    Niveau {user.level}
                  </Badge>
                  {isPremium && <Badge className="bg-amber-500">Premium</Badge>}
                  {user.validated && <Badge className="bg-green-600">Vérifié</Badge>}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Discord</p>
                <p className="font-medium">{user.discordId || 'Non lié'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rôle</p>
                <Badge style={{ backgroundColor: user.role.color }}>{user.role.name}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Membre depuis</p>
                <p className="font-medium">
                  {formatDate(user.createdAt)} ({daysSinceRegistration} jours)
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dernière connexion</p>
                <p className="font-medium">Aujourd'hui, 15:42</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Signature</p>
                <p className="italic text-sm">{user.signature}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-sm font-medium">Points</p>
                  <p className="text-sm font-medium">{user.points}</p>
                </div>
                <Progress value={(user.points % 1000) / 10} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-sm font-medium">Comportement</p>
                  <p className="text-sm font-medium">{user.behaviorPoints}/1000</p>
                </div>
                <Progress value={user.behaviorPoints / 10} className="h-2" />
              </div>
              {user.role.id <= 3 && (
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm font-medium">Points modération</p>
                    <p className="text-sm font-medium">{user.moderatorPoints}/1000</p>
                  </div>
                  <Progress value={user.moderatorPoints / 10} className="h-2" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contenu principal avec onglets */}
        <div className="md:col-span-2 space-y-6">
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="backdrop-blur-md bg-opacity-80 bg-gray-900 border-gray-800">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-medium flex items-center">
                  <GameController className="mr-2 h-4 w-4" />
                  Parties jouées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">172</div>
                <p className="text-xs text-muted-foreground">+15% ce mois-ci</p>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-md bg-opacity-80 bg-gray-900 border-gray-800">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Trophy className="mr-2 h-4 w-4" />
                  Victoires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">112</div>
                <p className="text-xs text-muted-foreground">Taux: 65%</p>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-md bg-opacity-80 bg-gray-900 border-gray-800">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-medium flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,254</div>
                <p className="text-xs text-muted-foreground">~7.3 par partie</p>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-md bg-opacity-80 bg-gray-900 border-gray-800">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Award className="mr-2 h-4 w-4" />
                  Succès
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">28/50</div>
                <p className="text-xs text-muted-foreground">56% complétés</p>
              </CardContent>
            </Card>
          </div>

          {/* Onglets d'information */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-7 mb-4">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="achievements">Succès</TabsTrigger>
              <TabsTrigger value="guild">Guilde</TabsTrigger>
              <TabsTrigger value="games">Parties</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="nicknames">Pseudos</TabsTrigger>
              <TabsTrigger value="sanctions">Sanctions</TabsTrigger>
            </TabsList>

            {/* Vue d'ensemble */}
            <TabsContent value="overview" className="space-y-4">
              <Card className="backdrop-blur-md bg-opacity-80 bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Activité mensuelle</CardTitle>
                  <CardDescription>Parties jouées et messages envoyés</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer
                      config={{
                        parties: {
                          label: 'Parties',
                          color: 'hsl(var(--chart-1))',
                        },
                        messages: {
                          label: 'Messages',
                          color: 'hsl(var(--chart-2))',
                        },
                      }}
                      className="h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={gameActivityData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                          <YAxis stroke="rgba(255,255,255,0.5)" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="parties"
                            stroke="var(--color-parties)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="messages"
                            stroke="var(--color-messages)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="backdrop-blur-md bg-opacity-80 bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle>Résultats des parties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={gameResultsData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {gameResultsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} parties`, '']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-md bg-opacity-80 bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle>Types de messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={messageTypeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {messageTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, '']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Succès */}
            <TabsContent value="achievements">
              <Card className="backdrop-blur-md bg-opacity-80 bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Succès débloqués</CardTitle>
                  <CardDescription>5 succès sur 50 complétés</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {mockAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="border border-gray-800 rounded-lg p-4 backdrop-blur-sm bg-gray-900/50"
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-4 text-3xl">{achievement.icon}</div>
                          <div className="flex-grow">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">{achievement.name}</h3>
                                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                              </div>
                              <Badge variant={achievement.progress === 100 ? 'default' : 'outline'}>
                                Niveau {achievement.level}/{achievement.maxLevel}
                              </Badge>
                            </div>
                            <div className="mt-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progression</span>
                                <span>{achievement.progress}%</span>
                              </div>
                              <Progress value={achievement.progress} className="h-2" />
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">Débloqué le {achievement.date}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Guilde */}
            <TabsContent value="guild">
              {user.guildMembership ? (
                <Card className="backdrop-blur-md bg-opacity-80 bg-gray-900 border-gray-800">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Membre de guilde</CardTitle>
                        <CardDescription>Informations sur l'appartenance à une guilde</CardDescription>
                      </div>
                      <Badge className="bg-blue-600">
                        {user.guildMembership.role === 'captain'
                          ? 'Capitaine'
                          : user.guildMembership.role === 'lieutenant'
                            ? 'Lieutenant'
                            : user.guildMembership.role === 'ensign'
                              ? 'Enseigne'
                              : user.guildMembership.role === 'cadet'
                                ? 'Cadet'
                                : 'Membre'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center text-2xl">
                        {user.guildMembership.guild.tag}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{user.guildMembership.guild.name}</h3>
                        <p className="text-sm text-muted-foreground">Tag: [{user.guildMembership.guild.tag}]</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Trophy className="h-5 w-5 text-yellow-500" />
                          <span className="text-sm font-medium">Points de guilde</span>
                        </div>
                        <p className="text-2xl font-bold mt-2">{user.guildMembership.guild.points}</p>
                      </div>

                      <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Users className="h-5 w-5 text-blue-500" />
                          <span className="text-sm font-medium">Position</span>
                        </div>
                        <p className="text-2xl font-bold mt-2">
                          {user.guildMembership.role === 'captain'
                            ? 'Capitaine'
                            : user.guildMembership.role === 'lieutenant'
                              ? 'Lieutenant'
                              : user.guildMembership.role === 'ensign'
                                ? 'Enseigne'
                                : 'Membre'}
                        </p>
                      </div>

                      <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5 text-green-500" />
                          <span className="text-sm font-medium">Date d'adhésion</span>
                        </div>
                        <p className="text-2xl font-bold mt-2">15/03/2022</p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold mb-2">Contribution aux points</h3>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: 'Jan', points: 150 },
                              { name: 'Fév', points: 220 },
                              { name: 'Mar', points: 180 },
                              { name: 'Avr', points: 240 },
                              { name: 'Mai', points: 280 },
                              { name: 'Juin', points: 320 },
                            ]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                            <YAxis stroke="rgba(255,255,255,0.5)" />
                            <Tooltip />
                            <Bar dataKey="points" fill="#3B82F6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="backdrop-blur-md bg-opacity-80 bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle>Aucune guilde</CardTitle>
                    <CardDescription>L'utilisateur n'appartient à aucune guilde</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-8">
                      <Users className="h-16 w-16 text-gray-500 mb-4" />
                      <p className="text-muted-foreground text-center">
                        Cet utilisateur n'est actuellement membre d'aucune guilde.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Parties */}
            <TabsContent value="games">
              <Card className="backdrop-blur-md bg-opacity-80 bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Historique des parties</CardTitle>
                  <CardDescription>Dernières parties jouées</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Joueurs</TableHead>
                        <TableHead>Résultat</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockRooms.map((room) => (
                        <TableRow key={room.id}>
                          <TableCell className="font-medium">{room.id}</TableCell>
                          <TableCell>{room.name}</TableCell>
                          <TableCell>{room.type}</TableCell>
                          <TableCell>{room.date}</TableCell>
                          <TableCell>{room.players}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                room.result === 'Victoire'
                                  ? 'bg-green-500/20 text-green-500'
                                  : room.result === 'Défaite'
                                    ? 'bg-red-500/20 text-red-500'
                                    : room.result === 'En cours'
                                      ? 'bg-blue-500/20 text-blue-500'
                                      : 'bg-yellow-500/20 text-yellow-500'
                              }
                            >
                              {room.result}
                            </Badge>
                          </TableCell>
                          <TableCell>{room.points}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Messages */}
            <TabsContent value="messages">
              <Card className="backdrop-blur-md bg-opacity-80 bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Historique des messages</CardTitle>
                  <CardDescription>Derniers messages envoyés</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Salle</TableHead>
                        <TableHead>Canal</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockMessages.map((message) => (
                        <TableRow key={message.id}>
                          <TableCell className="font-medium">{message.id}</TableCell>
                          <TableCell>{message.roomId}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                message.channel === 'Global'
                                  ? 'bg-purple-500/20 text-purple-500'
                                  : message.channel === 'Équipe'
                                    ? 'bg-blue-500/20 text-blue-500'
                                    : message.channel === 'Privé'
                                      ? 'bg-orange-500/20 text-orange-500'
                                      : 'bg-gray-500/20 text-gray-500'
                              }
                            >
                              {message.channel}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{message.message}</TableCell>
                          <TableCell>{message.date}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pseudos */}
            <TabsContent value="nicknames">
              <Card className="backdrop-blur-md bg-opacity-80 bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Historique des pseudonymes</CardTitle>
                  <CardDescription>Changements de pseudonyme</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Ancien pseudonyme</TableHead>
                        <TableHead>Nouveau pseudonyme</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockNicknameChanges.map((change) => (
                        <TableRow key={change.id}>
                          <TableCell className="font-medium">{change.id}</TableCell>
                          <TableCell>{change.oldNickname}</TableCell>
                          <TableCell>{change.newNickname}</TableCell>
                          <TableCell>{change.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sanctions */}
            <TabsContent value="sanctions">
              <Card className="backdrop-blur-md bg-opacity-80 bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Historique des sanctions</CardTitle>
                  <CardDescription>Bannissements et avertissements</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Raison</TableHead>
                        <TableHead>Modérateur</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Expiration</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockBans.map((ban) => (
                        <TableRow key={ban.id}>
                          <TableCell className="font-medium">{ban.id}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">Bannissement</Badge>
                          </TableCell>
                          <TableCell>{ban.reason}</TableCell>
                          <TableCell>{ban.moderator}</TableCell>
                          <TableCell>{ban.date}</TableCell>
                          <TableCell>{ban.expiration}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-6 space-y-4">
                    <h3 className="font-semibold">Détails de la sanction</h3>
                    {mockBans.length > 0 && (
                      <div className="border border-gray-800 rounded-lg p-4 backdrop-blur-sm bg-gray-900/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Commentaire du joueur</h4>
                            <p className="mt-1">{mockBans[0].playerComment}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Commentaire de l'équipe</h4>
                            <p className="mt-1">{mockBans[0].teamComment}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default UserDetailsPage
