import React, { useState, useEffect } from 'react';

let ws = new WebSocket('ws://localhost:3000');

function App() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessage] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const connectWebSocket = () => {
      ws.onopen = () => {
        console.log('Connected to the server');
        const storedMessages = localStorage.getItem('offlineMessages');

        if (storedMessages) {
          const offlineMessages = JSON.parse(storedMessages);
          offlineMessages.forEach((message: any) => {
            ws.send(JSON.stringify(message));
          });
          localStorage.removeItem('offlineMessages');
        }
      };

      ws.onmessage = (event) => {
        const newMessages = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, ...newMessages]);
      };

      ws.onclose = () => {
        console.log('Connection closed, attempting to reconnect...');

        setTimeout(() => {
          window.location.reload()
          connectWebSocket();
        }, 10000);
      };
    };

    connectWebSocket();

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    if (name.trim() !== '' && messageInput.trim() !== '') {
      const message = {
        name: name,
        text: messageInput,
        timestamp: Date.now(),
      };

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      } else {
        // Save the message to be sent when the connection is reestablished
        const storedMessages = localStorage.getItem('offlineMessages');
        const offlineMessages = storedMessages ? JSON.parse(storedMessages) : [];
        offlineMessages.push(message);
        localStorage.setItem('offlineMessages', JSON.stringify(offlineMessages));
      }

      setName('');
      setMessage('');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', background: 'lightgrey' }}>
      <div>
        <div style={{ height: '50%', overflow: 'scroll' }}>
          {messages.length > 0 ? (
            messages.map((message, i) => (
              <div style={{ background: 'white', borderRadius: '20px', paddingTop: '1px', paddingBottom: '1px', paddingLeft: '5px', paddingRight: '5px', marginTop: '2px' }}>
                <p key={message.name}>{message.name}: {message.content}</p>
                <p key={message.timestamp}>{message.timestamp}</p>
              </div>
            ))
          ) : (
            <div style={{ background: 'white', borderRadius: '20px', paddingTop: '1px', paddingBottom: '1px', paddingLeft: '5px', paddingRight: '5px', marginTop: '2px' }}>

              <p>No messages to display.</p></div>
          )}
        </div>
        <div style={{ marginTop: '10px' }}>
          <input
            type="text"
            placeholder='name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder='message'
            value={messageInput}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;