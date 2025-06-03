import React, { useState, useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { useSocket } from 'contexts/SocketContext'; // Assuming this is the correct path
import { useUser } from 'contexts/UserContext'; // To get current user's nickname

interface GuideChatProps {
  guideRoomName: string;
  partnerNickname: string; // Nickname of the other person in the chat (guide or guided)
  amIGuide: boolean; // To label who is who
  onSessionTerminated: () => void; // Callback when session is terminated
}

interface Message {
  // The backend sends senderId, senderNickname, message, timestamp.
  // We'll primarily use senderNickname on the client for display.
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
  const { socket } = useSocket();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTerminated, setIsTerminated] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const currentUserNickname = user?.nickname || 'You';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      // Ensure the message is for the current active guide room
      // This check might be redundant if the component is only mounted when a specific room is active
      // but good for safety if socket events are handled more globally before reaching this component.
      // For now, assuming parent component ensures this component is only active for its guideRoomName.
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    const handleSessionTerminated = (data: { guideRoomName: string; reason: string; roomId: number }) => {
      if (data.guideRoomName === guideRoomName) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            senderNickname: 'System',
            message: `Session terminated: ${data.reason}`,
            timestamp: new Date().toISOString(),
          },
        ]);
        setIsTerminated(true);
        if (onSessionTerminated) {
            onSessionTerminated();
        }
      }
    };

    // Listen for messages specifically for this guide channel
    // The backend emits to a room, so the client just needs to listen to the event.
    socket.on('new_guide_message', handleNewMessage);
    socket.on('guide_session_terminated', handleSessionTerminated);

    return () => {
      socket.off('new_guide_message', handleNewMessage);
      socket.off('guide_session_terminated', handleSessionTerminated);
    };
  }, [socket, guideRoomName, onSessionTerminated]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !newMessage.trim() || isTerminated) return;

    socket.emit('send_guide_message', {
      guideRoomName,
      message: newMessage.trim(),
    });
    setNewMessage('');
  };

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
        Chat: {partnerNickname} <span style={{fontSize: '0.8rem', color: '#718096'}}>({amIGuide ? 'Guiding' : 'Guided'})</span>
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
                {msg.senderNickname === currentUserNickname ? 'Me' : msg.senderNickname}
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
          placeholder={isTerminated ? "Session ended" : "Type a message..."}
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
          Send
        </button>
      </form>
    </div>
  );
};

export default GuideChat;
