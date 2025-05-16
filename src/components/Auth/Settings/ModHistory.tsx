'use client'

import type React from 'react'
import { motion } from 'framer-motion'
import { useUser } from 'contexts/UserContext'
import { Shield, AlertTriangle, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface Antecedent {
  id: number
  action: string // "warned", "banned", "warned-blitz", "punished_by_bucher", "banned_vocal"
  reason: string // motifs séparés par des virgules
  detailsForPlayer: string
  idPartie: string
  screen: string
  capitalPerdu: number
  createdAt: Date
}

// Exemple de mapping pour les actions "warned" ou "banned"
const PUNISHMENT_TITLES : { [key : string] : { title : string } } = {
  '1': { title: 'Infraction 1' },
  '2': { title: 'Infraction 2' },
  '3': { title: 'Infraction 3' },
  '4': { title: 'Infraction 4' },
  '5': { title: 'Infraction 5' },
}

const ModHistory : React.FC = () => {
  const { user } = useUser()
  const antecedents : Antecedent[] = [] // Normalement, cela viendrait d'une API
  const [stroke, setStroke] = useState<string>('#3b82f6')

  useEffect(() => {
    if (!user?.behaviorPoints) return

    const points = user.behaviorPoints
    if (points >= 750) setStroke('#30e314')
    else if (points >= 500) setStroke('#e3ce14')
    else if (points >= 250) setStroke('#e35c14')
    else setStroke('#e32214')
  }, [user])
  return (
    <div className="space-y-8">
      {/* Informations sur le comportement */ }
      <motion.div
        className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
        initial={ { opacity: 0, y: 20 } }
        animate={ { opacity: 1, y: 0 } }
        transition={ { duration: 0.5 } }
      >
        <div
          className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-blue-500/30">
          <h3 className="text-xl font-bold flex items-center gap-2 title-anim">
            <Shield className="w-5 h-5"/>
            Points de comportement
          </h3>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <svg className="w-32 h-32" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b"
                  strokeWidth="10"/>
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={ stroke }
                  strokeWidth="10"
                  strokeDasharray="283"
                  strokeDashoffset={ 283 - (283 * (user?.behaviorPoints || 1000)) / 1000 }
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div
                className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-2xl font-bold">{ user?.behaviorPoints || 500 }</span>
              </div>
            </div>
          </div>

          <p className="text-blue-300 mb-4">
            Chaque action contraire aux{ ' ' }
            <a className="text-blue-400 hover:text-blue-300 underline"
              href="/cgu">
              règles du site
            </a>{ ' ' }
            te fera perdre des points. Tu peux écoper d'avertissements, de
            bannissements temporaires voire définitifs
            sans avertissement si nécessaire.
          </p>

          <div
            className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-300">
              Dans tous les cas, un nombre de points à zéro signifie que le
              compte est{ ' ' }
              <strong>définitivement bloqué</strong> (ban définitif).
            </p>
          </div>
        </div>
      </motion.div>

      {/* Antécédents */ }
      <motion.div
        className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
        initial={ { opacity: 0, y: 20 } }
        animate={ { opacity: 1, y: 0 } }
        transition={ { duration: 0.5, delay: 0.1 } }
      >
        <div
          className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-blue-500/30">
          <h3 className="text-xl font-bold flex items-center gap-2 title-anim">
            <AlertTriangle className="w-5 h-5"/>
            Antécédents
          </h3>
        </div>

        <div className="p-6">
          { antecedents.length === 0 ? (
            <motion.div
              className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 text-center"
              initial={ { opacity: 0, scale: 0.95 } }
              animate={ { opacity: 1, scale: 1 } }
              transition={ { duration: 0.5 } }
            >
              <div className="flex justify-center mb-4">
                <div
                  className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-green-400"/>
                </div>
              </div>
              <p className="text-green-300 text-lg">Vous n'avez aucun
                antécédent de modération. Continuez ainsi ! :)</p>
            </motion.div>
          ): (
            <div className="space-y-4">
              { antecedents.map((ant: Antecedent) => {
                let motifLisible = ''
                const motifs = ant.reason.split(',')

                if (ant.action === 'warned' || ant.action === 'banned') {
                  motifLisible = motifs
                    .map((m) => {
                      const code = m.trim()
                      return code === '666' ? 'Autres': PUNISHMENT_TITLES[code]?.title || code
                    })
                    .join(', ')
                } else if (ant.action === 'warned-blitz') {
                  motifLisible = PUNISHMENT_TITLES['51']?.title || ''
                } else if (ant.action === 'punished_by_bucher') {
                  motifLisible = motifs
                    .map((m) => {
                      const code = m.trim()
                      if (code === '1') return 'Langage abusif'
                      if (code === '2') return 'Nuisance'
                      if (code === '3') return 'Abandon'
                      if (code === '4') return 'Anti-jeu'
                      if (code === '5') return 'Dévoilement abusif'
                      if (code === '6') return 'Anti-jeu : Dénonciation de loups'
                      return 'Autre'
                    })
                    .join(', ')
                } else if (ant.action === 'banned_vocal') {
                  motifLisible = 'Interdit de parties vocales'
                }

                return (
                  <motion.div
                    key={ ant.id }
                    className="bg-black/40 backdrop-blur-sm rounded-xl border border-red-500/30 p-4"
                    initial={ { opacity: 0, y: 10 } }
                    animate={ { opacity: 1, y: 0 } }
                    transition={ { duration: 0.3 } }
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-400"/>
                      <h4 className="text-lg font-bold">
                        { motifLisible } – { ant.createdAt.toLocaleString() }
                      </h4>
                    </div>

                    <div
                      className="bg-black/40 rounded-lg p-3 mb-3 text-blue-300">
                      { ant.detailsForPlayer.split('\n').map((line, idx) => (
                        <p key={ idx } className="mb-1">
                          { line }
                        </p>
                      )) }
                    </div>

                    {/* Liens vers les parties */ }
                    { ant.idPartie && ant.idPartie.trim() !== '' && (
                      <div className="mb-3">
                        <p className="text-sm text-blue-400 mb-1">Parties
                          concernées:</p>
                        <div className="flex flex-wrap gap-2">
                          { ant.idPartie
                            .replace(/\s/g, '')
                            .split(',')
                            .map((idPartie, idx) => (
                              <a
                                key={ idx }
                                href={ `/jeu/archives.php?id=${ idPartie }` }
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-900/30 hover:bg-blue-800/40 rounded-md text-sm transition-colors"
                              >
                                Partie #{ idPartie }
                                <ExternalLink className="w-3 h-3"/>
                              </a>
                            )) }
                        </div>
                      </div>
                    ) }

                    {/* Liens vers les captures */ }
                    { ant.screen && ant.screen.trim() !== '' && (
                      <div className="mb-3">
                        <p className="text-sm text-blue-400 mb-1">Captures
                          d'écran:</p>
                        <div className="flex flex-wrap gap-2">
                          { ant.screen
                            .replace(/\s/g, '')
                            .split(',')
                            .map((capture, idx) => (
                              <a
                                key={ idx }
                                href={ capture }
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-900/30 hover:bg-blue-800/40 rounded-md text-sm transition-colors"
                              >
                                Capture #{ idx + 1 }
                                <ExternalLink className="w-3 h-3"/>
                              </a>
                            )) }
                        </div>
                      </div>
                    ) }

                    <div
                      className="text-red-400 font-bold text-right">- { ant.capitalPerdu } points
                      de comportement
                    </div>
                  </motion.div>
                )
              }) }
            </div>
          ) }
        </div>
      </motion.div>
    </div>
  )
}

export default ModHistory

