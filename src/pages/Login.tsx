import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { Input, Button } from '@components/common';
import { IoMailOutline, IoLockClosedOutline } from 'react-icons/io5';
import logoSvg from '@assets/logo.svg';
import bgImage from '@assets/BG-17938272.jpg';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Background Image */}
      <div
        className="hidden lg:flex lg:w-1/2 relative"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#1D2441]/60" />
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <img src={logoSvg} alt="Logo" className="h-16 mb-8" />
          <h1 className="text-4xl font-bold text-white text-center mb-4">
            Welcome to Data Trojan Horse
          </h1>
          <p className="text-lg text-white/80 text-center max-w-md">
            Your intelligent management system for monitoring and analytics
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#F5F7FB] p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src={logoSvg} alt="Logo" className="h-12" />
          </div>

          <div className="bg-white rounded-[30px] shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-[#000000] font-open-sans mb-2">
              Sign In
            </h2>
            <p className="text-[#A9A9A9] font-open-sans mb-8">
              Enter your credentials to access your account
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-[10px]">
                <p className="text-red-600 text-sm font-open-sans">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="email"
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<IoMailOutline className="w-5 h-5" />}
                required
              />

              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<IoLockClosedOutline className="w-5 h-5" />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
                className="py-3 text-base"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
