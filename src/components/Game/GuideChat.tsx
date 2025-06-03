import React, { useState, useEffect, useRef } from 'react'
import type { Socket } from 'socket.io-client'
import { useSocket } from 'contexts/SocketContext' // Assuming this is the correct path
import { useUser } from 'contexts/UserContext' // To get current user's nickname

interface GuideChatProps {
  guideRoomName: string;
  partnerNickname: string; // Pseudonyme de l'autre personne dans le chat (guide ou guidé)
  amIGuide: boolean; // Pour identifier qui est qui
  onSessionTerminated: () => void; // Rappel lorsque la session est terminée
}

interface Message {
  // Le backend envoie senderId, senderNickname, message, timestamp.
  // Nous utiliserons principalement senderNickname sur le client pour l'affichage.
  senderId?: number; // Optional on client if not directly used for display logic beyond differentiation
  senderNickname: string;
  message: string;
  timestamp: string;
}

const GuideChat: React.FC<GuideChatProps> = ({
  guideRoomName,
  partnerNickname,
  amIGuide,
  onSessionTerminated,
}) => {
  const { socket } = useSocket()
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTerminated, setIsTerminated] = useState(false)
  const messagesEndRef = useRef<null | HTMLDivElement>(null)

  const currentUserNickname = user?.nickname || 'Vous'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (message: Message) => {
      // S'assurer que le message est pour la salle de guide actuellement active
      // Cette vérification pourrait être redondante si le composant n'est monté que lorsqu'une salle spécifique est active
      // mais c'est une bonne pratique de sécurité si les événements socket sont gérés plus globalement avant d'atteindre ce composant.
      // Pour l'instant, nous supposons que le composant parent s'assure que ce composant n'est actif que pour son guideRoomName.
      setMessages((prevMessages) => [...prevMessages, message])
    }

    const handleSessionTerminated = (data: { guideRoomName: string; reason: string; roomId: number }) => {
      if (data.guideRoomName === guideRoomName) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            senderNickname: 'System',
            message: `Session terminée : ${data.reason}`,
            timestamp: new Date().toISOString(),
          },
        ])
        setIsTerminated(true)
        if (onSessionTerminated) {
          onSessionTerminated()
        }
      }
    }

    // Écouter les messages spécifiquement pour ce canal de guide
    // Le backend émet vers une salle, donc le client a juste besoin d'écouter l'événement.
    socket.on('new_guide_message', handleNewMessage)
    socket.on('guide_session_terminated', handleSessionTerminated)

    return () => {
      socket.off('new_guide_message', handleNewMessage)
      socket.off('guide_session_terminated', handleSessionTerminated)
    }
  }, [socket, guideRoomName, onSessionTerminated])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!socket || !newMessage.trim() || isTerminated) return

    socket.emit('send_guide_message', {
      guideRoomName,
      message: newMessage.trim(),
    })
    setNewMessage('')
  }
  // Stylisé avec Tailwind CSS comme référence pour les couleurs et les ombres
  return (
    <div style={{
      border: '1px solid #4A5568', // Updated border color (Tailwind gray-700)
      borderRadius: '8px',
      padding: '16px', // Increased padding
      width: '350px', // Adjusted width
      backgroundColor: '#1A202C', // Updated background color (Tailwind gray-900)
      color: '#E2E8F0', // Updated text color (Tailwind gray-300)
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // Tailwind shadow-lg
      display: 'flex',
      flexDirection: 'column',
      height: '450px', // Adjusted height
    }}>
      <h4 style={{
        marginTop: 0,
        marginBottom: '12px',
        paddingBottom: '12px',
        borderBottom: '1px solid #2D3748', // Tailwind gray-700
        fontSize: '1.125rem', // Tailwind text-lg
        fontWeight: '600', // Tailwind font-semibold
        color: '#A0AEC0' // Tailwind gray-400
      }}>
        Chat : {partnerNickname} <span style={{fontSize: '0.8rem', color: '#718096'}}>({amIGuide ? 'Guidant' : 'Guidé'})</span>
      </h4>
      {isTerminated && (
        <p style={{ color: '#F56565', textAlign: 'center', fontWeight: 'bold', padding: '10px 0' }}>
          This guide session has been terminated.
        </p>
      )}
      <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '12px', paddingRight: '8px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{
            marginBottom: '10px',
            display: 'flex',
            justifyContent: msg.senderNickname === currentUserNickname ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              padding: '10px 15px',
              borderRadius: '20px',
              backgroundColor: msg.senderNickname === currentUserNickname ? '#3182CE' : (msg.senderNickname === 'System' ? '#4A5568' : '#2D3748'), // Tailwind blue-600, gray-700, gray-800
              color: msg.senderNickname === 'System' ? '#A0AEC0' : 'white', // Tailwind gray-400 for system messages
              maxWidth: '80%',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' // Tailwind shadow-md
            }}>
              <strong style={{fontSize: '0.875rem', display: 'block', marginBottom: '2px'}}>
                {msg.senderNickname === currentUserNickname ? 'Moi' : msg.senderNickname}
              </strong>
              <p style={{ margin: 0, wordWrap: 'break-word', fontSize: '0.9rem', lineHeight: '1.4' }}>{msg.message}</p>
              <small style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block', marginTop: '4px', textAlign: 'right' }}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </small>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} style={{ display: 'flex', marginTop: 'auto' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isTerminated ? 'Session terminée' : 'Écrivez un message...'}
          disabled={isTerminated}
          style={{
            flexGrow: 1,
            padding: '10px 15px',
            borderRadius: '20px',
            border: '1px solid #2D3748', // Tailwind gray-700
            backgroundColor: '#2D3748', // Tailwind gray-800
            color: '#E2E8F0', // Tailwind gray-300
            marginRight: '8px',
            outline: 'none',
          }}
        />
        <button type="submit" disabled={isTerminated || !newMessage.trim()} style={{
          padding: '10px 20px',
          borderRadius: '20px',
          border: 'none',
          backgroundColor: '#3182CE', // Tailwind blue-600
          color: 'white',
          cursor: (isTerminated || !newMessage.trim()) ? 'not-allowed' : 'pointer',
          opacity: (isTerminated || !newMessage.trim()) ? 0.6 : 1,
          fontWeight: '600'
        }}>
          Envoyer
        </button>
      </form>
    </div>
  )
}

export default GuideChat
