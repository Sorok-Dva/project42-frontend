import type React from 'react'

interface GameRulesProps {
  gameType: number
}

const GameRules: React.FC<GameRulesProps> = ({ gameType }) => {
  // Définition des règles pour chaque type de partie
  // Définition des règles pour chaque type de partie
  const rules = {
    0: [
      // Normale
      'Il est strictement <strong>interdit d\'insulter</strong> un autre joueur et d\'avoir une attitude malsaine.',
      'Le dévoilement est <strong>interdit</strong> et <strong>sanctionné</strong> systématiquement.',
      'Tous les joueurs <strong>doivent</strong> participer au débat. Il n\'est pas autorisé d\'être <strong>AFK</strong>.',
    ],
    1: [
      // Fun
      'Il est strictement <strong>interdit d\'insulter</strong> un autre joueur et d\'avoir une attitude malsaine. Toute forme d\'<strong>anti-jeu</strong> sera sanctionnée.',
      'Il est fortement encouragé de <strong>ne jamais dévoiler</strong> votre rôle, même si dans l\'espace détente, cette pratique est tolérée. ',
      'Vous acceptez de passer <strong>un bon moment</strong> sans prise de tête.',
      'Vous pouvez jouer de <strong>manière détendue</strong>, l\'objectif est de <strong>s\'amuser</strong>.',
      'Vous pouvez faire des blagues et être créatif dans vos accusations.',
    ],
    2: [
      // Sérieuse
      'Il est strictement <strong>interdit d\'insulter</strong> un autre joueur et d\'avoir une attitude malsaine. Toute forme d\'<strong>anti-jeu</strong> sera sanctionnée.',
      'Le dévoilement est <strong>interdit</strong> et <strong>sanctionné</strong> systématiquement. Il est aussi <strong>interdit</strong> de donner toute forme d\'indice sur son rôle.',
      'Tous les joueurs <strong>doivent</strong> participer au débat. Il n\'est pas autorisé d\'être <strong>AFK</strong>.',
      'Le tireur d\'élite doit obligatoirement tirer.',
      'Jouer en partie sérieuse, c\'est accepter d\'être dans un état d\'esprit qui pourrait s\'apparenter à de la "compétition".'
    ],
    3: [
      // Carnage
      'Il est strictement <strong>interdit d\'insulter</strong> un autre joueur et d\'avoir une attitude malsaine. Toute forme d\'<strong>anti-jeu</strong> sera sanctionnée.',
      'La Bio-Ingénieure <strong>doit utiliser</strong> sa potion de mort la première nuit.',
      'Le tireur d\'élite <strong>doit tirer</strong>.',
      'Les parties sont <strong>très courtes et <strong>intenses</strong>.',
      'Les phases sont <strong>accélérées</strong>, soyez réactifs.',
      'Le dévoilement de votre rôle est autorisé, mais vous êtes <strong>fortement incité</strong> à garder votre carte secrète.'
    ],
    4: [
      // Animation
      'Cette partie est <strong>animée par un membre de l\'équipe</strong>.',
      '<strong>Suivez les instructions</strong> de l\'animateur.',
      'Des règles <strong>spéciales</strong> peuvent être appliquées.',
      'L\'objectif est de créer une expérience <strong>unique</strong> et <strong>divertissante</strong>.',
    ],
    5: [
      // Test
      'Cette partie est <strong>animée</strong> par un <strong>développeur de l\'équipe</strong>.',
      '<strong>Suivez les instructions</strong> du développeur.',
      'Des règles <strong>spéciales</strong> peuvent être appliquées.',
      'Aucun points / badges <strong>ne sont enregistrés</strong>.',
    ],
  }

  // Couleurs des puces pour chaque type de partie
  const bulletColors = {
    0: 'bg-green-500', // Normale
    1: 'bg-blue-500', // Fun
    2: 'bg-red-500', // Sérieuse
    3: 'bg-purple-500', // Carnage
    4: 'bg-yellow-400', // Animation
    5: 'bg-orange-500', // Test
  }

  // Noms des types de partie
  const gameTypeNames = {
    0: 'Normale',
    1: 'Fun',
    2: 'Sérieuse',
    3: 'Carnage',
    4: 'Animation',
    5: 'Test',
  }

  // Vérifier si le type de partie existe
  const validGameType = Object.keys(rules).includes(gameType.toString()) ? gameType : 0
  const currentRules = rules[validGameType as keyof typeof rules]
  const bulletColor = bulletColors[validGameType as keyof typeof bulletColors] || 'bg-green-500'
  const typeName = gameTypeNames[validGameType as keyof typeof gameTypeNames] || 'Normale'

  // Afficher ou non le message de courtoisie
  const showCourtesyMessage = validGameType !== 9

  return (
    <div className="mb-4 p-3 bg-black/40 rounded-lg border border-blue-500/20">
      <p className="text-blue-200 text-sm mb-2">
        <span className="font-bold text-white">Rappel :</span> vous êtes sur une partie{' '}
        <span className={`inline-block w-3 h-3 rounded-full ${bulletColor} align-middle mx-1`}></span>{' '}
        <strong>{typeName}</strong>
      </p>

      <ul className="list-disc list-inside text-xs text-blue-200 space-y-1">
        {currentRules.map((rule, index) => (
          <li key={index}>
            <span className="text-sm" dangerouslySetInnerHTML={{ __html: rule }} />
          </li>
        ))}
      </ul>

      {showCourtesyMessage && <p className="text-xs text-blue-200 mt-2">Soyez courtois et aimable. Bon jeu !</p>}

      {validGameType === 0 && (
        <p className="text-xs text-blue-200 mt-2">
          <strong>Rappel :</strong> ne divulguez <strong>jamais</strong> vos informations privées sur le jeu.
        </p>
      )}
    </div>
  )
}

export default GameRules
