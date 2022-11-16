import React, { useState } from "react";
import { useRouter } from "next/router";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/clientApp";

import styles from "../styles/Auth.module.css";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password).then(() => {
      router.push("/");
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <span className={styles.logo}>Maverick</span>
        <span className={styles.title}>Login</span>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className={styles.button} type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
