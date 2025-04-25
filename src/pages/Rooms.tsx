import React, { useState, useEffect } from 'react'
import { Button } from '@mui/material'
import { RoomCard, RoomData } from 'hooks/useGame'
import { Spinner } from 'reactstrap'
import { Tooltip } from 'react-tooltip'

interface RoomsData {
  code: number;
  game?: RoomData;
  partieBlitz?: RoomData[];
  featured?: RoomData[];
  waiting?: RoomData[];
  current?: RoomData[];
}

interface RoomPageProps {
  isPremium: boolean;
  addPremium?: string;
  isInGame: boolean;
  addInGame?: string;
  canC: boolean;
  canV: string;
  hasPremium: boolean;
  roomsData?: RoomsData;
  canCreateGame: boolean;
}

const GenerateBloc: React.FC<{ className: string; title: string }> = ({ className, title }) => {
  return (
    <aside className={className}>
      <header>{title}</header>
      <article className="waiting-game title">
        <div></div>
        <aside>Nom</aside>
        <aside>Créateur</aside>
        <aside>Places</aside>
        <aside>Options</aside>
      </article>
      <main>
        <article className="empty">
          <div className="spinner-wrapper">
            <Spinner animation="border" role="status" className="custom-spinner">
              <span className="sr-only">Chargement en cours</span>
            </Spinner>
            <div className="loading-text">Chargement en cours</div>
          </div>
        </article>
      </main>
    </aside>
  )
}

const generateCards = (cards: RoomCard[]) => {
  return cards.map((c) => {
    const amount = c.quantity > 1 ? (
      <div className="amount">
        <span>{c.quantity}</span>
      </div>
    ) : null
    return (
      <div key={c.id} style={{ display: 'inline-block', position: 'relative' }}>
        <img src={`/assets/images/miniatures/carte${c.id}_90_90.png`} alt={`Carte ${c.id}`} />
        {amount}
      </div>
    )
  })
}

const generateRoomHtml = (game: RoomData, featuring: boolean = true): JSX.Element => {
  const options = []
  const cards = generateCards(game.cards)
  const headerContent = featuring ? (
    <header>
      Plus que ... place{/*{... > 1 ? 's' : ''}*/} sur {game.maxPlayers} !
    </header>
  ) : null
  const footerContent = featuring ? (
    <footer>
      <a className="viewer" target="_blank" rel="noreferrer" href={`/game/${game.id}`}>
        <img src="/assets/img/voyante_o.png" alt="Observer" style={{ height: 40, verticalAlign: 'middle' }} />
      </a>
    </footer>
  ) : null

  const premiumIcon = null
  const gmIcon = null

  return (
    <aside className={`featured-game type-${game.type} phase-${game.phase}`}>
      <header className={`type-${game.type}`}>
        {premiumIcon} {game.name} {gmIcon}
      </header>
      <main>
        {headerContent}
        <article>
          <aside className="room-compo">Composition <br />{cards}</aside>
          <aside>Options <br />{/*{options}*/}</aside>
        </article>
        <footer>par {game.creator}</footer>
        {footerContent}
      </main>
    </aside>
  )
}

//
// Composant principal RoomPage
//
const RoomPage: React.FC<RoomPageProps> = ({
  isPremium,
  addPremium = '',
  isInGame,
  addInGame = '',
  canC,
  canV,
  hasPremium,
  roomsData,
  canCreateGame,
}) => {
  const [ingameVisible, setIngameVisible] = useState(isInGame)

  // On simule un rafraîchissement des rooms toutes les 15 secondes (à remplacer par useEffect avec API)
  useEffect(() => {
    // Exemple : fetchRooms(); setInterval(fetchRooms, 15000);
  }, [])

  return (
    <section className={`room-page list-room ${addInGame}`}>
      {/* Section Ingame */}
      {ingameVisible && (
        <section className="ingame-page">
          <h1 className="with-borders">
            <div></div>
            <span>Tu es déjà en jeu</span>
            <div></div>
          </h1>
          <article>
            {/* Contenu de la partie en cours */}
          </article>
          <div>
            <i className="mdi mdi-information-outline"></i>
            <span>
              Tu dois quitter ta partie en cours pour <b>observer</b> ou <b>jouer</b> une autre partie !
            </span>
          </div>
        </section>
      )}

      {/* Contenu de la Room Page */}
      {/* Bannières éventuelles */}
      {/* <RoomBanners /> */}
      <div className="gametypes-modal-content">
        <article className="labels">
          <aside>
            <header>
              <div style={{ backgroundColor: '#4a86e8' }}></div>
              <strong style={{ verticalAlign: 'middle' }}>
                Partie <span style={{ color: '#4a86e8' }}>FUN</span> <em>(bandeau Bleu)</em>
              </strong>
            </header>
            <div>Des parties rapides, ambiance détente, peu de prise de tête.</div>
          </aside>
          <aside>
            <header>
              <div style={{ backgroundColor: '#38761d' }}></div>
              <strong style={{ verticalAlign: 'middle' }}>
                Partie <span style={{ color: '#38761d' }}>NORMALE</span> <em>(bandeau Vert)</em>
              </strong>
            </header>
            <div>Des parties comme dans la vraie vie, réflexion et bluff sont de rigueur.</div>
          </aside>
          <aside>
            <header>
              <div style={{ backgroundColor: '#a08aa6' }}></div>
              <strong style={{ verticalAlign: 'middle' }}>
                Partie <span style={{ color: '#a08aa6' }}>CARNAGE</span> <em>(bandeau Violet)</em>
              </strong>
            </header>
            <div>Très rapide, 6 rôles, peu voire aucune stratégie, beaucoup d'éliminations à chaque tour.</div>
          </aside>
          <aside>
            <header>
              <div style={{ backgroundColor: '#ef3a3a' }}></div>
              <strong style={{ verticalAlign: 'middle' }}>
                Partie <span style={{ color: '#ef3a3a' }}>SÉRIEUSE</span> <em>(bandeau Rouge)</em>
              </strong>
            </header>
            <div>Demande beaucoup de concentration et de persuasion. Règles strictes favorisant le débat.</div>
          </aside>
          <aside>
            <header>
              <img
                src="/assets/img/chatelain.png"
                style={{ width: 30, height: 30, verticalAlign: 'middle' }}
                alt="Partie Premium"
              />
              <strong style={{ verticalAlign: 'middle' }}>Partie Premium</strong>
            </header>
            <div>Plus de rôles, plus d'options, plus de tout !</div>
          </aside>
        </article>
      </div>

      <h1 className="with-borders">
        <div></div>
        <span>
          Lancement rapide{' '}
          <img
            className="infotop"
            data-tooltip-id="infotop"
            data-tooltip-content="Clique ici pour en savoir plus sur les différents types de partie"
            src="/static/img/information.png"
            alt="Information"
          />
          <Tooltip id="infotop" />
        </span>
        <div></div>
      </h1>
      <article className="featured-games">
        {/* Ici vous afficherez vos parties en vedette via generateRoomHtml */}
      </article>

      <h1 className="with-borders header-levels">
        <div></div>
        <span>Quêtes & Niveaux</span>
        <div></div>
      </h1>
      {/* Composant ou contenu des quêtes */}

      <h1 className="with-borders header-waiting">
        <div></div>
        <span>Liste des parties en attente</span>
        <div></div>
      </h1>
      <article className="games-list games-waiting">
        <GenerateBloc className="d-games" title="Espace détente" />
        <GenerateBloc className="r-games" title="Espace réflexion" />
      </article>

      <h1 className="with-borders header-launched">
        <div></div>
        <span>Liste des parties en cours</span>
        <div></div>
      </h1>
      <article className="games-list games-launched">

        <GenerateBloc className="d-games" title="Espace détente" />
        <GenerateBloc className="r-games" title="Espace réflexion" />
      </article>

      <h1>Vous n'avez pas trouvé votre bonheur ?</h1>
      <article>
        <Button
          data-type="1"
          className={canCreateGame ? 'creer-partie' : 'creer-partie disabled'}
        >
          <img src="/assets/images/hr_v1.png" alt="Icon" /> CRÉER UNE PARTIE
        </Button>
      </article>

      {canCreateGame && (
        <section className="creer-page hidden">
          <article>
            <Button className="retour-room" onClick={() => { /* Retour aux salons */ }}>
              &lt; Revenir <br />aux salons
            </Button>
            <aside className="header-bloc">Créer une partie</aside>
            <aside className="header-advice">
              Assurez-vous qu’aucune partie similaire à celle que vous souhaitez créer n'existe. Les doublons rendent les temps pour lancer une partie plus longs.
            </aside>
            <aside className="type-partie">
              <header>1 - Choisis le type de partie</header>
              <main>
                <Button value="3" disabled={true}>CARNAGE</Button>
                <Button value="1" disabled={true}>FUN</Button>
                <Button className="active" value="0">NORMALE</Button>
                <Button value="2" disabled={true}>SÉRIEUSE</Button>
                {/* Afficher Animation si applicable */}
              </main>
              <footer>
                <div className="infos-type" data-type="3">
                  Viens t'amuser avant tout, partie rapide et composition définie.
                </div>
                <div className="infos-type active" data-type="1">
                  Parties idéales pour discuter avec ses amis et jouer dans une ambiance détendue.
                </div>
                <div className="infos-type" data-type="0">
                  Tu y trouveras de la réflexion et une bonne ambiance. La participation au débat et l'argumentation sont requises.
                </div>
                <div className="infos-type" data-type="2">
                  Règles strictes pour joueurs aimant le challenge. Concentration et participation active. Accroche-toi !
                </div>
              </footer>
            </aside>
            <aside className="nom-partie">
              <header>2 - Donne un nom à ta partie</header>
              <main>
                <input id="game-name" maxLength={15} type="text" placeholder="Nom de partie" />
              </main>
            </aside>
            <aside className="not-box">
              <aside></aside>
              <aside>
                <img src="/assets/images/carte1.png" alt="Carte 1" />
                <span>Paramétrage de la Partie</span>
              </aside>
              <aside></aside>
            </aside>
            <aside className="debat-partie">
              <aside>3 - Choisis le temps de débat</aside>
              <aside>
                <Button className="grey" value="2">
                  2 min
                </Button>
                <Button className="grey active" value="3">
                  3 min
                </Button>
                <Button className="grey" value="4">
                  4 min
                </Button>
                <Button className="grey" value="5">
                  5 min
                </Button>
              </aside>
              <aside></aside>
            </aside>
            <aside className="options-partie">
              <aside>4 - Options supplémentaires</aside>
              <aside>
                <Button className="grey" value="whiteFlag">
                  Sans points
                </Button>
                {/*<Button className="event-option" value="st-patrick">
                  St-Patrick
                </Button>
                <Button className="event-option" value="halloween">
                  Halloween
                </Button>
                <Button className="event-option" value="summer">
                  <img src="/stuff/salle_de_jeu/partie_ete.png" alt="Ete" /> Été
                </Button>
                <Button className="event-option" value="cadeau">
                  Cadeau explosif
                </Button>
                <Button className="event-option" value="stValentin">
                  Couple Maudit
                </Button>
                <Button className="event-option" value="easter">
                  Pâques
                </Button>
                <Button className="event-option" value="ultrafast">
                  Ultra-rapide
                </Button>
                <Button className="event-option" value="hiddenDeadsRoles">
                  Rôles des morts cachés
                </Button>
                <Button id="gm_mode" className="grey" value="reel">
                  Meneur réel
                </Button>*/}
                <Button className="grey" value="anonyme" disabled={true}>
                  Anonyme
                </Button>
                <Button className="grey" value="selective" disabled={true}>
                  Sélective
                </Button>
                <Button className="grey" value="privee">
                  Privée
                </Button>
              </aside>
              <aside></aside>
            </aside>
            <aside className="password-partie hidden">
              <header>4b - Donne un mot de passe à ta partie</header>
              <main>
                <input id="game-password" maxLength={15} type="text" placeholder="Mot de passe" />
              </main>
            </aside>
            <aside className="rules-partie hidden">
              <header>
                4c - Rajoute des règles à ta partie (laisse vide un champ pour ne pas préciser de règle supplémentaire)
              </header>
              <main>
                <aside>
                  <input className="option-rule" maxLength={300} type="text" placeholder="Règle 1" />
                  <span className="count-char">000/300</span>
                </aside>
                <aside>
                  <input className="option-rule" maxLength={300} type="text" placeholder="Règle 2" />
                  <span className="count-char">000/300</span>
                </aside>
                <aside>
                  <input className="option-rule" maxLength={300} type="text" placeholder="Règle 3" />
                  <span className="count-char">000/300</span>
                </aside>
              </main>
            </aside>
            <aside className="nbj-partie">
              <aside>5 - Nombre de joueurs</aside>
              <aside>
                <Button className="grey active" value="8">
                  de 6 j à 24 j
                </Button>
              </aside>
              <aside></aside>
            </aside>
            <aside>
              <Button className="creer-partie">CRÉER</Button>
            </aside>
          </article>
        </section>
      )}
    </section>
  )
}

export default RoomPage
