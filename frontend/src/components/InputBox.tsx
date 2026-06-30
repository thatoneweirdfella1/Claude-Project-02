import React, { useState } from 'react';

interface InputBoxProps {
  onSubmit: (input: string) => void;
  loading: boolean;
}

export default function InputBox({ onSubmit, loading }: InputBoxProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (value.trim()) onSubmit(value.trim());
  };

  return (
    <div className="input-box">
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Type your question here, as rambling as you need..."
        disabled={loading}
      />
      <button onClick={handleSubmit} disabled={loading || !value.trim()}>
        {loading ? 'Processing...' : 'Translate →'}
      </button>
    </div>
  );
}
