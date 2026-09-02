import { ArrowRight, Check, LogOut, Package, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { normalizeProfileName, profileUpdateFeedback } from "@shared/feedback";

export default function Profile() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const updateProfile = trpc.zunoApp.profile.update.useMutation();
  const utils = trpc.useUtils();
  const [name, setName] = useState("");

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  if (loading) return <main className="container page"><div className="state-card"><div className="spinner" /> Loading your profile…</div></main>;
  if (!isAuthenticated) return <main className="container page"><div className="empty profile-empty"><UserRound size={34} aria-hidden="true" /><span className="eyebrow">YOUR ZUNOHUB ACCOUNT</span><h1>Sign in to view your profile.</h1><p>Access your order history, delivery tracking, and quicker checkout from one secure account.</p><button className="primary" onClick={() => startLogin()}>Sign in securely <ArrowRight size={17} aria-hidden="true" /></button></div></main>;

  const displayName = user?.name || "ZunoHub shopper";
  const initial = displayName.trim().charAt(0).toUpperCase() || "Z";

  const handleLogout = async () => { await logout(); navigate("/"); };
  const handleSave = async () => {
    let nextName: string;
    try { nextName = normalizeProfileName(name); } catch (error) { toast.error(error instanceof Error ? error.message : "Enter a valid name."); return; }
    try {
      await updateProfile.mutateAsync({ name: nextName });
      await utils.auth.me.invalidate();
      const feedback = profileUpdateFeedback("success");
      toast.success(feedback.title, { description: feedback.description });
    } catch (error) {
      const feedback = profileUpdateFeedback("error", error instanceof Error ? error.message : undefined);
      toast.error(feedback.title);
    }
  };

  return <main className="container page profile-page">
    <div className="profile-heading"><div><span className="eyebrow">MY ZUNOHUB</span><h1>Your profile</h1><p>Manage your account and keep track of every ZunoHub delivery.</p></div><div className="profile-avatar" aria-label={`Profile for ${displayName}`}>{initial}</div></div>
    <div className="profile-grid">
      <section className="profile-card profile-details" aria-labelledby="profile-details-title"><div className="profile-card-icon"><UserRound size={20} aria-hidden="true" /></div><div className="profile-detail-content"><span className="eyebrow">ACCOUNT DETAILS</span><h2 id="profile-details-title">{displayName}</h2><p>{user?.email || "Email connected to your secure account"}</p><span className="profile-status"><ShieldCheck size={15} aria-hidden="true" /> Secure account</span><label className="profile-edit-label" htmlFor="profile-name">Display name<input id="profile-name" value={name} onChange={event => setName(event.target.value)} maxLength={160} autoComplete="name" /></label><button type="button" className="secondary profile-save" onClick={handleSave} disabled={updateProfile.isPending}><Check size={16} aria-hidden="true" />{updateProfile.isPending ? "Saving…" : "Save details"}</button></div></section>
      <section className="profile-card" aria-labelledby="profile-actions-title"><span className="eyebrow">QUICK LINKS</span><h2 id="profile-actions-title">Keep shopping simply.</h2><div className="profile-links"><Link href="/orders"><Package size={18} aria-hidden="true" /><span><b>Your orders</b><small>View purchases and delivery progress</small></span><ArrowRight size={17} aria-hidden="true" /></Link><Link href="/products"><span className="profile-link-mark">Z</span><span><b>Shop essentials</b><small>Browse groceries and everyday value</small></span><ArrowRight size={17} aria-hidden="true" /></Link></div></section>
    </div>
    <button className="profile-logout" type="button" onClick={handleLogout}><LogOut size={17} aria-hidden="true" /> Sign out</button>
  </main>;
}
