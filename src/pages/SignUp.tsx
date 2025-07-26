import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Retailer-specific fields
  const [storeName, setStoreName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [businessLicense, setBusinessLicense] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [storeCategory, setStoreCategory] = useState('fashion');
  
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    const signupData = {
      name,
      email,
      password,
      role
    };

    // Add retailer-specific fields if role is retailer
    if (role === 'retailer') {
      Object.assign(signupData, {
        storeName,
        gstNumber,
        businessLicense,
        storeAddress,
        pincode,
        storeCategory
      });
    }

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signupData),
    });

    if (!response.ok) {
      let errMsg = "Signup failed";
      try {
        const errData = await response.json();
        errMsg = errData.error || errMsg;
      } catch {}
      setError(errMsg);
      return;
    }

    const data = await response.json();
    setSuccess(data.message || "Signup successful");
    
    // Store token and user data
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("role", data.user.role);
    
    // Redirect to profile page
    setTimeout(() => {
      navigate('/profile');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-8">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center">Sign Up</h2>
        {error && <div className="text-red-500 text-center">{error}</div>}
        {success && <div className="text-green-500 text-center">{success}</div>}
        
        {/* Role Selection */}
        <div>
          <label className="block mb-2">Account Type</label>
          <select 
            value={role} 
            onChange={e => setRole(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="user">User</option>
            <option value="retailer">Retailer</option>
          </select>
        </div>

        {/* Basic Fields */}
        <div>
          <label className="block mb-2">Full Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
            className="w-full p-2 border rounded" 
          />
        </div>
        
        <div>
          <label className="block mb-2">Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            className="w-full p-2 border rounded" 
          />
        </div>
        
        <div>
          <label className="block mb-2">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            className="w-full p-2 border rounded" 
          />
        </div>

        {/* Retailer-specific fields */}
        {role === 'retailer' && (
          <>
            <div>
              <label className="block mb-2">Store Name</label>
              <input 
                type="text" 
                value={storeName} 
                onChange={e => setStoreName(e.target.value)} 
                required 
                className="w-full p-2 border rounded" 
              />
            </div>
            
            <div>
              <label className="block mb-2">GST Number</label>
              <input 
                type="text" 
                value={gstNumber} 
                onChange={e => setGstNumber(e.target.value)} 
                required 
                placeholder="22AAAAA0000A1Z5"
                className="w-full p-2 border rounded" 
              />
            </div>
            
            <div>
              <label className="block mb-2">Business License (URL)</label>
              <input 
                type="url" 
                value={businessLicense} 
                onChange={e => setBusinessLicense(e.target.value)} 
                required 
                placeholder="https://example.com/license.pdf"
                className="w-full p-2 border rounded" 
              />
            </div>
            
            <div>
              <label className="block mb-2">Store Address</label>
              <textarea 
                value={storeAddress} 
                onChange={e => setStoreAddress(e.target.value)} 
                required 
                rows={3}
                className="w-full p-2 border rounded" 
              />
            </div>
            
            <div>
              <label className="block mb-2">Pincode</label>
              <input 
                type="text" 
                value={pincode} 
                onChange={e => setPincode(e.target.value)} 
                required 
                pattern="[1-9][0-9]{5}"
                placeholder="123456"
                className="w-full p-2 border rounded" 
              />
            </div>
            
            <div>
              <label className="block mb-2">Store Category</label>
              <select 
                value={storeCategory} 
                onChange={e => setStoreCategory(e.target.value)}
                required
                className="w-full p-2 border rounded"
              >
                <option value="fashion">Fashion</option>
                <option value="electronics">Electronics</option>
                <option value="home">Home & Living</option>
                <option value="sports">Sports</option>
                <option value="books">Books</option>
                <option value="other">Other</option>
              </select>
            </div>
          </>
        )}
        
        <button type="submit" className="btn-primary w-full">Sign Up</button>
        <div className="text-center text-sm">
          Already have an account? <Link to="/signin" className="text-primary underline">Sign In</Link>
        </div>
      </form>
    </div>
  );
};

export default SignUp; 