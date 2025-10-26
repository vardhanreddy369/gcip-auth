"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import styles from "../login/login.module.css";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { token, setToken, setUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      router.replace("/dashboard");
    }
  }, [token, router]);

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    setErr(null);
    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      const idToken = await cred.user.getIdToken();
      setToken(idToken);
      setUser({
        name: cred.user.displayName || name.trim() || null,
        email: cred.user.email || null,
      });
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign up";
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.shell}>
      <div className={styles.panel}>
        <header className={styles.heading}>
          <h1>Create your account</h1>
          <p>Sign up with your email to access the dashboard.</p>
        </header>

        <form className={styles.form} onSubmit={handleSignup}>
          <label className={styles.field}>
            <span>Full name</span>
            <input
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
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
              autoComplete="new-password"
              placeholder="Choose a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? "Signing you up…" : "Create account"}
          </button>
        </form>

        {err ? <p className={styles.error}>{err}</p> : null}

        <div className={styles.altAction}>
          <span>Already have an account?</span>
          <a href="/login">Sign in</a>
        </div>

        <footer className={styles.footer}>
          <a href="mailto:support@example.com">Need help?</a>
        </footer>
      </div>
    </div>
  );
}
