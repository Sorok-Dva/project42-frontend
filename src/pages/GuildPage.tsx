import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Container, Spinner } from 'reactstrap'
import PlayerDetails from 'components/Guilds/Details'
import StationBanner from 'components/Guilds/StationBanner'
import { Guild } from 'components/Guilds/Guilds'
import { useParams } from 'react-router-dom'

const GuildDetailsView = () => {
  const { id: tag } = useParams<{ id: string }>()

  const [guild, setGuild] = useState<Guild | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGuild = async () => {
      try {
        const response = await axios.get<Guild>(`/api/guilds/info/${tag}`)
        setGuild(response.data)
      } catch (err: any) {
        console.log('failed to fetch guild data', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGuild()
  }, [])
  return (
    <>
      { loading || !guild ?
        <Container className="loader-container">
          <div className="spinner-wrapper">
            <Spinner animation="border" role="status" className="custom-spinner">
              <span className="sr-only">Chargement des informations de la station...</span>
            </Spinner>
            <div className="loading-text">Chargement des informations de la station...</div>
          </div>
        </Container>
        : (
          <>
            <StationBanner guild={guild} />
            <PlayerDetails guild={guild} />
          </>
        ) }
    </>
  )
}

export default GuildDetailsView
