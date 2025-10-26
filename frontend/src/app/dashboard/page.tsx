"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const { token, user, logout } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE;

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  const displayName = useMemo(() => {
    return user?.name?.trim() || user?.email || "User";
  }, [user?.name, user?.email]);

  const email = useMemo(() => user?.email ?? "unknown@domain.com", [user?.email]);

  const maskedEmail = useMemo(() => {
    if (!email.includes("@")) return email;
    const [name, domain] = email.split("@");
    if (name.length <= 2) return email;
    return `${name.slice(0, 2)}***@${domain}`;
  }, [email]);

  const avatarInitial = useMemo(() => displayName.charAt(0).toUpperCase(), [displayName]);

  const callProtected = async () => {
    if (!token) {
      setError("No token available");
      return;
    }
    if (!apiBase) {
      setError("NEXT_PUBLIC_API_BASE is not configured");
      return;
    }

    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`${apiBase}/api/hello`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with status ${res.status}`);
      }
      const data = await res.json();
      setMessage(data.message ?? JSON.stringify(data));
    } catch (err) {
      const message = err instanceof Error ? err.message : "API request failed";
      setError(message);
    } finally {
      setPending(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.backdrop} aria-hidden />
        <div className={styles.card}>
          <div className={styles.loader} aria-hidden />
          <p className={styles.loadingText}>Preparing your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.backdrop} aria-hidden />
      <main className={styles.card}>
        <header className={styles.header}>
          <span className={styles.avatar} aria-hidden>
            {avatarInitial}
          </span>
          <div>
            <p className={styles.pill}>Authenticated session</p>
            <h1>Welcome, {displayName}</h1>
            <p className={styles.subtitle}>Signed in as {email}</p>
          </div>
        </header>

        <section className={styles.infoGrid}>
          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Primary email</span>
            <p>{email}</p>
          </div>
          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Masked identifier</span>
            <p>{maskedEmail}</p>
          </div>
        </section>

        <section className={styles.actions}>
          <button className={styles.primaryButton} onClick={callProtected} disabled={pending}>
            {pending ? "Contacting API…" : "Call Protected API"}
          </button>
          <button
            className={styles.secondaryButton}
            onClick={async () => {
              await logout();
              router.replace("/login");
            }}
          >
            Sign out
          </button>
        </section>

        <section className={styles.callout}>
          <span className={styles.calloutLabel}>{message ? "Response" : "Status"}</span>
          <p>{message ?? "Awaiting response. Call the protected API to fetch a greeting."}</p>
          {error ? <p className={styles.calloutError}>{error}</p> : null}
        </section>
      </main>
    </div>
  );
}
