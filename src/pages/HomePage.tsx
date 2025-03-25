import 'styles/Room.scss'

import React from 'react'
import styled from 'styled-components'
import MainBanner from 'components/HomePage/MainBanner'
import RoomList from 'components/Game/Rooms'

const DashboardContainer = styled.div`
  padding: 2rem;
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
        <GridContainer>
          <RoomList />
        </GridContainer>
      </DashboardContainer>
    </>
  )
}

export default HomePage
