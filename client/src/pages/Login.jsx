import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login()
{
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e)
  {
    e.preventDefault();
    setError('');
    setLoading(true);

    try
    {
      const user = await login(email, password);
      if (user.role === 'administrator')
        {
            navigate('/admin');
        }

        else
        {
            navigate('/employee');
        }
    }

    catch (err)
    {
      setError(err.response?.data?.message || 'Login failed');
    }

    finally
    {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4">
      <div className="flex justify-center pt-10">
        <div className="rounded-lg bg-emerald-600 px-4 py-2 font-serif text-base font-semibold text-zinc-950">
          Asset Manager
        </div>
      </div>

      <div className="mx-auto mt-28 w-full max-w-sm">
        <h1 className="mb-8 font-serif text-2xl font-bold tracking-tight text-zinc-100">Sign in</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="mb-1.5 block text-base font-medium text-zinc-300">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border-b border-zinc-700 bg-transparent px-0 py-2 text-base text-zinc-100 placeholder:text-zinc-600 transition focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="mb-7">
            <label className="mb-1.5 block text-base font-medium text-zinc-300">Password</label>
            <div className="relative">
             <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border-b border-zinc-700 bg-transparent px-0 py-2 pr-8 text-base text-zinc-100 placeholder:text-zinc-600 transition focus:border-emerald-500 focus:outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-400"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 18 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L2121m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              )}
            </button>
            </div>
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-base font-medium text-zinc-950 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
