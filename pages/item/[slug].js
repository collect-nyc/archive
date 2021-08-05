import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import SharedHead from "../../components/SharedHead";
import Link from "next/link";

import { useRouter } from "next/router";
import MyLayout from "../../layouts/MyLayout";
import ProjectViewer from "../../components/ProjectViewer";
// import { RichText } from "prismic-reactjs";
import { DateTime } from "luxon";
import Prismic from "prismic-javascript";
import { Client } from "../../lib/prismic-config";
import { SITE_NAME } from "../../lib/constants";
import styles from "../../styles/Item.module.scss";

export async function getStaticProps({ params, preview = false, previewData }) {
    const document = await Client().getByUID("archive_item", params.slug);

    const page = "project";
    return { props: { document, page, revalidate: 60 } };
}

export async function getStaticPaths() {
    const archives = await Client().query(
        Prismic.Predicates.at("document.type", "archive_item"),
        { pageSize: 100 }
    );

    const posts = archives.results;

    // console.log(posts);

    const paths = posts.map((post) => ({
        params: {
            slug: post.uid,
        },
    }));

    // console.log(paths);
    return { paths, fallback: "blocking" };
}

const ArchiveItem = ({ document }) => {
    const router = useRouter();
    const [current, setCurrent] = useState(0);
    const [passwordField, setPasswordField] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLocked, setIsLocked] = useState(document.data.password_protected);

    const page_data = document.data;
    const slug = document.uid;
    // console.log("Project Data", page_data);
    const images = page_data.images;
    const total = images.length;

    useEffect(() => {
        window.document.querySelector("body").classList.add("item_page");
        console.log(document);
        return () => {
            window.document.querySelector("body").classList.remove("item_page");
        };
    }, []);

    const nextItem = () => {
        // something
        console.log("NEXT ITEM");

        if (current + 1 >= total) {
            setCurrent(0);
        } else {
            setCurrent(current + 1);
        }
    };

    const prevItem = () => {
        // something
        console.log("PREVIOUS ITEM");

        if (current === 0) {
            setCurrent(total - 1);
        } else {
            setCurrent(current - 1);
        }
    };

    const Exit = () => {
        router.push("/");
    };

    // Event handlers
    const onDown = (event) => {
        console.log("Key Pressed", event.key);

        switch (event.key) {
            case "ArrowRight":
                nextItem();
                break;
            case "ArrowLeft":
                //do something
                prevItem();
                break;
            case "Escape":
                //do something
                Exit();
                break;
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/password", {
                method: "post",
                body: JSON.stringify({ slug, passwordField }),
                //pass current page slug and whats in the password field
            });

            const body = await response.json();

            if (!body.success) {
                setErrorMessage(body.message);
            } else {
                setIsLocked(false);
            }
        } catch (error) {}
    };

    // Bind and unbind events
    useEffect(() => {
        window.addEventListener("keydown", onDown);

        return () => {
            window.removeEventListener("keydown", onDown);
        };
    });

    return (
        <div className={styles.container}>
            <Head>
                <title>
                    {page_data.title[0].text
                        ? page_data.title[0].text
                        : "COLLECT Project"}{" "}
                    _ {SITE_NAME}
                </title>
                <meta
                    name="description"
                    content={
                        page_data.description.length > 0
                            ? page_data.description[0].text
                            : "An archive item by COLLECT NYC."
                    }
                />
                <SharedHead />
            </Head>
            {isLocked ? (
                <div className={styles.password_wrapper}>
                    <form
                        className={styles.password_field}
                        onSubmit={handlePasswordSubmit}
                    >
                        <input
                            className={styles.text_input}
                            type="text"
                            value={passwordField}
                            placeholder="Enter Password"
                            onChange={(e) => setPasswordField(e.target.value)}
                        />
                        <p>{errorMessage}</p>
                        <button className={styles.password_button}>
                            View Case Study
                        </button>
                    </form>
                </div>
            ) : (
                <div>
                    <div className={styles.mobile_close}>
                        <Link href="/">
                            <a className={styles.close_btn}>Close</a>
                        </Link>
                    </div>

                    <main className={styles.main}>
                        <ProjectViewer
                            images={images}
                            prevItem={prevItem}
                            nextItem={nextItem}
                            current={current}
                        />
                    </main>

                    <footer
                        className={
                            images.length > 1
                                ? `${styles.project_footer} ${styles.multi_item}`
                                : `${styles.project_footer} ${styles.single_item}`
                        }
                    >
                        <div className={styles.close_col}>
                            <Link href="/">
                                <a className={styles.close_btn}>Close</a>
                            </Link>
                        </div>

                        <h1 className={styles.title}>
                            {page_data.title[0]
                                ? page_data.title[0].text
                                : "COLLECT Project"}
                        </h1>

                        {/*page_data.description ? (
          <RichText render={page_data.description} />
        ) : null*/}

                        <div className={styles.tags}>
                            {document.tags.map((tag, key) => (
                                <span key={key}>
                                    {document.tags.length === key + 1 && tag
                                        ? tag
                                        : tag
                                        ? tag + ", "
                                        : null}
                                </span>
                            ))}
                        </div>

                        <span className={styles.date}>
                            {page_data.creation_date
                                ? DateTime.fromISO(
                                      page_data.creation_date
                                  ).toFormat("yyyy")
                                : "TBD"}
                        </span>
                        <div className={styles.multi_col}>
                            {total > 1 ? (
                                <span>
                                    {current + 1}/{total}
                                </span>
                            ) : null}
                        </div>
                    </footer>
                </div>
            )}
        </div>
    );
};

ArchiveItem.Layout = MyLayout;
export default ArchiveItem;
