'use client';
import { useState } from 'react';
import QRCode from 'react-qr-code';

export default function Home() {
  const [email, setEmail] = useState('eric.ruge@igs-buchholz.de');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  return (
    <div>
      <h1>QR Code Generator</h1>
      <input type="text" placeholder="eric.ruge@igs-buchholz.de" value={email} onChange={handleEmailChange} />
      {email && (
        <div style={{ marginTop: '20px' }}>
          <QRCode value={`mailto:${email}`} />
        </div>
      )}
    </div>
  );
}
