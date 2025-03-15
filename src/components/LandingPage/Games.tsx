import bitcoin from 'assets/img/bitcoin.png'
import diamond from 'assets/img/diamond.png'
import gameConsole from 'assets/img/game-console2.png'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Img as Image } from 'react-image'
import { Link } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { RoomData } from 'hooks/useGame'
import axios from 'axios'
import useDropdown from 'hooks/useDropdown'


const Games: React.FC = () => {
  const { toggleOpen } = useDropdown()
  const [topRooms, setTopRooms] = useState<RoomData[]>([])
  const [roomKind, setRoomKind] = useState<'game' | 'archive'>('game')

  useEffect(() => {
    async function retrieveTopRooms () {
      const topRoomResponse = await axios.get('/api/games/rooms/top')
      setTopRooms(Object.values(topRoomResponse.data.rooms))

      if (topRoomResponse.data.rooms.length === 0) {
        const topRoomResponse = await axios.get('/api/games/rooms/archives')
        setTopRooms(Object.values(topRoomResponse.data.rooms))
        setRoomKind('archive')
      }
    }

    retrieveTopRooms ()
  }, [])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    gsap.to('.diamond-area', {
      scrollTrigger: {
        trigger: '#tournament-hero',
        start: 'top 40%',
        end: '+=1000',
        scrub: 1,
      },
      top: '80%',
      opacity: 1,
    })
    gsap.to('.game-console-area', {
      scrollTrigger: {
        trigger: '#tournament-hero',
        start: 'top 50%',
        end: '+=1000',
        scrub: 1,
      },
      top: '80%',
      opacity: 1,
      right: '0%',
      left: 'unset',
    })

    // Clean up on component unmount
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        trigger.kill() // Kill all ScrollTriggers
      })
    }
  }, [])
  return (
    <section className="tournament-section pb-120" id="tournament-hero">
      {/* <!-- Diamond animation --> */}
      <div className="diamond-area">
        <Image className="w-100" src={diamond} alt="diamond" />
      </div>
      {/* <!-- game console animation --> */}
      <div className="game-console-area">
        <Image className="w-100" src={gameConsole} alt="game-console" />
      </div>
      <div className="red-ball top-50"></div>
      <div className="tournament-wrapper">
        <div className="tournament-wrapper-border">
          <div className="container pt-120 pb-120">
            <div className="row justify-content-between align-items-center gy-sm-0 gy-4 mb-15">
              <div className="col-md-6 col-sm-8">
                <h2 className="display-four tcn-1 cursor-scale growUp title-anim">
                  Liste des dernières parties
                </h2>
              </div>
              <div className="col-md-6 col-sm-4 text-sm-end">
                <Link
                  to="#"
                  onClick={toggleOpen}
                  className="btn-half-border position-relative d-inline-block py-2 px-6 bgp-1 rounded-pill"
                >
                  Jouer
                </Link>
              </div>
            </div>
            <div className="row justify-content-between align-items-center g-6">
              {topRooms.map((room) => (
                <div key={room.id} className="col-xl-4 col-md-6">
                  <div className="tournament-card p-xl-4 p-3 bgn-4">
                    <div className="tournament-img mb-8 position-relative">
                      {/*<div className="img-area overflow-hidden">
                        <Image className="w-100" src={img} alt="tournament" />
                      </div>*/}
                      <span className="card-status position-absolute start-0 py-2 px-6 tcn-1 fs-sm">
                        <span className="dot-icon alt-icon ps-3">{ roomKind === 'game' ? 'En cours' : 'Terminée'}</span>
                      </span>
                    </div>
                    <div className="tournament-content px-xl-4 px-sm-2">
                      <div className="tournament-info mb-5">
                        <Link to={`/games/${room.id}`} className="d-block">
                          <h4 className="tournament-title tcn-1 mb-1 cursor-scale growDown">
                            {room.name}
                          </h4>
                        </Link>
                        <span className="tcn-6 fs-sm">Créateur: {room.creator}</span>
                      </div>
                      <div className="hr-line line3"></div>
                      <div className="card-info d-flex align-items-center gap-3 flex-wrap my-5">
                        <div className="price-money bgn-3 d-flex align-items-center gap-3 py-2 px-3 h-100">
                          <div className="d-flex align-items-center gap-2">
                            <Image
                              className="w-100"
                              src={bitcoin}
                              alt="bitcoin"
                            />
                            <span className="tcn-1 fs-sm">75</span>
                          </div>
                        </div>
                        <div className="ticket-fee bgn-3 d-flex align-items-center gap-1 py-2 px-3 h-100">
                          <i className="ti ti-cog fs-base tcp-2"></i>
                          <span className="tcn-1 fs-sm">Options</span>
                        </div>
                        <div className="date-time bgn-3 d-flex align-items-center gap-1 py-2 px-3 h-100">
                          <i className="ti ti-calendar fs-base tcn-1"></i>
                          <span className="tcn-1 fs-sm">Démarrée depuis 6 minutes</span>
                        </div>
                      </div>
                      <div className="hr-line line3"></div>
                      <div className="card-more-info d-between mt-6">
                        <div className="teams-info d-between gap-xl-5 gap-3">
                          <div className="teams d-flex align-items-center gap-1">
                            <i className="ti ti-users fs-base"></i>
                            <span className="tcn-6 fs-sm">{room.maxPlayers} joueurs</span>
                          </div>
                        </div>
                        <Link to={`/games/${room.id}`} className="btn2">
                          <i className="ti ti-eye fs-2xl"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Games
