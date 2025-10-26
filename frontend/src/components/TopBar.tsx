"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import styles from "./TopBar.module.css";

export default function TopBar() {
  const { token, user, logout, initializing } = useAuth();

  if (initializing) {
    return (
      <header className={styles.topbar} aria-hidden>
        <span className={styles.brand}>GCIP Auth Demo</span>
        <div className={styles.actions}>
          <span className={styles.user} />
        </div>
      </header>
    );
  }

  return (
    <header className={styles.topbar}>
      <Link className={styles.brand} href={token ? "/dashboard" : "/login"}>
        GCIP Auth Demo
      </Link>
      <div className={styles.actions}>
        {token ? (
          <>
            <span className={styles.user}>{user?.name ?? user?.email ?? "User"}</span>
            <button className={styles.logoutButton} onClick={() => logout()}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Sign in</Link>
            <Link href="/signup">Sign up</Link>
          </>
        )}
      </div>
    </header>
  );
}
