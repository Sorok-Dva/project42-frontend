import React, { useState, useEffect } from 'react'

interface Data {
  nickname: string;
  canGuildInvite: boolean;
  guild: {
    id: number;
  };
}

interface ActionsProps {
  data: Data;
  relation: 'me' | 'none' | 'waiting' | 'friend' | string;
}

const Actions: React.FC<ActionsProps> = ({ data, relation }) => {
  return (
    <div className="parametres-profil">
      <div className="profile_actions buttons">
        {relation === 'me' ? (
          <a className="button_secondary" href="/compte#profil" target="_blank" rel="noopener noreferrer">
            Modifier le profil
          </a>
        ) : (
          <>
            {relation !== 'me' && (
              <div className="button_secondary new-talk" data-nickname={data.nickname}>
                Envoyer un MP
              </div>
            )}
            {data.canGuildInvite && (
              <div className="button_secondary" data-invite-hamlet={data.guild.id}>
                Inviter dans mon hameau
              </div>
            )}
            {relation === 'none' && (
              <div className="button_secondary" data-friend-add={data.nickname}>
                Ajouter à mes amis
              </div>
            )}
            {relation === 'waiting' && (
              <div className="button_secondary" data-friend-ask-cancel={data.nickname}>
                Annuler la demande
              </div>
            )}
            {relation === 'friend' && (
              <div className="button_secondary retirer-ami" data-friend-remove={data.nickname}>
                Retirer de mes amis
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Actions
