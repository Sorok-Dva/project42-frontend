import React from 'react'
import { Grid, Box, Button, TextField } from '@mui/material'
import { User } from 'contexts/UserContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faStar,
  faImagePortrait,
  faComment,
  faMale,
  faFemale,
  faMedal,
  faPencil,
  faEnvelope,
  faKey,
} from '@fortawesome/free-solid-svg-icons'

interface ProfileProps {
  user: User;
  openTabSection: (tabName: string) => void
}

const Profile: React.FC<ProfileProps> = ({ user, openTabSection }) => {
  const isPremium = false
  const premiumExpiration = '2021-01-01'
  const sexRectified = true
  const newSexe = 1

  const boutiqueLink = (
    <Box className="bouton-premium">
      <Box>
        <Button variant="contained" href="/boutique">
          Aller à la boutique
        </Button>
      </Box>
    </Box>
  )

  const historiqueLink = (
    <Box className="bouton-premium">
      <Box>
        <Button variant="contained" id="premium-historique">
          Historique des transactions
        </Button>
      </Box>
    </Box>
  )

  return (
    <Box id="gestion-profil" sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* Premium et Achats : full width */}
        <Grid item xs={12}>
          <Box className="box-setting">
            <Box className="box-title">
              <h3>
                <FontAwesomeIcon icon={faStar} /> Premium et Achats
              </h3>
            </Box>
            <Box className="statut-premium" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
              <Box>
                <img src="/assets/images/chatelain.png" alt="Premium" id="premium-img" />
              </Box>
              {isPremium ? (
                <>
                  <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <h2>
                      Tu es <strong>Premium</strong>
                    </h2>
                    {user.premium?.getTime() === 2147483647 ? (
                      <p>à vie !</p>
                    ) : (
                      <p>jusqu’au {premiumExpiration}</p>
                    )}
                  </Box>
                  {boutiqueLink}
                  {historiqueLink}
                </>
              ) : (
                <>
                  <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <h2>
                      Tu n’es <strong>pas Premium</strong>
                    </h2>
                  </Box>
                  {boutiqueLink}
                  <Box sx={{ mt: 1 }}>
                    <Button variant="contained" id="premium-alternatives">
                      Autres alternatives
                    </Button>
                  </Box>
                  {historiqueLink}
                </>
              )}
            </Box>
          </Box>
        </Grid>

        <Grid container item xs={12} spacing={2}>
          <Grid item xs={12} md={6}>
            <Box className="box-setting">
              <Box className="box-title">
                <h3>
                  <FontAwesomeIcon icon={faImagePortrait} /> Avatar
                </h3>
              </Box>
              <Box sx={{ p: 2 }}>
                <p>Personnalise ton avatar en envoyant ton image ici !</p>
                <Button variant="contained" id="updateAvatar">
                  Mettre à jour mon avatar
                </Button>
              </Box>
            </Box>
          </Grid>
          {/* Modifier ma signature */}
          <Grid item xs={12} md={6}>
            <Box className="box-setting">
              <Box className="box-title">
                <h3>
                  <FontAwesomeIcon icon={faComment} /> Modifier ma signature
                </h3>
              </Box>
              <Box sx={{ p: 2 }}>
                <p>Ta signature ne doit pas comporter plus de 120 caractères.</p>
                <TextField
                  id="last_wish"
                  defaultValue={user.signature}
                  multiline
                  maxRows={4}
                  inputProps={{ maxLength: 120 }}
                  fullWidth
                />
                <Box sx={{ mt: 1 }}>
                  <Button variant="contained" id="change-signature">
                    Mettre à jour
                  </Button>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Grid container item xs={12} spacing={2}>
          <Grid item xs={12} md={6}>
            <Box className="box-setting">
              <Box className="box-title">
                <h3>
                  <FontAwesomeIcon icon={faMale} />/<FontAwesomeIcon icon={faFemale} />  Rectifier le genre de mon avatar
                </h3>
              </Box>
              <Box sx={{ p: 2 }}>
                {sexRectified ? (
                  <p>
                    <strong>Tu as déjà rectifié le genre de ton avatar</strong>. Il est impossible de le faire à nouveau.
                  </p>
                ) : (
                  <>
                    <p>
                      ⚠️ <strong>Cette action n'est disponible qu’une seule fois.</strong>
                    </p>
                    <p>Ton avatar est actuellement {user.isMale ? 'un homme' : 'une femme'}.</p>
                    <Button variant="contained" id="change-sexe" data-new-sexe={newSexe}>
                      Rectifier
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Grid>
          {/* Titre & badges préférés */}
          <Grid item xs={12} md={6}>
            <Box className="box-setting">
              <Box className="box-title">
                <h3>
                  <FontAwesomeIcon icon={faMedal} /> Titre & badges préférés
                </h3>
              </Box>
              <Box sx={{ p: 2 }}>
                <p>
                  Personnalise ton titre <i>(visible en partie)</i> et choisis les badges que tu souhaites mettre en avant sur ton profil dans l'onglet "<strong>Badges & Titre</strong>".
                </p>
                <Button variant="contained" onClick={() => openTabSection('tab-badges')}>
                  Accéder à mes badges
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Grid container item xs={12} spacing={2}>
          <Grid item xs={12} md={4}>
            <Box className="box-setting">
              <Box className="box-title">
                <h3>
                  <FontAwesomeIcon icon={faPencil} /> Modifier mon pseudo
                </h3>
              </Box>
              <Box sx={{ p: 2 }}>
                <p>
                  ⚠️ <strong>Vous ne pouvez modifier votre pseudo qu'une fois tous les 6 mois</strong>
                </p>
                <Button variant="contained" onClick={() => openTabSection('tab-1')}>
                  Modifier mon pseudo
                </Button>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box className="box-setting">
              <Box className="box-title">
                <h3>
                  <FontAwesomeIcon icon={faEnvelope} /> Modifier mon adresse e-mail
                </h3>
              </Box>
              <Box sx={{ p: 2 }}>
                <Button variant="contained" onClick={() => openTabSection('tab-2')}>
                  Modifier mon e-mail
                </Button>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box className="box-setting">
              <Box className="box-title">
                <h3>
                  <FontAwesomeIcon icon={faKey} /> Modifier mon mot de passe
                </h3>
              </Box>
              <Box sx={{ p: 2 }}>
                <Button variant="contained" onClick={() => openTabSection('tab-2')}>
                  Modifier mon mot de passe
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Profile
