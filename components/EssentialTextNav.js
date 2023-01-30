import { useState } from "react";
import Link from "next/link";
import styles from "./Nav.module.scss";

const EssentialTextNav = ({ page, count, latest, tags }) => {
  // State
  const [logoHover, setLogoHover] = useState(false);

  return (
    <>
      <nav className={`${styles.navigation} ${styles.essential_text_nav}`}>
        <div className={styles.top_left}>
          <div className={styles.link_box}>
            <Link href={"/"}>
              <a
                onMouseEnter={() => {
                  setLogoHover(true);
                }}
                onMouseLeave={() => {
                  setLogoHover(false);
                }}
              >
                {logoHover ? "Collect HOME" : "Collect NEW YORK"}
              </a>
            </Link>
          </div>
        </div>
        <div className={styles.top_right}>
          <div>
            {latest ? <span className={styles.latest}>Latest</span> : null}
            <Link href="/archive">
              <a className={styles.count_link}>({count ? count : 0})</a>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default EssentialTextNav;
