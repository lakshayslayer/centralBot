import React, { useState } from 'react';
import './Chatbox.css'

const Chatbox = () => {
    const [messages, setMessages] = useState([]);
    const [options, setOptions] = useState([]);

    const handleOptionSelect = async (option) => {
        // Send selected option to backend
        const response = await fetch('/api/user-bot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ option })
        });
        const data = await response.json();

        // Update messages and options
        setMessages([...messages, { text: option, from: 'user' }, { text: data.response, from: 'bot' }]);
        setOptions(data.options);
    };

    return (
        <div className="chatbox">
            {messages.map((msg, index) => (
                <Message key={index} text={msg.text} from={msg.from} />
            ))}
            {options.map((option, index) => (
                <Option key={index} text={option} onSelect={() => handleOptionSelect(option)} />
            ))}
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

export default Chatbox;
