import React, { useEffect, useState } from 'react'
import axios from 'axios'
import io from 'socket.io-client'

const socket = io('http://localhost:3010') // Assurez-vous que c'est l'URL correcte de votre backend

interface Message {
  id: string;
  message: string;
  userId: string;
  roomId: string;
}

interface MessageListProps {
  roomId: string;
}

const MessageList: React.FC<MessageListProps> = ({ roomId }) => {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/rooms/${roomId}/messages`)
        setMessages(response.data)
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    fetchMessages()

    // Rejoindre la salle de chat dans Socket.IO
    socket.emit('joinRoom', roomId)

    // Écouter les nouveaux messages en temps réel
    socket.on('newMessage', (message: Message) => {
      console.log(message, roomId)
      if (message.roomId === roomId) {
        setMessages((prevMessages) => [...prevMessages, message])
      }
    })

    return () => {
      socket.off('newMessage')
    }
  }, [roomId])

  return (
    <div>
      <h3>Messages</h3>
      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>
            <strong>{msg.userId}</strong>: {msg.message}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MessageList
