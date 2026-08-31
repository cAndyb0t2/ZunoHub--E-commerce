import { ArrowRight, LockKeyhole, UserRound } from "lucide-react";
import { Link } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Auth({ signup = false }: { signup?: boolean }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <main className="container page"><div className="state-card"><div className="spinner" /> Checking your account…</div></main>;
  if (isAuthenticated) return <main className="container page"><div className="empty"><UserRound size={34} aria-hidden="true" /><span className="eyebrow">MY ZUNOHUB</span><h1>Welcome back, {user?.name || "shopper"}.</h1><p>Your account is ready for saved order history and a faster checkout.</p><Link className="primary" href="/orders">View my account <ArrowRight size={17} aria-hidden="true" /></Link></div></main>;
  return <main className="container page auth-page"><div className="auth-card"><div className="auth-icon"><LockKeyhole size={23} aria-hidden="true" /></div><span className="eyebrow">{signup ? "JOIN ZUNOHUB" : "WELCOME BACK"}</span><h1>{signup ? "Make everyday shopping easier." : "Sign in to your account."}</h1><p>Use the secure ZunoHub account sign-in to view orders and speed up future checkouts.</p><button className="primary full" onClick={() => startLogin()}>Continue with ZunoHub <ArrowRight size={17} aria-hidden="true" /></button><small>No password is collected on this storefront.</small></div></main>;
}
