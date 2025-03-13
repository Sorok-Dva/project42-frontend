import React from 'react'
import { Link } from 'react-router-dom'
const gamingData = [
  {
    id: 1,
    title: 'Industry Best Support',
    desc: 'Get a reply in under 90 seconds from our friendly, in-house staff 24/7.',
    icon: <i className="ti ti-12-hours fs-2xl tcn-1"></i>,
  },
  {
    id: 2,
    title: 'Play To Earn',
    desc: 'Earn our TXT tokens with every bet you make. TXT tokens can be profits.',
    icon: <i className="ti ti-tools fs-2xl tcn-1"></i>,
  },
  {
    id: 3,
    title: 'Instant Payouts',
    desc: 'Withdraw easily with instant payouts on over 99.4% withdrawals.',
    icon: <i className="ti ti-coins fs-2xl tcn-1"></i>,
  },
  {
    id: 4,
    title: 'Free Withdrawals',
    desc: 'Withdraw easily with instant payouts on over 99.4% withdrawals.',
    icon: <i className="ti ti-free-rights fs-2xl tcn-1"></i>,
  },
  {
    id: 5,
    title: 'Prove-able Fairness',
    desc: 'Get a reply in under 90 seconds from our friendly, in-house staff 24/7.',
    icon: <i className="ti ti-scale fs-2xl tcn-1"></i>,
  },
  {
    id: 6,
    title: 'Fully Licensed',
    desc: 'Get a reply in under 90 seconds from our friendly, in-house staff 24/7.',
    icon: <i className="ti ti-license fs-2xl tcn-1"></i>,
  },
]

const NextLevelGaming: React.FC = () => {
  return (
    <section
      className="next-level-gaming-section pt-120 pb-120"
      id="next-level-gaming">
      <div className="red-ball bottom-50"></div>
      <div className="container">
        <div className="row justify-content-between mb-15">
          <div className="col-lg-6 col-sm-10">
            <h2 className="display-four tcn-1 cursor-scale growUp title-anim">
              <span className="d-block">Gaming To</span> The Next Level
            </h2>
          </div>
        </div>
        <div className="row g-6">
          {gamingData.map(({ desc, icon, id, title }) => (
            <div key={id} className="col-lg-4 col-md-6">
              <div className="next-level-game-card d-grid gap-5 py-lg-10 py-sm-6 py-4 px-xl-9 px-sm-5 px-3">
                <div className="card-icon">{icon}</div>
                <h4 className="card-title tcn-1 cursor-scale growDown2 title-anim">
                  {title}
                </h4>
                <p className="card-text tcs-6">{desc}</p>
                <div className="pt-3">
                  <Link
                    to="/game"
                    className="card-link d-inline-flex align-items-center w-auto">
                    Play Now<i className="ti ti-arrow-right"></i>
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

export default NextLevelGaming
