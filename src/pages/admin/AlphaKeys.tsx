import React from 'react'
import { Container } from 'reactstrap'
import PageBanner from 'components/Common/PageBanner'
import AlphaKeys from 'components/Admin/AlphaKeys'

const AlphaKeysPage: React.FC = () => {
  return (
    <>
      <PageBanner
        pageTitle="Clés alpha"
        homePageUrl="/admin"
        homePageText="Admin"
        activePageText="Gestion des clés alpha"
      />
      <section className="section section-shaped section-lg">
        <Container className="pt-lg-7">
          <div className="settings-page">
            <AlphaKeys />
          </div>
        </Container>
      </section>
    </>
  )
}

export default AlphaKeysPage
