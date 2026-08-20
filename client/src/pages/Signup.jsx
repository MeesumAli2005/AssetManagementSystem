// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// export default function Signup() {
//   const [fullName, setFullName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { signup } = useAuth();
//   const navigate = useNavigate();

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       await signup(fullName, email, password);
//       setSuccess(true);
//       setTimeout(() => navigate('/login'), 1500);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Signup failed');
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 [background:radial-gradient(ellipse_800px_500px_at_50%_0%,rgba(16,185,129,0.12),transparent)]">
//       <div className="w-full max-w-sm">
//         <div className="mb-8 flex flex-col items-center gap-3">
//           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-base font-bold text-zinc-950 shadow-[0_0_24px_-4px_rgba(16,185,129,0.7)]">
//             A
//           </div>
//           <h1 className="font-serif text-2xl tracking-tight text-zinc-100">Create your account</h1>
//           <p className="text-base text-zinc-500">Get started with Asset Manager</p>
//         </div>

//         <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl shadow-black/30 backdrop-blur">
//           {success ? (
//             <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-base text-emerald-400">
//               Account created. Redirecting to login…
//             </p>
//           ) : (
//             <form onSubmit={handleSubmit}>
//               <div className="mb-4">
//                 <label className="mb-1.5 block text-base font-medium text-zinc-300">Full name</label>
//                 <input
//                   type="text"
//                   placeholder="Jane Doe"
//                   value={fullName}
//                   onChange={(e) => setFullName(e.target.value)}
//                   required
//                   className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 placeholder:text-zinc-500 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
//                 />
//               </div>

//               <div className="mb-4">
//                 <label className="mb-1.5 block text-base font-medium text-zinc-300">Email</label>
//                 <input
//                   type="email"
//                   placeholder="you@example.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                   className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 placeholder:text-zinc-500 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
//                 />
//               </div>

//               <div className="mb-5">
//                 <label className="mb-1.5 block text-base font-medium text-zinc-300">Password</label>
//                 <input
//                   type="password"
//                   placeholder="••••••••"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 placeholder:text-zinc-500 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
//                 />
//               </div>

//               {error && (
//                 <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{error}</p>
//               )}

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full rounded-lg bg-gradient-to-b from-emerald-500 to-emerald-600 px-4 py-2 text-base font-medium text-zinc-950 shadow-sm transition hover:from-emerald-400 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 {loading ? 'Creating account…' : 'Sign up'}
//               </button>
//             </form>
//           )}
//         </div>

//         <p className="mt-6 text-center text-base text-zinc-500">
//           Already have an account?{' '}
//           <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300">
//             Login
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }
