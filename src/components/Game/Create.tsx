import React, { useState } from 'react'
import axios from 'axios'

const CreateGame = () => {
  const [inGame, setInGame] = useState(false)
  const [gameId, setGameId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    maxPlayers: 6,
    roles: ['voyageur', 'sableur', 'archiviste', 'synchronisateur'],
    anonymousVotes: false,
    privateGame: false,
    password: '',
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

    try {
      const response = await axios.post('/api/games/room',
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
      setGameId(response.data.gameId)
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
      <div>
        <h2>Tu es déjà en jeu</h2>
        <p>Tu dois quitter ta partie en cours pour observer ou jouer une autre partie !</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="create-game-form">
      <div>
        <label>Nom de la partie :</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Nombre maximum de joueurs :</label>
        <input
          type="number"
          name="maxPlayers"
          value={formData.maxPlayers}
          onChange={handleChange}
          min="3"
          max="12"
          required
        />
      </div>

      <div>
        <label>Rôles disponibles :</label>
        {['voyageur', 'sableur', 'archiviste', 'synchronisateur'].map((role) => (
          <div key={role}>
            <input
              type="checkbox"
              name="roles"
              value={role}
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
            <label>{role}</label>
          </div>
        ))}
      </div>

      <div>
        <label>Votes anonymes :</label>
        <input
          type="checkbox"
          name="anonymousVotes"
          checked={formData.anonymousVotes}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Partie privée :</label>
        <input
          type="checkbox"
          name="privateGame"
          checked={formData.privateGame}
          onChange={handleChange}
        />
      </div>

      {formData.privateGame && (
        <div>
          <label>Mot de passe :</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
      )}

      <button type="submit">Créer la partie</button>
    </form>
  )
}

export default CreateGame
