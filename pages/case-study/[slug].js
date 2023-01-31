import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  createRef,
} from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Prismic from "prismic-javascript";
import { RichText } from "prismic-reactjs";
// import { useRouter } from "next/router";
// import { gql } from "@apollo/client";
// import { motion } from "framer-motion";
import animateScrollTo from "animated-scroll-to";
import SharedHead from "../../components/SharedHead";
import MyLayout from "../../layouts/MyLayout";
// import ProjectViewer from "../../components/ProjectViewer";
import { Client } from "../../lib/prismic-config";
import { SITE_NAME } from "../../lib/constants";
// import MemoryContext from "../../components/MemoryContext";
import { ImageSlider } from "../../components/ImageSlider";
import styles from "./CaseStudy.module.scss";

export async function getStaticProps({ params, preview = false, previewData }) {
  const uid = params.slug;
  const document = await Client().getByUID("case_study", uid);

  const page = "case_study";

  return {
    props: { document, page, revalidate: 10 },
  };
}

export async function getStaticPaths() {
  const items = await Client().query(
    Prismic.Predicates.at("document.type", "case_study"),
    { pageSize: 100 }
  );

  const posts = items.results;

  // console.log(posts);

  const paths = posts.map((post) => ({
    params: {
      slug: post.uid,
    },
  }));

  // console.log(paths);
  return { paths, fallback: "blocking" };
}

const CaseStudy = ({ document }) => {
  console.log(document);

  const exploreRef = useRef(null);
  const creditsRef = useRef(null);

  const {
    body,
    credits,
    header_description,
    hi_res_project_images,
    mobile_images,
    tagline,
    title,
  } = document.data;

  // Slice Rendering
  const SliceZone =
    body && body.length > 0
      ? body.map((slice, index) => {
          if (slice.slice_type === "full_screen") {
            return (
              <section className={`${styles.section} ${styles.fullscreen}`}>
                <figure className={styles.fullscreen_image_container}>
                  <Image
                    src={slice.primary.full_screen_image.url}
                    layout={"responsive"}
                    alt={slice.primary.full_screen_image.alt}
                    height={slice.primary.full_screen_image.dimensions.height}
                    width={slice.primary.full_screen_image.dimensions.width}
                  />
                </figure>
              </section>
            );
          } else if (slice.slice_type === "centered_image") {
            return (
              <section className={`${styles.section} ${styles.centered_image}`}>
                <figure className={styles.centered_image_container}>
                  <Image
                    src={slice.primary.centered_image.url}
                    layout={"responsive"}
                    alt={slice.primary.centered_image.alt}
                    height={slice.primary.centered_image.dimensions.height}
                    width={slice.primary.centered_image.dimensions.width}
                  />
                </figure>
              </section>
            );
          } else if (slice.slice_type === "image_with_text") {
            return (
              <section
                className={`${styles.section} ${styles.image_with_text} ${
                  slice.primary.orientation === "Left"
                    ? styles.left
                    : styles.right
                }`}
              >
                <div className={styles.text}>
                  {slice.primary.description && (
                    <RichText render={slice.primary.description} />
                  )}
                </div>
                <figure className={styles.image_container}>
                  <Image
                    src={slice.primary.image.url}
                    layout={"responsive"}
                    alt={slice.primary.image.alt}
                    height={slice.primary.image.dimensions.height}
                    width={slice.primary.image.dimensions.width}
                  />
                </figure>
              </section>
            );
          } else if (slice.slice_type === "carousel") {
          } else {
            return null;
          }
        })
      : null;

  return (
    <>
      <Head>
        <title>
          {title[0].text ? title[0].text : "Case Study"} – {SITE_NAME}
        </title>
        <meta
          name="description"
          content={
            header_description && header_description.length > 0
              ? header_description[0].text
              : "A case study project by Collect NEW YORK."
          }
        />

        <SharedHead />
      </Head>
      <main className={styles.case_study_page}>
        <header className={styles.intro}>
          <h1>{tagline && tagline}</h1>
          <div className={styles.description}>
            {header_description && header_description.length > 0 ? (
              <RichText render={header_description} />
            ) : null}

            <ul className={styles.ctas}>
              <li>
                <button
                  onClick={() =>
                    animateScrollTo(exploreRef.current, {
                      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
                      minDuration: 600,
                      speed: 500,
                      verticalOffset: -97,
                    })
                  }
                >
                  Explore
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    animateScrollTo(creditsRef.current, {
                      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
                      minDuration: 600,
                      speed: 500,
                      verticalOffset: -97,
                    })
                  }
                >
                  Project Info
                </button>
              </li>
            </ul>
          </div>
        </header>
        <article ref={exploreRef} id="explore">
          {SliceZone}
        </article>
        <footer ref={creditsRef} id="info">
          <h2>Credits</h2>
        </footer>
      </main>
    </>
  );
};

CaseStudy.Layout = MyLayout;
export default CaseStudy;
