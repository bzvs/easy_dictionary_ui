import './App.css';
import React, { useState } from 'react';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [response, setResponse] = useState('');

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleButtonClick = async () => {
    try {
      const res = await fetch('http://localhost:8080/translation/word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputValue,
          source: 'ENGLISH',
          destination: 'RUSSIAN'
        }),
      });
      const data = await res.text(); // Assuming the response is plain text
      setResponse(data);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Something went wrong.');
    }
  };

  return (
      <div className="App">
        <header className="App-header">
          <h1>Easy dictionary app</h1>
          <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter word to translate"
          />
          <button onClick={handleButtonClick}>Translate</button>
          <p>Response: {response}</p>
        </header>
      </div>
  );
}

export default App;
