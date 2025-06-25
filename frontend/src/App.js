import React, { useState } from 'react';
import './App.css';

function App() {
  // State for form fields
  const [developerMessage, setDeveloperMessage] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [model, setModel] = useState('gpt-4.1-mini');
  const [apiKey, setApiKey] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendUrl, setBackendUrl] = useState('');

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponse('');
    setError('');
    setLoading(true);
    try {
      const apiBase = backendUrl || '';
      // Use fetch with ReadableStream for streaming response
      const res = await fetch(apiBase + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          developer_message: developerMessage,
          user_message: userMessage,
          model,
          api_key: apiKey,
        }),
      });
      if (!res.body) throw new Error('No response body');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullText = '';
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          fullText += chunk;
          setResponse((prev) => prev + chunk);
        }
      }
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error fetching response');
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>OpenAI Chat Frontend</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1em', width: '100%', maxWidth: 400 }}>
          <input
            type="text"
            placeholder="Developer Message"
            value={developerMessage}
            onChange={(e) => setDeveloperMessage(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="User Message"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Model (default: gpt-4.1-mini)"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
          <input
            type="password"
            placeholder="OpenAI API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Backend URL (optional, e.g. https://your-backend.vercel.app)"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
        {error && <div style={{ color: 'red', marginTop: '1em' }}>{error}</div>}
        <div style={{ marginTop: '2em', width: '100%', maxWidth: 600, textAlign: 'left', background: '#222', padding: 16, borderRadius: 8, minHeight: 100 }}>
          <strong>Response:</strong>
          <div style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{response}</div>
        </div>
      </header>
    </div>
  );
}

export default App;
