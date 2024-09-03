import React, { useState, useContext, useEffect } from 'react';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { toast } from 'react-toastify';
import axios from '../../../axiosConfig';
import { useNavigate, NavLink } from 'react-router-dom';
import { AuthContext } from '../../Context/authContext';
import SignupImg from '../../assets/images/signupimg.png';

function Login({ userData }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [currentUser, setCurrentUser] = useState(null);
  const { login } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentUser(userData);
  }, [userData]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/login', form, { withCredentials: true });
      const { user } = response.data;
      console.log('usersss', user)
      login(user); 
      toast.success("Login successful!");
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left Column - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-r from-blue-500 to-teal-400 justify-center items-center">
        <img
          src={SignupImg}
          alt="Login Visual"
          className="h-5/6 rounded-xl transform hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Right Column - Form */}
      <div className="flex w-full lg:w-1/2 justify-center items-center bg-white p-10">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login to Your Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center bg-gray-100 rounded-md p-2">
              <FaEnvelope className="text-gray-500 mr-3" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="bg-transparent flex-1 outline-none"
              />
            </div>
            <div className="flex items-center bg-gray-100 rounded-md p-2 relative">
              <FaLock className="text-gray-500 mr-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="bg-transparent flex-1 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 transform -translate-y-1/2 top-1/2 text-gray-600">
                {showPassword ? <HiEye /> : <HiEyeOff />}
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md font-bold hover:bg-blue-600 transition duration-300"
            >
              Login
            </button>
          </form>
          <p className="text-lg text-center text-gray-600 mt-4">
            <NavLink to="/forgot-password" className="decoration-underline text-blue-500 hover:text-blue-700 text-md">Forgot your password?</NavLink>
          </p>
          <p className="text-center text-gray-600 mt-4">
            Don't have an account? <a href="/signup" className="text-blue-500 font-bold hover:underline">Sign up here</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
