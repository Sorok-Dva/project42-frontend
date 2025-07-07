'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { staticStars, parallaxStars, orbitingStations } from 'utils/animations'
import {
  Users,
  Crown,
  Calendar,
  Shield,
  Trophy,
  ArrowLeft,
  UserPlus,
  Globe,
  MessageSquare,
  CheckCircle,
  XCircle,
  ArrowUp,
  LogOut,
} from 'lucide-react'
import { useUser } from 'contexts/UserContext'
import { useAuth } from 'contexts/AuthContext'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import JoinGuildModal from 'components/Guilds/JoinModal'
import { Guild } from 'types/guild'
import MarkdownEditor, {
  renderPreview,
} from 'components/Common/MarkdownEditor'
import { Announcement } from 'types/announcement'

interface GuildApplication {
  id: number
  userId: number
  guildId: number
  motivationText: string
  user: {
    id: number
    nickname: string
    avatar: string
    points: number
  }
}

const guildRoles: Record<string, string> = {
  captain: 'Capitaine',
  lieutenant: 'Lieutenant',
  ensign: 'Enseigne',
  cadet: 'Cadet',
  trial: 'Essai',
  punished: 'Punis',
}

const GuildDetailsView = () => {
  const { id: tag } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()
  const { user, reloadUser } = useUser()

  const [guild, setGuild] = useState<Guild | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('members')
  const [belongsToGuild, setBelongsToGuild] = useState(false)
  const [permissions, setPermissions] = useState<{ level: number; role: string }>({ level: 0, role: 'none' })
  const [applications, setApplications] = useState<GuildApplication[]>([])
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [editingPresentation, setEditingPresentation] = useState(false)
  const [presentationText, setPresentationText] = useState('')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [newAnnouncement, setNewAnnouncement] = useState('')
  const [creatingAnnouncement, setCreatingAnnouncement] = useState(false)

  useEffect(() => {
    const fetchGuild = async () => {
      try {
        setLoading(true)
        const response = await axios.get<Guild>(`/api/guilds/info/${tag}`)
        setGuild(response.data)
        setPresentationText(response.data.description || '')
        document.title = `Station ${response.data.name} [${response.data.tag}] - Project 42`
      } catch (err: any) {
        console.log('failed to fetch guild data', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGuild()

    window.addEventListener('reloadGuildData', fetchGuild)

    return () => {
      window.removeEventListener('reloadGuildData', fetchGuild)
      document.title = 'Project 42'
    }
  }, [tag])

  useEffect(() => {
    if (user?.guildMembership?.guild.id === guild?.id) {
      setBelongsToGuild(true)
    }
  }, [user, guild])

  useEffect(() => {
    if (!guild) return

    const fetchPermissions = async () => {
      try {
        const response = await axios.get(`/api/guilds/${guild.id}/permissions`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.status === 200) {
          setPermissions(response.data)
        }
      } catch (error) {
        console.error(error)
      }
    }

    const fetchApplications = async () => {
      try {
        const response = await axios.get(`/api/guilds/${guild.id}/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.status === 200) {
          setApplications(response.data)
        }
      } catch (error) {
        console.error(error)
      }
    }

    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get(`/api/guilds/${guild.id}/announcements`)
        if (response.status === 200) {
          setAnnouncements(response.data)
        }
      } catch (error) {
        console.error(error)
      }
    }

    if (belongsToGuild) {
      fetchPermissions()
      fetchApplications()
    }
    fetchAnnouncements()
  }, [guild, belongsToGuild, token])

  const handleLeaveGuild = async () => {
    try {
      if (confirm('Voulez vous vraiment quitter votre station ?')) {
        const response = await axios.post(
          '/api/guilds/leave',
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        if (response.status === 200) {
          toast.warn('Vous avez bien quitté votre station', ToastDefaultOptions)
          window.dispatchEvent(new CustomEvent('reloadGuildData'))
          reloadUser(true)
        }
      }
    } catch (err: any) {
      console.log('failed to leave guild', err)
    }
  }

  const handleAcceptApplication = async (id: number, isAccepted: boolean, nickname: string) => {
    if (permissions.level <= 1) return
    try {
      const response = await axios.get(
        `/api/guilds/${guild!.id}/application/${id}/${isAccepted ? 'accept' : 'refuse'}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (response.status === 200) {
        setApplications(applications.filter((a) => a.id !== id))
        toast.success(
          `Vous avez ${isAccepted ? 'accepté' : 'refusé'} la candidature de ${nickname} avec succès.`,
          ToastDefaultOptions,
        )
        if (isAccepted) window.dispatchEvent(new CustomEvent('reloadGuildData'))
      }
    } catch (error) {
      toast.error('Une erreur est survenue.', ToastDefaultOptions)
    }
  }

  const handleKickUser = async (userId: number, nickname: string) => {
    try {
      if (confirm('Voulez vous vraiment expulser ce joueur de votre station ?')) {
        const response = await axios.post(
          `/api/guilds/${guild!.id}/kick/${userId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        if (response.status === 200) {
          toast.info(`Vous avez bien expulsé ${nickname} de votre station.`, ToastDefaultOptions)
          window.dispatchEvent(new CustomEvent('reloadGuildData'))
        }
      }
    } catch (error) {
      toast.error('Une erreur est survenue.', ToastDefaultOptions)
    }
  }

  const savePresentation = async () => {
    try {
      const response = await axios.put(
        `/api/guilds/${guild!.id}/description`,
        { description: presentationText },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (response.status === 200) {
        setGuild({ ...guild!, description: presentationText })
        setEditingPresentation(false)
        toast.success('Présentation mise à jour.', ToastDefaultOptions)
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour.', ToastDefaultOptions)
    }
  }

  const createAnnouncement = async () => {
    try {
      const response = await axios.post(
        `/api/guilds/${guild!.id}/announcements`,
        { content: newAnnouncement },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (response.status === 201) {
        setAnnouncements([response.data, ...announcements])
        setNewAnnouncement('')
        setCreatingAnnouncement(false)
        toast.success('Annonce publiée.', ToastDefaultOptions)
      }
    } catch (error) {
      toast.error('Erreur lors de la publication.', ToastDefaultOptions)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
    case 'captain':
      return <Crown className="w-4 h-4 text-yellow-400" />
    case 'lieutenant':
      return <Shield className="w-4 h-4 text-blue-400" />
    default:
      return <Users className="w-4 h-4 text-gray-400" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
    case 'captain':
      return 'text-yellow-400'
    case 'lieutenant':
      return 'text-blue-400'
    default:
      return 'text-gray-400'
    }
  }

  if (loading || !guild) {
    return (
      <motion.main className="relative flex min-h-screen pt-100 flex-col items-center justify-center overflow-hidden bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black px-4 text-white">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-gray-300">Chargement des informations de la station...</span>
        </div>
      </motion.main>
    )
  }

  const leaderNickname = guild.members.find((m) => guild.leader === m.userId)?.user.nickname || ''

  return (
    <motion.main className="relative flex min-h-screen pt-100 flex-col items-center justify-center overflow-hidden bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black px-4 text-white">
      {/* Fond étoilé statique */}
      <div className="absolute inset-0 z-0">{staticStars}</div>

      {/* Nébuleuses colorées */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(circle at 70% 30%, rgba(111, 66, 193, 0.6), transparent 60%), radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.6), transparent 60%), radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3), transparent 70%)',
          }}
        />
      </div>

      {/* Étoiles avec parallaxe */}
      <div className="absolute inset-0 z-1">{parallaxStars}</div>

      {/* Station spatiale principale */}
      <div className="absolute z-5 h-full flex items-center pointer-events-none" style={{ left: '1%', width: '100%' }}>
        <motion.div
          animate={{
            scale: [1, 1.08, 1.02, 1.08, 1],
            rotate: [0, 2, 0, -2, 0],
            y: [0, -15, 5, -15, 0],
          }}
          transition={{
            duration: 60,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
            times: [0, 0.25, 0.5, 0.75, 1],
          }}
          className="relative"
          style={{ width: '100%', maxWidth: '730px' }}
        >
          <img
            src="/images/station.png"
            alt="Station spatiale principale"
            className="opacity-80"
            style={{ width: '750px' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 mix-blend-overlay rounded-full blur-xl"></div>
        </motion.div>
      </div>

      {/* Stations spatiales en orbite */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">{orbitingStations}</div>

      <motion.div
        className="relative z-20 w-full max-w-7xl mx-auto my-8 p-8 md:p-12 bg-black/40 backdrop-blur-md rounded-2xl border border-gray-800/50 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Bouton retour */}
        <button
          onClick={() => navigate('/stations')}
          className="flex items-center space-x-2 mb-6 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au classement</span>
        </button>

        {/* Bannière de la guilde */}
        <div className="relative overflow-hidden rounded-xl mb-8">
          <div className="h-64 bg-gradient-to-r from-gray-900 to-gray-800">
            <img
              src={guild.banner || '/img/stations_banner.png'}
              alt={`Bannière ${guild.name}`}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center space-x-4 mb-2">
                  <h1 className="text-4xl font-bold text-white">{guild.name}</h1>
                  <span className="px-3 py-1 bg-blue-600/80 text-blue-100 rounded-full text-lg font-medium">
                    [{guild.tag}]
                  </span>
                  <div className="flex items-center space-x-1">
                    <Globe className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 text-sm">Publique</span>
                  </div>
                </div>
                <p className="text-gray-300 text-lg max-w-2xl">
                  {guild.description || 'Aucune description disponible'}
                </p>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text">
                  {guild.points.toLocaleString()}
                </div>
                <div className="text-gray-400">points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques de la guilde */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 rounded-lg p-6 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{guild.members.length}</div>
            <div className="text-gray-400">Membres</div>
            <div className="text-sm text-gray-500">/ 50 max</div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6 text-center">
            <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">{leaderNickname}</div>
            <div className="text-gray-400">Capitaine</div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{guild.points.toLocaleString()}</div>
            <div className="text-gray-400">Points</div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6 text-center">
            <Calendar className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">{new Date(guild.createdAt).toLocaleDateString()}</div>
            <div className="text-gray-400">Créée le</div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="flex space-x-1 mb-6 bg-gray-800/30 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('presentation')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'presentation' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Présentation
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'members' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Membres ({guild.members.length})
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'announcements' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Annonces
          </button>
          {belongsToGuild && (
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'applications' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Candidatures {applications.length > 0 && `(${applications.length})`}
            </button>
          )}
        </div>

        {/* Contenu des onglets */}
        <div className="bg-gray-800/30 rounded-xl p-6">
          {activeTab === 'presentation' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">À propos de la station</h2>
              {editingPresentation ? (
                <div className="space-y-4">
                  <MarkdownEditor value={presentationText} onChange={setPresentationText} />
                  <div className="flex space-x-2">
                    <button
                      onClick={savePresentation}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => setEditingPresentation(false)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    className="text-gray-300 text-lg space-y-2"
                    dangerouslySetInnerHTML={{ __html: renderPreview(guild.description || 'Aucune description disponible') }}
                  />
                  {(permissions.role === 'captaine' || permissions.role === 'moderator') && (
                    <button
                      onClick={() => { setEditingPresentation(true); setPresentationText(guild.description || '') }}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      Modifier
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Users className="w-6 h-6 mr-2" />
                  Membres de la station
                </h2>
                {!user?.guildMembership && (
                  <button
                    onClick={() => setIsJoinModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Rejoindre</span>
                  </button>
                )}
                {belongsToGuild && (
                  <button
                    onClick={handleLeaveGuild}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Quitter</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {guild.members.map((member, index) => {
                  const isLeader = member.userId === guild.leader
                  return (
                    <motion.div
                      key={member.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <img
                              src={member.user.avatar || '/placeholder.svg'}
                              alt={member.user.nickname}
                              className="w-full h-full rounded-full object-cover"
                            />
                          </div>
                          <div
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                              member.isOnline || member.userId === user?.id ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          ></div>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span
                              className="font-semibold text-white cursor-pointer hover:text-blue-400"
                              data-profile={member.user.nickname}
                            >
                              {member.user.nickname}
                            </span>
                            {getRoleIcon(member.role)}
                            <span className={`text-sm ${getRoleColor(member.role)}`}>
                              {guildRoles[member.role] || member.role}
                            </span>
                            {isLeader && <Crown className="w-4 h-4 text-yellow-400" />}
                          </div>
                          <div className="text-sm text-gray-400">{member.user.points.toLocaleString()} points</div>
                        </div>
                      </div>

                      {permissions.level > 1 && member.userId !== user?.id && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => console.log('promote')}
                            className="p-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-lg transition-colors"
                            title={`Promouvoir ${member.user.nickname}`}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleKickUser(member.userId, member.user.nickname)}
                            className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors"
                            title={`Expulser ${member.user.nickname}`}
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Annonces de la station</h2>
              {creatingAnnouncement ? (
                <div className="space-y-4 mb-6">
                  <MarkdownEditor value={newAnnouncement} onChange={setNewAnnouncement} />
                  <div className="flex space-x-2">
                    <button
                      onClick={createAnnouncement}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      Publier
                    </button>
                    <button
                      onClick={() => setCreatingAnnouncement(false)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                (permissions.role === 'captaine' || permissions.role === 'lieutenant' || permissions.role === 'moderator') && (
                  <button
                    onClick={() => setCreatingAnnouncement(true)}
                    className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    Nouvelle annonce
                  </button>
                )
              )}

              {announcements.length === 0 ? (
                <p className="text-gray-400">Aucune annonce pour le moment.</p>
              ) : (
                <div className="space-y-4">
                  {announcements.map((a) => (
                    <div key={a.id} className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="text-sm text-gray-400 mb-2">
                        {a.author.nickname} – {new Date(a.createdAt).toLocaleDateString()}
                      </div>
                      <div
                        className="prose prose-invert"
                        dangerouslySetInnerHTML={{ __html: renderPreview(a.content) }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'applications' && belongsToGuild && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Candidatures en attente</h2>
              {applications.length === 0 ? (
                <p className="text-gray-400">Aucune candidature en attente.</p>
              ) : (
                <div className="space-y-3">
                  {applications.map((application) => (
                    <div
                      key={application.id}
                      className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <img
                            src={application.user.avatar || '/placeholder.svg'}
                            alt={application.user.nickname}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-white">{application.user.nickname}</span>
                            {application.motivationText && (
                              <div className="relative group">
                                <MessageSquare className="w-4 h-4 text-blue-400 cursor-help" />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                  {application.motivationText}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">{application.user.points.toLocaleString()} points</div>
                        </div>
                      </div>

                      {permissions.level > 1 && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAcceptApplication(application.id, true, application.user.nickname)}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Accepter</span>
                          </button>
                          <button
                            onClick={() => handleAcceptApplication(application.id, false, application.user.nickname)}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Refuser</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Modale de rejoindre */}
      {isJoinModalOpen && <JoinGuildModal guild={guild} onClose={() => setIsJoinModalOpen(false)} />}
    </motion.main>
  )
}

export default GuildDetailsView
