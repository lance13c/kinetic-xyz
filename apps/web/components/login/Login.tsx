import { ethers } from 'ethers';
import React, { useState } from 'react';

const Login: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleLogin = async () => {
    try {
      if (!window.ethereum) {
        setError("MetaMask is not installed. Please install it.");
        return;
      }
      
      // Create an ethers provider wrapping the injected MetaMask provider.
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAddress(userAddress);

      // Create a challenge message (in production, include a unique nonce)
      const challengeMessage = `Login to MyApp at ${new Date().toISOString()}`;
      
      // Request the user to sign the challenge message.
      const signature = await signer.signMessage(challengeMessage);

      // Define the GraphQL mutation for login.
      const mutation = `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            success
            token
          }
        }
      `;

      // Send the GraphQL mutation request.
      const res = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: mutation,
          variables: {
            input: {
              address: userAddress,
              message: challengeMessage,
              signature: signature,
            },
          },
        }),
      });
      
      const result = await res.json();
      
      if (result.data && result.data.login.success) {
        setLoggedIn(true);
      } else {
        setError(result.errors?.[0]?.message || "Verification failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {loggedIn ? (
        <div>
          <p>Logged in as: {address}</p>
        </div>
      ) : (
        <button onClick={handleLogin}>Login with MetaMask</button>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Login;
