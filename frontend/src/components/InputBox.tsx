import React, { useState } from 'react';

interface InputBoxProps {
  onSubmit: (input: string) => void;
  loading: boolean;
}

export default function InputBox({ onSubmit, loading }: InputBoxProps) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmit(input);
      setInput('');
    }
  };

  return (
    <div className="input-box">
      <h2>What's on your mind?</h2>
      <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>
        Feel free to ramble, use whatever thoughts come to mind. We'll translate it for you.
      </p>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Start typing... You can be messy, scattered, emotional — whatever is natural for you."
        disabled={loading}
      />
      <button onClick={handleSubmit} disabled={loading || !input.trim()}>
        {loading ? 'Processing...' : 'Process'}
      </button>
    </div>
  );
}
