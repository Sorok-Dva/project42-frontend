import 'styles/Room.scss'

import React from 'react'
import styled from 'styled-components'
import MainBanner from 'components/HomePage/MainBanner'
import CreateGame from 'components/Game/Create'
import RoomList from 'components/Game/Rooms'

const DashboardContainer = styled.div`
  padding: 2rem;
`

const WelcomeMessage = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`

const HomePage = () => {

  return (
    <>
      <MainBanner />
      <DashboardContainer>
        <WelcomeMessage id="dashboard">
          <h2>Trouver une partie.</h2>
        </WelcomeMessage>

        <GridContainer>
          <RoomList />
        </GridContainer>
        <GridContainer>
          <CreateGame />
        </GridContainer>
      </DashboardContainer>
    </>
  )
}

export default HomePage
