import { useState } from 'react';
import Router from 'next/router';

export default function Home() {
  const [message, setMessage] = useState('');

  // Handling form submission for signup
  const handleSignup = async (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (data.userId) {
      Router.push(`/user/${data.userId}`);
    } else {
      setMessage(data.message);
    }
  };

  // Handling form submission for login
  const handleLogin = async (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (data.userId) {
      Router.push(`/user/${data.userId}`);
    } else {
      setMessage(data.message);
    }
  };

  return (
    <div>
      <div id="message">{message}</div>
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
        <label htmlFor="signup-email">Email:</label>
        <input type="email" id="signup-email" name="email" required />
        <label htmlFor="signup-password">Password:</label>
        <input type="password" id="signup-password" name="password" required />
        <button type="submit">Signup</button>
      </form>

      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label htmlFor="login-email">Email:</label>
        <input type="email" id="login-email" name="email" required />
        <label htmlFor="login-password">Password:</label>
        <input type="password" id="login-password" name="password" required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
