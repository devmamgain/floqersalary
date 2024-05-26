import OpenAI from 'openai';
import React, { useState } from 'react';

const ChatData = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser:true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // You can choose the model you prefer
      messages: newMessages,
    });

    const botMessage = { role: 'system', content: response.data.choices[0].message.content };
    setMessages([...newMessages, botMessage]);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Data Insights Chat</h1>
      <div className="border rounded p-4 h-96 overflow-y-scroll bg-gray-100">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
              {msg.content}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Ask something about the data..."
        />
        <button type="submit" className="mt-2 w-full bg-blue-500 text-white p-2 rounded">Send</button>
      </form>
    </div>
  );
};

export default ChatData;
