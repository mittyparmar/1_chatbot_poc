import React, { useState } from 'react';
import { Button, Input, Typography, Alert } from '@shared-ui';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement actual password reset logic
      console.log('Password reset request for:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any valid email
      if (email.includes('@')) {
        setSuccess(true);
        setEmail('');
      } else {
        setError('Please enter a valid email address');
      }
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <Typography variant="h2" className="mt-4 text-xl font-bold text-gray-900">
            Email Sent!
          </Typography>
          <Typography variant="body" className="mt-2 text-gray-600">
            We've sent a password reset link to {email}. Please check your inbox and follow the instructions.
          </Typography>
          <Typography variant="body" className="mt-4 text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or{' '}
            <button 
              onClick={() => setSuccess(false)}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              try again
            </button>
            .
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <Typography variant="h2" className="text-2xl font-bold text-gray-900 mb-2">
          Forgot Password?
        </Typography>
        <Typography variant="body" className="text-gray-600">
          Enter your email and we'll send you a reset link
        </Typography>
      </div>

      {error && (
        <Alert 
          type="error" 
          message={error} 
          className="mb-6"
          onClose={() => setError(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Typography variant="body" className="text-sm text-gray-600">
          Remember your password?{' '}
          <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </a>
        </Typography>
      </div>
    </div>
  );
};