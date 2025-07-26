import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      let errMsg = "Login failed";
      try {
        const errData = await response.json();
        errMsg = errData.error || errMsg;
      } catch {}
      setError(errMsg);
      return;
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("role", data.user.role);
    
    // Redirect to browse page
    navigate('/browse');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center">Sign In</h2>
        {error && <div className="text-red-500 text-center">{error}</div>}
        <div>
          <label className="block mb-2">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block mb-2">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2 border rounded" />
        </div>
        <button type="submit" className="btn-primary w-full">Sign In</button>
        <div className="text-center text-sm">
          Don't have an account? <Link to="/signup" className="text-primary underline">Sign Up</Link>
        </div>
      </form>
    </div>
  );
};

export default SignIn; 