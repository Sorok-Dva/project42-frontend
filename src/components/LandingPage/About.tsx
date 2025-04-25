import React from 'react'
import { Link } from 'react-router-dom'

const aboutData = [
  {
    id: 1,
    title: 'Un revival de Loups-Garous en ligne',
    desc: 'Découvrez une adaptation moderne inspirée du célèbre jeu, avec un univers et un thème repensés pour éviter toute violation de droits.',
    icon: <i className="ti ti-bolt fs-2xl tcn-1"></i>,
  },
  {
    id: 2,
    title: 'Développé de façon indépendante',
    desc: 'Ce projet a été entièrement recodé par une seule personne, utilisant les dernières technologies web pour une expérience fluide.',
    icon: <i className="ti ti-heart fs-2xl tcn-1"></i>,
  },
  {
    id: 3,
    title: '21 cartes disponibles',
    desc: 'Le jeu propose déjà 21 cartes variées, avec de nouvelles mécaniques pour renouveler l’expérience de jeu.',
    icon: <i className="ti ti-cards fs-2xl tcn-1"></i>,
  },
  {
    id: 4,
    title: 'Une communauté grandissante',
    desc: 'Rejoignez une communauté active et conviviale, prête à accueillir de nouveaux joueurs pour des parties endiablées.',
    icon: <i className="ti ti-activity-heartbeat fs-2xl tcn-1"></i>,
  },
  {
    id: 5,
    title: 'Technologies récentes',
    desc: 'Profitez d’un site et d’un jeu optimisés grâce à l’utilisation de frameworks modernes et de bonnes pratiques de développement.',
    icon: <i className="ti ti-brand-polymer fs-2xl tcn-1"></i>,
  },
  {
    id: 6,
    title: 'Des événements réguliers',
    desc: 'Participez à des événements spéciaux et concours organisés fréquemment pour pimenter vos sessions de jeu.',
    icon: <i className="ti ti-medal fs-2xl tcn-1"></i>,
  },
]


const About: React.FC = () => {
  return (
    <section
      className="next-level-gaming-section pt-120 pb-120"
      id="next-level-gaming">
      <div className="red-ball bottom-50"></div>
      <div className="container">
        <div className="row justify-content-between mb-15">
          <div className="col-lg-6 col-sm-10">
            <h2 className="display-four tcn-1 cursor-scale growUp title-anim">
              <span className="d-block">À Propos</span> de Project 42
            </h2>
          </div>
        </div>
        <div className="row g-6">
          {aboutData.map(({ desc, icon, id, title }) => (
            <div key={id} className="col-lg-4 col-md-6">
              <div className="next-level-game-card d-grid gap-5 py-lg-10 py-sm-6 py-4 px-xl-9 px-sm-5 px-3">
                <div className="card-icon">{icon}</div>
                <h4 className="card-title tcn-1 cursor-scale growDown2 title-anim">
                  {title}
                </h4>
                <p className="card-text tcs-6">{desc}</p>
                <div className="pt-3">
                  <Link
                    to="/register"
                    className="card-link d-inline-flex align-items-center w-auto">
                    Rejoindre la station ! <i className="ti ti-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About
