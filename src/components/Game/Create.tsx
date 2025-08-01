import React, { useState } from 'react'
import axios from 'axios'
import { Box, Button, TextField, Checkbox, FormControlLabel, Typography, Paper } from '@mui/material'
import { useUser } from 'contexts/UserContext'
import { useAuth } from 'contexts/AuthContext'

const CreateGame = () => {
  const { token } = useAuth()
  const { user } = useUser()
  const premiumDate = user?.premium ? new Date(user.premium) : null
  const isPremium = premiumDate ? new Date().getTime() < premiumDate.getTime() : false
  const [inGame, setInGame] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.nickname,
    maxPlayers: 6,
    roles: ['voyageur', 'sableur', 'archiviste', 'synchronisateur'],
    anonymousVotes: false,
    privateGame: false,
    discordGame: false,
    password: '',
    timer: 3,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!token) return

    try {
      const response = await axios.post('/api/games/room',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      setInGame(true)
      window.open(`/game/${response.data.game.id}`, '_blank')
    } catch (error: any) {
      if (error.response?.data?.error) {
        alert(error.response.data.error)
      } else {
        alert('Erreur lors de la création de la partie.')
      }
    }
  }

  if (inGame) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Typography variant="h4">Tu es déjà en jeu</Typography>
        <Typography>Tu dois quitter ta partie en cours pour observer ou jouer une autre partie !</Typography>
      </Box>
    )
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
      {!showForm ? (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowForm(true)}
          sx={{ padding: '1rem 2rem', fontSize: '1.2rem' }}
        >
          Créer une partie
        </Button>
      ) : (
        <Paper elevation={3} sx={{ padding: '2rem', width: '400px', textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Créer une partie
          </Typography>
          <form onSubmit={handleSubmit}>
            <Box mb={2}>
              <TextField
                fullWidth
                label="Nom de la partie"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </Box>

            <Box mb={2}>
              <TextField
                fullWidth
                type="number"
                label="Nombre maximum de joueurs"
                name="maxPlayers"
                value={formData.maxPlayers}
                onChange={handleChange}
                inputProps={{ min: 6, max: 50 }}
                required
              />
            </Box>

            <Box mb={2}>
              <TextField
                fullWidth
                type="number"
                label="Durée du débat (en minutes)"
                name="timer"
                value={formData.timer}
                onChange={handleChange}
                inputProps={{ min: 2, max: 5 }}
                required
              />
            </Box>

            <Box mb={2} textAlign="left">
              <Typography variant="subtitle1">Rôles disponibles :</Typography>
              {['voyageur', 'sableur', 'archiviste', 'synchronisateur'].map((role) => (
                <FormControlLabel
                  key={role}
                  control={
                    <Checkbox
                      checked={formData.roles.includes(role)}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setFormData((prev) => ({
                          ...prev,
                          roles: checked
                            ? [...prev.roles, role]
                            : prev.roles.filter((r) => r !== role),
                        }))
                      }}
                    />
                  }
                  label={role}
                />
              ))}
            </Box>

            <Box mb={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="anonymousVotes"
                    checked={formData.anonymousVotes}
                    onChange={handleChange}
                    disabled={!isPremium}
                  />
                }
                label="Votes anonymes"
              />
              {!isPremium && (
                <Typography variant="caption" color="text.secondary">
                  Réservé aux Premium
                </Typography>
              )}
            </Box>

            <Box mb={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="privateGame"
                    checked={formData.privateGame}
                    onChange={handleChange}
                    disabled={!isPremium}
                  />
                }
                label="Partie privée"
              />
              {!isPremium && (
                <Typography variant="caption" color="text.secondary">
                  Réservé aux Premium
                </Typography>
              )}
            </Box>

            <Box mb={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="discordGame"
                    checked={formData.discordGame}
                    onChange={handleChange}
                  />
                }
                label="Partie vocale"
              />
            </Box>

            {isPremium && formData.privateGame && (
              <Box mb={2}>
                <TextField
                  fullWidth
                  type="password"
                  label="Mot de passe"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </Box>
            )}

            <Button type="submit" variant="contained" color="primary" fullWidth>
              Créer la partie
            </Button>
          </form>
        </Paper>
      )}
    </Box>
  )
}

export default CreateGame
