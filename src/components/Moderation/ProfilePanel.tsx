import React from 'react'
import { usePermissions } from 'hooks/usePermissions'

const ProfilePanel: React.FC = () => {
  const { checkPermission } = usePermissions()
  const [actionIsShown, setActionIsShown] = React.useState(false)

  const permissions = {
    warn: checkPermission('site', 'warn'),
    ban: checkPermission('site', 'ban'),
    stalk: checkPermission('site', 'stalk'),
    rename: checkPermission('site', 'rename'),
    addPoints: checkPermission('site', 'addPoints'),
    ip: checkPermission('site', 'ip'),
    antecedents: checkPermission('site', 'antecedents'),
    moderationNotes: checkPermission('site', 'moderationNotes'),
    userRole: checkPermission('site', 'userRole'),
    dcInfos: checkPermission('site', 'userRole'),
    removeSignature: checkPermission('site', 'userRole'),
  }

  return (
    <div className="moderation-panel">
      {!actionIsShown ? (
        <div className="actions">
          { permissions.antecedents && (
            <div className="moderation-buttons buttons">
              <a className="button_secondary bgred" target="#">
                Antécédents
              </a>
            </div>
          )}
          { permissions.moderationNotes && (
            <div className="moderation-buttons buttons">
              <a className="button_secondary bgred" target="#">
                Notes sur le joueur
              </a>
            </div>
          )}
          { permissions.warn && (
            <div className="moderation-buttons buttons">
              <a className="button_secondary bgred" target="#">
                Avertir
              </a>
            </div>
          )}
          { permissions.stalk && (
            <div className="moderation-buttons buttons">
              <a className="button_secondary bgred" target="#">
                Surveiller
              </a>
            </div>
          )}
          { permissions.dcInfos && (
            <div className="moderation-buttons buttons">
              <a className="button_secondary bgred" target="#">
                Doubles-Comptes
              </a>
            </div>
          )}
          { permissions.rename && (
            <div className="moderation-buttons buttons">
              <a className="button_secondary bgred" target="#">
                Renommer
              </a>
            </div>
          )}
          { permissions.removeSignature && (
            <div className="moderation-buttons buttons">
              <a className="button_secondary bgred" target="#">
                Supprimer la signature
              </a>
            </div>
          )}
          { permissions.addPoints && (
            <div className="moderation-buttons buttons">
              <a className="button_secondary bgred" target="#">
                Ajouter des points
              </a>
            </div>
          )}

          { permissions.ip && (
            <div className="moderation-buttons buttons">
              <a className="button_secondary bgred" target="#">
                Voir l'IP
              </a>
            </div>
          )}
          { permissions.ban && (
            <div className="moderation-buttons buttons">
              <a className="button_secondary bgred" target="#">
                Bannir
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="actions">

        </div>
      )}
    </div>
  )
}

export default ProfilePanel
