import { useUser } from 'contexts/UserContext'
import React from 'react'

export interface Antecedent {
  id: number;
  action: string; // "warned", "banned", "warned-blitz", "punished_by_bucher", "banned_vocal"
  reason: string; // motifs séparés par des virgules
  detailsForPlayer: string;
  date: number; // timestamp en secondes
  idPartie: string;
  screen: string;
  capitalPerdu: number;
}

// Exemple de mapping pour les actions "warned" ou "banned"
// Vous devez adapter ces valeurs selon vos données réelles
const PUNISHMENT_TITLES: { [key: string]: { title: string } } = {
  '1': { title: 'Infraction 1' },
  '2': { title: 'Infraction 2' },
  '3': { title: 'Infraction 3' },
  '4': { title: 'Infraction 4' },
  '5': { title: 'Infraction 5' },
  // Par exemple, pour warned-blitz on utilisera la clé "51"
  '51': { title: 'Avertissement éclair' },
}

const ModAntecedents: React.FC = () => {
  const { user } = useUser()
  return (
    <div>
      {/* Informations sur le comportement */}
      <p className="antecedents-pc">
        Tu as <strong>{user?.behaviorPoints || 500}</strong> points de comportement.
      </p>
      <p>
        Chaque action contraire aux{' '}
        <a className="lien_simple" href="/cgu">
          règles du site
        </a>{' '}
        te fera perdre des points. Tu peux écoper d'avertissements, de bannissements temporaires voire définitifs sans avertissement si nécessaire.
      </p>
      <p>
        Dans tous les cas, un nombre de points à zéro signifie que le compte est{' '}
        <b>définitivement bloqué</b> (ban définitif).
      </p>
      <br />

      {/* Affichage des antécédents */}
      {[].length === 0 ? (
        <div
          style={{
            margin: '50px auto',
            padding: '15px',
            width: '650px',
            backgroundColor: '#E2F7DA',
            border: '1px solid #C2C2C2',
          }}
        >
          Vous n'avez aucun antécédent de modération. Continuez ainsi ! :)
        </div>
      ) : (
        <>
          <h3>Antécédents</h3>
          {[].map((ant: Antecedent) => {
            let motifLisible = ''
            const motifs = ant.reason.split(',')

            if (ant.action === 'warned' || ant.action === 'banned') {
              // Pour ces actions, on parcourt les motifs et on affiche "Autres" si le code est 666, sinon on utilise le mapping
              motifLisible = motifs
                .map((m) => {
                  const code = m.trim()
                  return code === '666' ? 'Autres' : PUNISHMENT_TITLES[code]?.title || code
                })
                .join(', ')
            } else if (ant.action === 'warned-blitz') {
              motifLisible = PUNISHMENT_TITLES['51']?.title || ''
            } else if (ant.action === 'punished_by_bucher') {
              // Pour cette action, on effectue un mapping manuel
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
              <div key={ant.id} className="antecedent bgbeige rounded shadow">
                <h4>
                  {motifLisible} – {new Date(ant.date * 1000).toLocaleString()}
                </h4>
                <p>
                  {ant.detailsForPlayer.split('\n').map((line, idx) => (
                    <span key={idx}>
                      {line}
                      <br />
                    </span>
                  ))}
                </p>
                {/* Liens vers les parties */}
                {ant.idPartie && ant.idPartie.trim() !== '' && (
                  <div>
                    {ant.idPartie.replace(/\s/g, '').split(',').map((idPartie, idx) => (
                      <React.Fragment key={idx}>
                        <a href={`/jeu/archives.php?id=${idPartie}`} target="_blank" rel="noreferrer">
                          Partie #{idPartie}
                        </a>
                        <br />
                      </React.Fragment>
                    ))}
                  </div>
                )}
                {/* Liens vers les captures */}
                {ant.screen && ant.screen.trim() !== '' && (
                  <div>
                    {ant.screen.replace(/\s/g, '').split(',').map((capture, idx) => (
                      <React.Fragment key={idx}>
                        <a href={capture} target="_blank" rel="noreferrer">
                          Capture
                        </a>
                        <br />
                      </React.Fragment>
                    ))}
                  </div>
                )}
                <p style={{ color: 'darkred' }}>
                  - {ant.capitalPerdu} points de comportement
                </p>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

export default ModAntecedents
