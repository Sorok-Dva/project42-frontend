import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { useAuth } from 'contexts/AuthContext'
import { useUser } from 'contexts/UserContext'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { User, Lock, Mail, Trash } from 'lucide-react'

const calculateDaysUntilNextChange = (lastNicknameChange : Date) => {
  const sixMonthsLater = new Date(lastNicknameChange.getTime())
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6)

  const today = new Date()
  const timeDifference = sixMonthsLater.getTime() - today.getTime()
  const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24))

  return daysDifference > 0 ? daysDifference: 0
}

const hasChangedNicknameWithin7Days = (lastNicknameChange? : Date | string) : boolean => {
  if (!lastNicknameChange) return false
  const changeDate = new Date(lastNicknameChange)
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000
  return Date.now() - changeDate.getTime() <= sevenDaysInMs
}

const Settings : React.FC = () => {
  const { token } = useAuth()
  const { user, setUser } = useUser()
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [canChangeIn, setCanChangeIn] = useState<number | null>(null)
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')

  React.useEffect(() => {
    if (user && user.lastNicknameChange) {
      const daysRemaining = calculateDaysUntilNextChange(new Date(user.lastNicknameChange))
      setCanChangeIn(daysRemaining)
    }
  }, [user])

  const handleNicknameChange = async (e : React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('Utilisateur non trouvé', ToastDefaultOptions)
      return
    }

    try {
      const response = await fetch('/api/users/update-nickname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ token }`,
        },
        body: JSON.stringify({ nickname }),
      })

      if (response.ok) {
        const updatedUser = {
          ...user,
          nickname,
          lastNicknameChange: new Date(),
        }
        setBtnDisabled(true)
        setUser(updatedUser)
        toast.success('Pseudo mis à jour avec succès !', ToastDefaultOptions)
      } else {
        const errorData = await response.json()
        toast.error(`Échec de la mise à jour du pseudo: ${ errorData.error }`, ToastDefaultOptions)
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du pseudo:', error)
      toast.error('Erreur lors de la mise à jour du pseudo', ToastDefaultOptions)
    }
  }

  const handlePasswordReset = async () => {
    if (!user || !user.email) {
      toast.error('L\'utilisateur n\'est pas authentifié ou l\'email est introuvable.')
      return
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      })

      if (response.ok) {
        setBtnDisabled(true)
        toast.success(
          'Un lien de réinitialisation du mot de passe a été envoyé à votre adresse e-mail.',
          ToastDefaultOptions,
        )
      } else {
        const errorData = await response.json()
        toast.error(`Erreur lors de l'envoi de l'e-mail de réinitialisation : ${ errorData.error }`, ToastDefaultOptions)
      }
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation du mot de passe:', error)
      toast.error(
        'Une erreur est survenue lors de la demande de réinitialisation du mot de passe.',
        ToastDefaultOptions,
      )
    }
  }

  const handleEmailChange = async (e : React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/users/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ token }`,
        },
        body: JSON.stringify({ email: user?.email }),
      })

      if (response.ok) {
        setBtnDisabled(true)
        toast.success('Email de validation envoyé, veuillez vérifier votre boîte de réception', ToastDefaultOptions)
      } else {
        const errorData = await response.json()
        toast.error(`Erreur lors de la mise à jour de l'email : ${ errorData.error }`, ToastDefaultOptions)
      }
    } catch (error) {
      toast.error('Erreur lors de la requête', ToastDefaultOptions)
    }
  }

  return (
    <div className="space-y-8">
      <div className="row">
        {/* Modifier mon pseudo */ }
        <motion.div
          className="col-4 bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.5 } }
        >
          <div
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-blue-500/30">
            <h3 className="text-xl font-bold flex items-center gap-2 title-animate">
              <User className="w-5 h-5"/>
              Modifier mon pseudo
            </h3>
          </div>

          <div className="p-6">
            { hasChangedNicknameWithin7Days(user?.lastNicknameChange) && !user?.isAdmin ? (
              <>
                <div
                  className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <p className="text-yellow-300">
                    ⚠️ Tu as changé ton pseudo dans les 7 derniers jours : tu
                    peux récupérer ton ancien pseudo - mais tu ne
                    pourras plus en choisir de nouveau avant 6 mois.
                  </p>
                </div>

                { user?.role !== 'User' && (
                  <p className="text-blue-300 mb-4">
                    Tu es <strong className="text-white">membre de
                    l'équipe</strong>. N'oublie pas de communiquer ton
                    changement de pseudo à tes <strong
                      className="text-white">responsables</strong>.
                  </p>
                ) }

                <motion.button
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20"
                  whileHover={ { scale: 1.05 } }
                  whileTap={ { scale: 0.95 } }
                >
                  Récupérer mon ancien pseudo
                </motion.button>
              </>
            ): canChangeIn && canChangeIn > 0 && !user?.isAdmin ? (
              <div
                className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300">
                  Tu as changé ton pseudo récemment. Tu pourras le changer à
                  nouveau dans{ ' ' }
                  <strong className="text-white">{ canChangeIn } jours</strong>.
                </p>
              </div>
            ): (
              <>
                <div
                  className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <p className="text-yellow-300">
                    ⚠️ <strong>Cette action n'est disponible qu'une fois tous les
                    6 mois</strong>
                  </p>
                </div>

                { user?.role !== 'User' && (
                  <p className="text-blue-300 mb-4">
                    Tu es <strong className="text-white">membre de
                    l'équipe</strong>. N'oublie pas de communiquer ton
                    changement de pseudo à tes <strong
                      className="text-white">responsables</strong>.
                  </p>
                ) }

                <form onSubmit={ handleNicknameChange } className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="nickname"
                      placeholder="Nouveau pseudo"
                      onChange={ (e) => setNickname(e.target.value) }
                      required
                      disabled={ btnDisabled }
                      className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div className="text-center">
                    <motion.button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20 w-full"
                      disabled={ btnDisabled }
                      whileHover={ { scale: 1.02 } }
                      whileTap={ { scale: 0.98 } }
                    >
                      Mettre à jour
                    </motion.button>
                  </div>
                </form>
              </>
            ) }
          </div>
        </motion.div>

        {/* Changer de mot de passe */ }
        <motion.div
          className="col-4 bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.5, delay: 0.1 } }
        >
          <div
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-blue-500/30">
            <h3 className="text-xl font-bold flex items-center gap-2 title-animate">
              <Lock className="w-5 h-5"/>
              Changer de mot de passe
            </h3>
          </div>

          <div className="p-6">
            <p className="text-blue-300 mb-4">Vous pouvez changer votre mot de
              passe à tout moment.</p>
            <p className="text-blue-300 mb-6">
              Il vous suffit de cliquer sur le bouton, et un lien de
              réinitialisation du mot de passe vous sera envoyé par
              e-mail. Suivez les instructions dans l'e-mail pour définir un
              nouveau mot de passe.
            </p>

            <div className="text-center">
              <motion.button
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20 w-full"
                onClick={ handlePasswordReset }
                disabled={ btnDisabled }
                whileHover={ { scale: 1.02 } }
                whileTap={ { scale: 0.98 } }
              >
                Changer mon mot de passe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Modifier mon email */ }
        <motion.div
          className="col-4 bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.5, delay: 0.2 } }
        >
          <div
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-blue-500/30">
            <h3 className="text-xl font-bold flex items-center gap-2 title-animate">
              <Mail className="w-5 h-5"/>
              Modifier mon email
            </h3>
          </div>

          <div className="p-6">
            <p className="text-blue-300 mb-4">
              Une fois la modification effectuée, un e-mail de confirmation vous
              sera envoyé. Veuillez vérifier votre
              boîte de réception et suivre les instructions pour valider votre
              nouvelle adresse e-mail.
            </p>

            { !user?.validated && (
              <div
                className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
                <p className="text-red-300">
                  Veuillez valider votre changement d'email par le biais du lien
                  de confirmation envoyé à votre ancienne
                  adresse e-mail
                </p>
              </div>
            ) }

            { user?.validated && (
              <form onSubmit={ handleEmailChange } className="space-y-4">
                <div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Nouvelle adresse e-mail"
                    onChange={ (e) => setUser({
                      ...user!,
                      email: e.target.value,
                    }) }
                    required
                    disabled={ btnDisabled }
                    className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="text-center">
                  <motion.button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20 w-full"
                    disabled={ btnDisabled }
                    whileHover={ { scale: 1.02 } }
                    whileTap={ { scale: 0.98 } }
                  >
                    Mettre à jour
                  </motion.button>
                </div>
              </form>
            ) }
          </div>
        </motion.div>
      </div>

      {/* Supprimer mon compte */ }
      <motion.div
        className="bg-gradient-to-r from-black/60 to-red-900/20 backdrop-blur-sm rounded-xl border border-red-500/30 overflow-hidden"
        initial={ { opacity: 0, y: 20 } }
        animate={ { opacity: 1, y: 0 } }
        transition={ { duration: 0.5, delay: 0.3 } }
      >
        <div
          className="bg-gradient-to-r from-red-600/20 to-red-900/20 px-6 py-4 border-b border-red-500/30">
          <h3 className="text-xl font-bold flex items-center gap-2 title-animate">
            <Trash className="w-5 h-5"/>
            Supprimer mon compte
          </h3>
        </div>

        <div className="p-6">
          <p className="text-red-300 font-bold mb-2">LA SUPPRESSION EST
            IRRÉMÉDIABLE.</p>
          <p className="text-blue-300 mb-4">Réfléchis-y à deux fois avant de
            supprimer ton compte :)</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-300 mb-1">Mot
                de passe</label>
              <input
                type="password"
                id="deletePassword"
                onChange={ (e) => setPassword(e.target.value) }
                className="w-full bg-black/40 border border-red-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>

            <div className="text-center">
              <motion.button
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all shadow-lg shadow-red-500/20"
                whileHover={ { scale: 1.02 } }
                whileTap={ { scale: 0.98 } }
              >
                Effacer définitivement mon compte
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Settings

