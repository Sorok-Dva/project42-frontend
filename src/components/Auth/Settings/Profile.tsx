import type React from 'react'
import { motion } from 'framer-motion'
import type { User } from 'contexts/UserContext'
import { Star, Image, MessageSquare, Users } from 'lucide-react'
import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { useAuth } from 'contexts/AuthContext'
import { useUser } from 'contexts/UserContext'
import SplitTextAnimations from 'utils/SplitTextAnim'

const Profile : React.FC<{
  user: User
  openTabSection: (tabName : string) => void
}> = ({ user, openTabSection }) => {
  const { token } = useAuth()
  const { setUser } = useUser()
  const [signature, setSignature] = useState<string>(user?.signature ?? '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const premiumDate = user.premium ? new Date(user.premium) : null
  console.log(user, premiumDate ? premiumDate.getTime() : null)

  const isPremium = premiumDate ? new Date().getTime() < premiumDate.getTime() : false
  const premiumExpiration = premiumDate
  const sexRectified = true
  const newSexe = 1

  const handleSaveSignature = async () => {
    try {
      const { data } = await axios.post(
        '/api/users/actions/updateSignature',
        { signature: signature.trim() },
        {
          headers: {
            Authorization: `Bearer ${ token }`,
          },
        },
      )
      if (data.message) {
        if (user) setUser({ ...user, signature: signature.trim() })
        toast.success('Ta signature a été modifiée avec succès.', ToastDefaultOptions)
      } else {
        toast.error(`Ta signature n'a pas pu être modifiée : ${ data.error }.`, ToastDefaultOptions)
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(`Ta signature n'a pas pu être modifié : ${ err.response?.data.error }.`, ToastDefaultOptions)
      } else {
        console.log(err)
      }
    }
  }

  // Gestion du changement de fichier pour l'avatar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Vérifier le type de fichier
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format de fichier non supporté. Seuls PNG, JPG/JPEG et GIF sont autorisés.', ToastDefaultOptions)
      return
    }
    // Vérifier la taille du fichier (10 Mo maximum)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Le fichier dépasse la taille maximale de 10 Mo.', ToastDefaultOptions)
      return
    }
    setAvatarFile(file)
  }

  // Fonction d'upload de l'avatar
  const handleUploadAvatar = async () => {
    if (!avatarFile) {
      toast.error('Aucun fichier sélectionné.', ToastDefaultOptions)
      return
    }
    const formData = new FormData()
    formData.append('avatar', avatarFile)
    try {
      const { data } = await axios.post('/api/users/actions/updateAvatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })
      if (data.avatarUrl) {
        setUser({ ...user, avatar: data.avatarUrl })
        toast.success('Avatar mis à jour avec succès.', ToastDefaultOptions)
      } else {
        toast.error(`Erreur lors de la mise à jour de l'avatar: ${data.error}`, ToastDefaultOptions)
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(`Erreur lors de la mise à jour de l'avatar: ${err.response?.data.error}`, ToastDefaultOptions)
      }
    }
  }


  return (
    <div className="space-y-8">
      <SplitTextAnimations trigger={1} />
      {/* Premium et Achats */ }
      <motion.div
        className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
        initial={ { opacity: 0, y: 20 } }
        animate={ { opacity: 1, y: 0 } }
        transition={ { duration: 0.5 } }
      >
        <div
          className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-blue-500/30">
          <h3 className="text-xl font-bold flex items-center gap-2 title-anim">
            <Star className="w-5 h-5 text-yellow-400"/>
            Premium et Achats
          </h3>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <motion.img
                src="/images/premium2.png"
                alt="Premium"
                className="w-24 h-24 object-contain"
                animate={ {
                  rotate: [0, 5, 0, -5, 0],
                } }
                transition={ {
                  duration: 6,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                } }
              />
              <div
                className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl -z-10"></div>
            </div>

            <div className="text-center md:text-left">
              { isPremium ? (
                <>
                  <h2 className="text-2xl font-bold mb-2">
                    Tu es{ ' ' }
                    <span
                      className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                      Premium
                    </span>
                  </h2>
                  { premiumDate?.getTime() === 2147483647 ? (
                    <p className="text-blue-300">à vie !</p>
                  ) : (
                    <p className="text-blue-300">
                      jusqu'au { premiumDate ? premiumDate.toLocaleDateString('fr-FR') : '---' }
                    </p>
                  )}
                </>
              ): (
                <h2 className="text-2xl font-bold mb-2 title-anim">
                  Tu n'es <span className="text-gray-400">pas Premium</span>
                </h2>
              ) }
            </div>
          </div>

          <div
            className="mt-6 flex flex-wrap gap-4 justify-center md:justify-start">
            <motion.a
              href="/shop"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20"
              whileHover={ { scale: 1.05 } }
              whileTap={ { scale: 0.95 } }
            >
              Aller à la boutique
            </motion.a>

            <motion.button
              className="px-5 py-2.5 bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all"
              whileHover={ { scale: 1.05 } }
              whileTap={ { scale: 0.95 } }
            >
              Historique des transactions
            </motion.button>

            { !isPremium && (
              <motion.button
                className="px-5 py-2.5 bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all"
                whileHover={ { scale: 1.05 } }
                whileTap={ { scale: 0.95 } }
              >
                Autres alternatives
              </motion.button>
            ) }
          </div>
        </div>
      </motion.div>

      <div className="row">
        {/* Section Avatar */}
        <motion.div
          className="col-lg-4 col-12 bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-blue-500/30">
            <h3 className="text-xl font-bold flex items-center gap-2 title-anim">
              <Image className="w-5 h-5" />
              Avatar
            </h3>
          </div>

          <div className="p-6">
            <p className="text-blue-300 mb-6">
              Personnalise ton avatar en sélectionnant ton image (PNG, JPG/JPEG ou GIF, max 10 Mo) !
            </p>
            <input
              type="file"
              accept=".png, .jpg, .jpeg, .gif"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <motion.button
              onClick={handleUploadAvatar}
              className="mt-4 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600
                hover:from-blue-700 hover:to-purple-700 text-white rounded-lg
                transition-all shadow-lg shadow-blue-500/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Mettre à jour mon avatar
            </motion.button>
          </div>
        </motion.div>

        {/* Modifier ma signature */ }
        <motion.div
          className="col-lg-4 col-12 bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.5, delay: 0.2 } }
        >
          <div
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-blue-500/30">
            <h3 className="text-xl font-bold flex items-center gap-2 title-anim">
              <MessageSquare className="w-5 h-5"/>
              Modifier ma signature
            </h3>
          </div>

          <div className="p-6">
            <p className="text-blue-300 mb-4">Ta signature ne doit pas comporter
              plus de 120 caractères.</p>

            <textarea
              maxLength={ 120 }
              id="last_wish"
              defaultValue={ user.signature }
              onChange={ (e) => setSignature(e.target.value) }
              className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-3 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              rows={ 3 }
            />

            <motion.button
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20"
              whileHover={ { scale: 1.05 } }
              whileTap={ { scale: 0.95 } }
              onClick={handleSaveSignature}
            >
              Mettre à jour
            </motion.button>
          </div>
        </motion.div>

        {/* Rectifier le genre de mon avatar */ }
        <motion.div
          className="col-lg-4 col-12 bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.5, delay: 0.3 } }
        >
          <div
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-blue-500/30">
            <h3 className="text-xl font-bold flex items-center gap-2 title-anim">
              <Users className="w-5 h-5"/>
              Rectifier le genre de mon avatar
            </h3>
          </div>

          <div className="p-6">
            { sexRectified ? (
              <p className="text-blue-300">
                <strong>Tu as déjà rectifié le genre de ton avatar</strong>. Il
                est impossible de le faire à nouveau.
              </p>
            ): (
              <>
                <p className="text-yellow-400 mb-2">
                  ⚠️ <strong>Cette action n'est disponible qu'une seule
                  fois.</strong>
                </p>
                <p className="text-blue-300 mb-4">
                  Ton avatar est
                  actuellement { user.isMale ? 'un homme': 'une femme' }.
                </p>

                <motion.button
                  data-new-sexe={ newSexe }
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20"
                  whileHover={ { scale: 1.05 } }
                  whileTap={ { scale: 0.95 } }
                >
                  Rectifier
                </motion.button>
              </>
            ) }
          </div>
        </motion.div>
      </div>

      {/* Titre & badges préférés */ }
      <motion.div
        className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
        initial={ { opacity: 0, y: 20 } }
        animate={ { opacity: 1, y: 0 } }
        transition={ { duration: 0.5, delay: 0.4 } }
      >
        <div
          className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-blue-500/30">
          <h3 className="text-xl font-bold flex items-center gap-2 title-anim">
            <Star className="w-5 h-5"/>
            Titre & badges préférés
          </h3>
        </div>

        <div className="p-6">
          <p className="text-blue-300 mb-4">
            Personnalise ton titre <i>(visible en partie)</i> et choisis les
            badges que tu souhaites mettre en avant sur
            ton profil dans l'onglet "<strong>Badges & Titre</strong>".
          </p>

          <motion.button
            onClick={ () => openTabSection('tab-badges') }
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20"
            whileHover={ { scale: 1.05 } }
            whileTap={ { scale: 0.95 } }
          >
            Accéder à mes badges
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default Profile

