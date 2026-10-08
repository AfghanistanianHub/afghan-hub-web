import Link from "next/link";
import styles from "./public-navigation.module.css";

export function Brand() {
  return <Link href="/" aria-label="Afghan Hub home" className={styles.brand}>
    <span className={styles.brandMark} aria-hidden="true"> <i /> </span>
    <span>Afghan Hub</span>
  </Link>;
}
