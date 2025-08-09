import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      setMessage('Password reset email sent! Check your inbox and follow the instructions.');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Intro */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-700 to-gray-800 text-white p-12 flex-col justify-center">
        <div className="max-w-md">
          <div className="flex items-center mb-8">
            <img 
              src="/src/images/DevKlicks-logo.png" 
              alt="DevKlicks" 
              className="w-12 h-12 rounded-lg mr-4"
            />
            <h1 className="text-3xl font-bold">DevKlicks</h1>
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Secure password recovery
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Don't worry, it happens to the best of us. Enter your email address 
            and we'll send you a secure link to reset your password.
          </p>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
              <span className="text-gray-300">Secure password reset process</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
              <span className="text-gray-300">Email verification required</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
              <span className="text-gray-300">Account protection guaranteed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="lg:hidden flex items-center justify-center mb-8">
            <img 
              src="/src/images/DevKlicks-logo.png" 
              alt="DevKlicks" 
              className="w-12 h-12 rounded-lg mr-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">DevKlicks</h1>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Reset your password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {message}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address *
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          </form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
  )
}