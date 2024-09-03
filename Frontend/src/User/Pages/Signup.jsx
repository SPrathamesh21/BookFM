import React, { useState, useEffect, useContext } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaKey } from 'react-icons/fa';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import axios from '../../../axiosConfig';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Context/authContext';
import CryptoJS from 'crypto-js';
import dotenv from '../../Utils/env';
import zxcvbn from 'zxcvbn';
import SignupImg from '../../assets/images/signupimg.png';

// const encryptData = (data) => {
//   return CryptoJS.AES.encrypt(JSON.stringify(data), dotenv.SECRET_KEY).toString();
// };

// const decryptData = (cipherText) => {
//   const bytes = CryptoJS.AES.decrypt(cipherText, dotenv.SECRET_KEY);
//   return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
// };

function Signup() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmpassword: '',
    otp: '',
  });
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordSuggestions, setPasswordSuggestions] = useState([]);
  const [timer, setTimer] = useState(120);
  const [otpResent, setOtpResent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // useEffect(() => {
  //   const savedFormData = localStorage.getItem("signupFormData");
  //   if (savedFormData) {
  //     try {
  //       setForm(decryptData(savedFormData));
  //     } catch (error) {
  //       console.error('Failed to decrypt form data', error);
  //     }
  //   }
  // }, []);

  useEffect(() => {
    let interval;
    if (showOtpInput && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [showOtpInput, timer]);

  const handleResendOtp = async () => {
    setIsSendingOtp(true);
    try {
      await axios.post('/resend-otp', { email: form.email });
      setTimer(120);
      setOtpResent(true);
      toast.success('OTP resent to your email.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });

    if (name === 'password') {
      const result = zxcvbn(value);
      setPasswordStrength(result.score);
      setPasswordSuggestions(result.feedback.suggestions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email) {
      toast.error('Please enter an email address to register.');
      return;
    }
    if (showOtpInput) {
      try {
        const response = await axios.post('/verify-otp-and-signup', form);
        const { user, message } = response.data;
        
        login(user);
        toast.success(message);
        // setTimeout(() => {
        //   localStorage.removeItem("signupFormData");
        //   navigate('/');
        // }, 1000);
      } catch (error) {
        const errorMessage = error.response?.data?.message;
        toast.error(errorMessage);
      }
    } else {
      try {
        setIsSendingOtp(true);
        // localStorage.setItem("signupFormData", encryptData(form));
        await axios.post('/send-otp', { email: form.email });
        setShowOtpInput(true);
        setTimer(120);
        toast.success('OTP sent to your email.');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to send OTP.');
      } finally {
        setIsSendingOtp(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left Column - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-r from-teal-400 to-blue-500 justify-center items-center">
        <img
          src={SignupImg} 
          alt="Signup Visual"
          className="h-5/6 rounded-xl transform hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Right Column - Form */}
      <div className="flex w-full lg:w-1/2 justify-center items-center bg-white p-10">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create an Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center bg-gray-100 rounded-md p-2">
              <FaUser className="text-gray-500 mr-3" />
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                required
                className="bg-transparent flex-1 outline-none"
              />
            </div>
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
            <div className="flex items-center bg-gray-100 rounded-md p-2">
              <FaPhone className="text-gray-500 mr-3" />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                pattern="\d{10}"
                maxLength="10"
                placeholder="Phone Number"
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
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600">
                {showPassword ? <HiEye /> : <HiEyeOff />}
              </button>
            </div>
            {/* Password Strength Meter */}
            {form.password && (
              <div className="mt-2">
                <div className={`h-2 rounded ${passwordStrength >= 3 ? 'bg-green-500' : passwordStrength === 2 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${(passwordStrength + 1) * 20}%` }}></div>
                {passwordSuggestions.length > 0 && (
                  <ul className="mt-1 text-sm text-red-600">
                    {passwordSuggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <div className="flex items-center bg-gray-100 rounded-md p-2 relative">
              <FaLock className="text-gray-500 mr-3" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmpassword"
                value={form.confirmpassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
                className="bg-transparent flex-1 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600">
                {showConfirmPassword ? <HiEye /> : <HiEyeOff />}
              </button>
            </div>

            {showOtpInput && (
              <>
                <div className="flex items-center bg-gray-100 rounded-md p-2">
                  <FaKey className="text-gray-500 mr-3" />
                  <input
                    type="text"
                    name="otp"
                    value={form.otp}
                    onChange={handleChange}
                    placeholder="Enter OTP"
                    required
                    className="bg-transparent flex-1 outline-none"
                  />
                </div>
                <div className="text-sm text-center mt-2">
                  <p>{`Didn't receive the OTP?`}</p>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isSendingOtp || otpResent}
                    className="text-blue-500 underline">
                    {isSendingOtp ? 'Sending OTP...' : 'Resend OTP'}
                  </button>
                  {otpResent && timer > 0 && (
                    <p className="mt-2">{`Resend available in ${timer}s`}</p>
                  )}
                </div>
              </>
            )}

            <button
              type="submit"
              className="block w-full text-center py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
              {showOtpInput ? (isSendingOtp ? 'Sending...' : 'Verify OTP & Register') : (isSendingOtp ? 'Sending...' : 'Send OTP')}
            </button>
          </form>
          <p className="text-center text-gray-600 mt-4">
            Already have an account? <a href="/login" className="text-teal-500 font-bold hover:underline">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
