import React from 'react'
import { User } from 'contexts/UserContext'
import { Box } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImagePortrait, faStar } from '@fortawesome/free-solid-svg-icons'

const Profile: React.FC<{
  user: User,
  openTabSection: (tabName: string) => void
}> = ({ user, openTabSection }) => {
  const isPremium = false
  const premiumExpiration = '2021-01-01'

  const sexRectified = true

  const boutiqueLink = (
    <div className="bouton-premium">
      <div>
        <a href="/boutique" className="button_secondary">Aller à la boutique</a>
      </div>
    </div>
  )

  const historiqueLink = (
    <div className="bouton-premium">
      <div>
        <button id="premium-historique" className="button_secondary">Historique des transactions</button>
      </div>
    </div>
  )

  const newSexe = 1

  return (
    <div id="gestion-profil">
      {/* Premium et Achats */}
      <div className="box-setting">
        <Box className="box-title">
          <h3>
            <FontAwesomeIcon icon={faStar} /> Premium et Achats
          </h3>
        </Box>
        <div className="statut-premium">
          <div>
            <img src="/assets/images/chatelain.png" alt="Premium" id="premium-img" />
          </div>
          {isPremium ? (
            <>
              <div>
                <h2>Tu es <strong>Premium</strong></h2>
                {user.premium?.getTime() === 2147483647 ? (
                  <p>à vie !</p>
                ) : (
                  <p>jusqu’au {premiumExpiration}</p>
                )}
              </div>
              {boutiqueLink}
              {historiqueLink}
            </>
          ) : (
            <>
              <div>
                <h2>Tu n’es <strong>pas Premium</strong></h2>
              </div>
              {boutiqueLink}
              <div>
                <button id="premium-alternatives" className="button_secondary">Autres alternatives</button>
              </div>
              {historiqueLink}
            </>
          )}
        </div>
      </div>

      {/* Avatar */}
      <div className="box-setting">
        <Box className="box-title">
          <h3>
            <FontAwesomeIcon icon={faImagePortrait} /> Avatar
          </h3>
        </Box>
        <p>Personnalise ton avatar en envoyant ton image ici !</p>
        <br />
        <button id="updateAvatar" className="button_secondary">Mettre à jour mon avatar</button>
      </div>

      {/* Modifier ma signature */}
      <div className="box-setting">
        <h3><i className="mdi mdi-comment"></i> Modifier ma signature</h3>
        <p>Ta signature ne doit pas comporter plus de 120 caractères.</p>
        <textarea maxLength={120} id="last_wish" defaultValue={user.signature} />
        <button id="change-signature" className="button_secondary">Mettre à jour</button>
      </div>

      {/* Rectifier le genre de mon avatar */}
      <div className="box-setting">
        <h3><i className="mdi mdi-gender-male-female"></i> Rectifier le genre<br/> de mon avatar</h3>
        {sexRectified ? (
          <p><strong>Tu as déjà rectifié le genre de ton avatar</strong>. Il est impossible de le faire à nouveau.</p>
        ) : (
          <>
            <p>⚠️ <strong>Cette action n'est disponible qu’une seule fois.</strong></p>
            <p>Ton avatar est actuellement {user.isMale ? 'un homme' : 'une femme'}.</p>
            <button id="change-sexe" data-new-sexe={newSexe} className="button_secondary">Rectifier</button>
          </>
        )}
      </div>

      {/* Titre & badges préférés */}
      <div className="box-setting">
        <h3><i className="mdi mdi-pencil"></i> Titre & badges préférés</h3>
        <p>Personnalise ton titre <i>(visible en partie)</i> et choisis les badges que tu souhaites mettre en avant sur ton profil dans l'onglet "<strong>Badges & Titre</strong>".</p>
        <a data-tab-link="default" className="button_secondary"
          onClick={() => openTabSection('tab-badges')}>
          Accéder à mes badges
        </a>
      </div>
    </div>
  )
}

export default Profile
