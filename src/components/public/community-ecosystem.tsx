
import styles from "./community-ecosystem.module.css";

export function CommunityPattern({ variant = "indigo" }: { variant?: "indigo" | "coral" | "gold" | "blue" }) {
  return <div aria-hidden="true" className={`${styles.pattern} ${styles[variant]}`}><svg viewBox="0 0 320 120" fill="none" preserveAspectRatio="xMidYMid slice"><path d="M-40 120 80 0l120 120L320 0l120 120M-40 60 80-60 200 60 320-60 440 60" stroke="currentColor" strokeWidth="24"/><circle cx="160" cy="60" r="43" stroke="currentColor" strokeWidth="2"/><path d="m160 18 42 42-42 42-42-42Z" stroke="currentColor" strokeWidth="2"/></svg></div>;
}

