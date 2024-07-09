import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:4000');

const App = () => {
  const [messages, setMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    socket.on('receiveMessage', (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: data.text, from: 'bot' }
      ]);
      setOptions(data.options);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  const handleOptionSelect = (option) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: option, from: 'user' }
    ]);
    socket.emit('sendMessage', option);
  };

  const handleSend = () => {
    if (input) {
      handleOptionSelect(input);
      setInput('');
    }
  };

  return (
    <div className="chatbox">
      {messages.map((msg, index) => (
        <Message key={index} text={msg.text} from={msg.from} />
      ))}
      <div className="options">
        {options.map((option, index) => (
          <Option key={index} text={option} onSelect={() => handleOptionSelect(option)} />
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

const Message = ({ text, from }) => (
  <div className={`message ${from}`}>
    <p>{text}</p>
  </div>
);

const Option = ({ text, onSelect }) => (
  <button className="option" onClick={onSelect}>
    {text}
  </button>
);

export default App;
