import 'styles/Guild.scss'

import React from 'react'
import Banner from 'components/Guilds/StationsBanner'
import Guilds from 'components/Guilds/Guilds'
import { Box } from '@mui/material'

const GuildsList = () => {
  return (
    <>
      <Box className="guilds-page">
        <Banner />
        <Guilds />
      </Box>
    </>
  )
}

export default GuildsList
