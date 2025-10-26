"use client";

import { FormEvent, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  const { token, setToken, setUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      router.replace("/dashboard");
    }
  }, [token, router]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading || socialLoading) return;
    setErr(null);
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pw);
      const idToken = await cred.user.getIdToken();
      setToken(idToken);
      setUser({ name: cred.user.displayName || null, email: cred.user.email || null });
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid credentials";
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading || socialLoading) return;
    setErr(null);
    setSocialLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const idToken = await cred.user.getIdToken();
      setToken(idToken);
      setUser({ name: cred.user.displayName || null, email: cred.user.email || null });
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google sign-in failed";
      setErr(message);
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <div className={styles.shell}>
      <div className={styles.panel}>
        <header className={styles.heading}>
          <h1>Sign in to continue</h1>
          <p>Enter your email and password to access the dashboard.</p>
        </header>
        <form className={styles.form} onSubmit={handleLogin}>
          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className={styles.field}>
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
            />
          </label>
          <button className={styles.button} type="submit" disabled={loading || socialLoading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div className={styles.divider}>
          <span>or continue with</span>
        </div>
        <div className={styles.socialButtons}>
          <button
            className={styles.googleButton}
            type="button"
            onClick={handleGoogleSignIn}
            disabled={socialLoading || loading}
          >
            {socialLoading ? "Connecting to Google…" : "Sign in with Google"}
          </button>
        </div>
        {err ? <p className={styles.error}>{err}</p> : null}
        <div className={styles.altAction}>
          <span>New here?</span>
          <a href="/signup">Create an account</a>
        </div>
        <footer className={styles.footer}>
          <a href="mailto:support@example.com">Need help?</a>
        </footer>
      </div>
    </div>
  );
}
