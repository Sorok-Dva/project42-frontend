import React from 'react'

interface GameCompositionProps {

}

/**
 * Composition de jeu du salon
 */
const GameComposition: React.FC<GameCompositionProps> = () => {
  return (
    <div id="block_compo" className="block bgturquoise shadow rounded">
      <div className="block_header toggle-compo" data-tooltip="Plier la composition">
        <h3>Composition de jeu</h3>
      </div>
      <div className="block_content">
      </div>
    </div>
  )
}

export default GameComposition
