import { useState, useContext } from "react";
import Link from "next/link";
import MemoryContext from "./MemoryContext";
import styles from "../styles/Nav.module.scss";

const ProfileNav = ({ page, count, latest, tags }) => {
  const { currentTag } = useContext(MemoryContext);

  // State
  const [logoHover, setLogoHover] = useState(false);

  return (
    <>
      <nav className={`${styles.navigation} ${styles.profile}`}>
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
        <div className={`${styles.top_right} ${styles.profile_right}`}>
          <div className={styles.statement}>Profile</div>
          <div className={styles.contact}>CONTACT</div>
          <div className={styles.archive_link}>
            {latest ? <span className={styles.latest}>Latest</span> : null}
            <Link
              href={
                currentTag && currentTag !== "All Work"
                  ? `/archive?tag=${currentTag}`
                  : "/archive"
              }
            >
              <a className={styles.count_link}>ARCHIVE ({count ? count : 0})</a>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default ProfileNav;
