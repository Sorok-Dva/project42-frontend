'use client'

import React, { useState } from 'react'
import { Button } from 'components/UI/Button'
import { useUser } from 'contexts/UserContext'
import WarnModal from './WarnModal'
import BanModal from './BanModal'
import HistoryModal from './HistoryModal'
import NoteModal from './NoteModal'
import DoublesModal from './DoublesModal'
import RenameModal from './RenameModal'
import RemoveSignatureModal from './RemoveSignatureModal'
import RemoveAvatarModal from './RemoveAvatarModal'
import IpModal from './IpModal'
import { usePermissions } from 'hooks/usePermissions'
import AddToStalkListModal from 'components/Moderation/AddToStalkListModal'

interface ModerationActionsProps {
  targetUser: {
    id: number
    nickname: string
    avatar?: string
    sanctionHistory?: {
      type: string
      count: number
    }[]
  }
  compact?: boolean
}

const ModerationActions: React.FC<ModerationActionsProps> = ({ targetUser, compact = false }) => {
  const { user } = useUser()
  const { checkPermission } = usePermissions()
  const [isWarnModalOpen, setIsWarnModalOpen] = useState(false)
  const [isBanModalOpen, setIsBanModalOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isNoteOpen, setIsNoteOpen] = useState(false)
  const [isDoublesOpen, setIsDoublesOpen] = useState(false)
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [isRemoveSignatureOpen, setIsRemoveSignatureOpen] = useState(false)
  const [isRemoveAvatarOpen, setIsRemoveAvatarOpen] = useState(false)
  const [isAddToStalkListOpen, setIsAddToStalkListOpen] = useState(false)
  const [isIpOpen, setIsIpOpen] = useState(false)
  const [actionIsShown, setActionIsShown] = useState(false)

  const permissions = {
    antecedents: checkPermission('site', 'antecedents'),
    moderationNotes: checkPermission('site', 'moderationNotes'),
    warn: checkPermission('site', 'warn'),
    stalk: checkPermission('site', 'stalk'),
    dcInfos: checkPermission('site', 'addPoints'),
    rename: checkPermission('site', 'rename'),
    removeSignature: checkPermission('site', 'removeSignature'),
    addPoints: checkPermission('site', 'addPoints'),
    ip: checkPermission('site', 'ip'),
    ban: checkPermission('site', 'ban'),
  }

  const isModerator = user?.roleId && [1, 2, 4, 5].includes(user.roleId)
  if (!isModerator) return null

  // Le container principal : un seul flex pour TOUTES les actions
  return (
    <>
      {!actionIsShown && (
        <div className={`actions flex flex-wrap items-center ${compact ? 'gap-1' : 'gap-2'}`}>
          {permissions.antecedents && (
            <Button
              onClick={() => setIsHistoryOpen(true)}
              className={`${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2'}
                bg-gradient-to-r from-yellow-600 to-amber-600
                hover:from-yellow-700 hover:to-amber-700
                text-white rounded-lg transition-all`}
            >
              Antécédents
            </Button>
          )}
          {permissions.moderationNotes && (
            <Button
              onClick={() => setIsNoteOpen(true)}
              className={`${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2'}
                bg-gradient-to-r from-purple-600 to-purple-900
                hover:from-purple-700 hover:to-purple-700
                text-white rounded-lg transition-all`}
            >
              Notes sur le joueur
            </Button>
          )}
          {permissions.warn && (
            <Button
              onClick={() => setIsWarnModalOpen(true)}
              className={`${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2'}
                bg-gradient-to-r from-yellow-600 to-amber-600
                hover:from-yellow-700 hover:to-amber-700
                text-white rounded-lg transition-all`}
            >
              {compact ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                'Avertir'
              )}
            </Button>
          )}
          {permissions.stalk && (
            <Button
              onClick={() => setIsAddToStalkListOpen(true)}
              className={`${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2'}
                bg-gradient-to-r from-yellow-600 to-amber-600
                hover:from-yellow-700 hover:to-amber-700
                text-white rounded-lg transition-all`}
            >
              Surveiller
            </Button>
          )}
          {permissions.dcInfos && (
            <Button
              onClick={() => setIsDoublesOpen(true)}
              className={`${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2'}
                bg-gradient-to-r from-yellow-600 to-amber-600
                hover:from-yellow-700 hover:to-amber-700
                text-white rounded-lg transition-all`}
            >
              Doubles-Comptes
            </Button>
          )}
          {permissions.rename && (
            <Button
              onClick={() => setIsRenameOpen(true)}
              className={`${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2'}
                bg-gradient-to-r from-yellow-600 to-amber-600
                hover:from-yellow-700 hover:to-amber-700
                text-white rounded-lg transition-all`}
            >
              Renommer
            </Button>
          )}
          {permissions.removeSignature && (
            <Button
              onClick={() => setIsRemoveSignatureOpen(true)}
              className={`${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2'}
                bg-gradient-to-r from-red-600 to-red-800
                hover:from-red-700 hover:to-red-900
                text-white rounded-lg transition-all`}
            >
              Supprimer la signature
            </Button>
          )}
          {permissions.addPoints && (
            <a role="button" className={`${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2'} button_secondary bgred`}>
              Ajouter des points
            </a>
          )}
          {permissions.ip && (
            <Button
              onClick={() => setIsIpOpen(true)}
              className={`${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2'}
                bg-gradient-to-r from-green-600 to-green-800
                hover:from-green-700 hover:to-green-900
                text-white rounded-lg transition-all`}
            >
              Voir l’IP
            </Button>
          )}
          {permissions.ban && (
            <Button
              onClick={() => setIsBanModalOpen(true)}
              className={`${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2'}
                bg-gradient-to-r from-red-600 to-red-800
                hover:from-red-700 hover:to-red-900
                text-white rounded-lg transition-all`}
            >
              {compact ? (
                /* icône */
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5.5 4.21 4.21 5.5 8.72 10H6v2h6V6h-2v2.72L5.5 4.21zM18 18H6v-5h-.81l2 2H8v2h8v-1.19l2 2V18z"/></svg>
              ) : (
                'Bannir'
              )}
            </Button>
          )}
        </div>
      )}

      <WarnModal isOpen={isWarnModalOpen} onClose={() => setIsWarnModalOpen(false)} targetUser={targetUser} />
      <BanModal isOpen={isBanModalOpen} onClose={() => setIsBanModalOpen(false)} targetUser={targetUser} />
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} targetUser={targetUser} />
      <NoteModal isOpen={isNoteOpen} onClose={() => setIsNoteOpen(false)} targetUser={targetUser} />
      <DoublesModal isOpen={isDoublesOpen} onClose={() => setIsDoublesOpen(false)} targetUser={targetUser} />
      <RenameModal isOpen={isRenameOpen} onClose={() => setIsRenameOpen(false)} targetUser={targetUser} />
      <RemoveSignatureModal isOpen={isRemoveSignatureOpen} onClose={() => setIsRemoveSignatureOpen(false)} targetUser={targetUser} />
      <RemoveAvatarModal isOpen={isRemoveAvatarOpen} onClose={() => setIsRemoveAvatarOpen(false)} targetUser={targetUser} />
      <IpModal isOpen={isIpOpen} onClose={() => setIsIpOpen(false)} targetUser={targetUser} />
      <AddToStalkListModal isOpen={isAddToStalkListOpen} onClose={() => setIsAddToStalkListOpen(false)} targetUser={targetUser} />
    </>
  )
}


export default ModerationActions
