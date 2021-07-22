import { useState } from "react";
import Head from "next/head";
import MyLayout from "../layouts/MyLayout";
import { getIndexPage, getAllArchives, getAllTags } from "../lib/api";
import { DateTime } from "luxon";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import Masonry from "react-masonry-css";
import _ from "lodash";
import styles from "../styles/Index.module.scss";

export async function getServerSideProps() {
  const data = await getIndexPage();

  const archives = await getAllArchives();

  const taggers = await getAllTags();

  const page = "index";

  return {
    props: { data, archives, taggers, page },
  };
}

const Home = ({ data, archives, taggers }) => {
  const page_content = data[0].node;

  // State
  const [gridView, setGridView] = useState(false);
  const [azSort, setAzSort] = useState(null);
  const [timeSort, setTimeSort] = useState(null);
  const [archiveList, setArchiveList] = useState(archives);
  const [currentTag, setCurrentTag] = useState(null);

  console.log("DATA", page_content, "ARCHIVES", archives, "TAGS", taggers);

  // Pull archive items by tag
  const GetByTag = (id, name) => {
    // do something
    console.log("TAG CLICK", id);

    setCurrentTag(name);

    axios
      .post("/api/get-tag-archives", {
        id: id,
      })
      .then(function (response) {
        console.log("NEW LIST", response.data);

        setArchiveList(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  // Switch from List to Grid view
  const SwapView = () => {
    setGridView(!gridView);
  };

  // Sort by title alphabetically
  const AlphabetSort = () => {
    if (azSort === "az") {
      const list = _.orderBy(
        archiveList,
        [
          function (o) {
            return o.node.title[0].text;
          },
        ],
        ["desc"]
      );

      setArchiveList(list);
      setAzSort("za");
    } else if (azSort === "za" || !azSort) {
      const list = _.orderBy(
        archiveList,
        [
          function (o) {
            return o.node.title[0].text;
          },
        ],
        ["asc"]
      );

      setArchiveList(list);
      setAzSort("az");
    }
  };

  // Sort by creation date
  const TimeSort = () => {
    if (timeSort === "new" || !timeSort) {
      const list = _.orderBy(
        archiveList,
        [
          function (o) {
            return o.node.creation_date;
          },
        ],
        ["desc"]
      );

      setArchiveList(list);
      setTimeSort("old");
    } else if (timeSort === "old") {
      const list = _.orderBy(
        archiveList,
        [
          function (o) {
            return o.node.creation_date;
          },
        ],
        ["asc"]
      );

      setArchiveList(list);
      setTimeSort("new");
    }
  };

  // List View JSX
  const ListView = () => {
    return (
      <section className={styles.all_archives}>
        <ul>
          {archiveList.length > 0 ? (
            archiveList.map((archive, key) => (
              <li key={key}>
                <Link href={"/item/" + archive.node._meta.uid}>
                  <a>
                    <span className={styles.name}>
                      {archive.node.title[0].text}
                    </span>

                    <span className={styles.tags}>
                      {archive.node.tags.map((item, key) => (
                        <span key={key}>
                          {archive.node.tags.length === key + 1 && item.tag
                            ? item.tag.tag_name[0].text
                            : item.tag
                            ? item.tag.tag_name[0].text + ", "
                            : null}
                        </span>
                      ))}
                    </span>

                    <span className={styles.date}>
                      {archive.node.creation_date
                        ? DateTime.fromISO(archive.node.creation_date).toFormat(
                            "yyyy"
                          )
                        : "TBD"}
                    </span>
                  </a>
                </Link>
              </li>
            ))
          ) : (
            <li className={styles.no_items}>
              No &ldquo;{currentTag}&rdquo; items found.
            </li>
          )}
        </ul>
      </section>
    );
  };

  // Grid View JSX
  const GridView = () => {
    return (
      <section className={styles.all_archives_grid}>
        <Masonry
          breakpointCols={3}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {archiveList.length > 0 ? (
            archiveList.map((archive, key) => (
              <article key={key} className={styles.grid_item}>
                <Link href={"/item/" + archive.node._meta.uid}>
                  <a className={styles.thumbnail}>
                    {archive.node.images[0] ? (
                      <Image
                        className={styles.lazyloaded}
                        data-src="/image-1"
                        alt={archive.node.images[0].image.alt}
                        src={archive.node.images[0].image.url}
                        height={archive.node.images[0].image.dimensions.height}
                        width={archive.node.images[0].image.dimensions.width}
                      />
                    ) : null}
                  </a>
                </Link>
              </article>
            ))
          ) : (
            <li className={styles.no_items}>
              No &ldquo;{currentTag}&rdquo; items found.
            </li>
          )}
        </Masonry>
      </section>
    );
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>COLLECT NYC</title>
        <meta
          name="description"
          content="COLLECT NYC is a full-spectrum interdisciplinary creative practice centered in direction and development."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className={styles.filter_bar}>
        <span className={styles.label}>Filter by:</span>

        <ul className={styles.tag_list}>
          {taggers && taggers[0]
            ? taggers.map((tag, key) => (
                <li key={key}>
                  <button
                    onClick={() =>
                      GetByTag(tag.node._meta.id, tag.node.tag_name[0].text)
                    }
                  >
                    {tag.node.tag_name[0].text}
                  </button>
                </li>
              ))
            : null}
        </ul>

        <span className={styles.controls}>
          <button onClick={() => SwapView()}>
            {gridView ? "List" : "Grid"}
          </button>
          <button onClick={() => AlphabetSort()}>
            {!azSort || azSort === "za" ? "A-Z" : "Z-A"}
          </button>
          <button onClick={() => TimeSort()}>
            {!timeSort || timeSort === "new" ? "New, Old" : "Old, New"}
          </button>
        </span>
      </nav>

      <main
        className={gridView ? `${styles.main} ${styles.grid}` : styles.main}
      >
        <h1 className={styles.title}>
          <span>{page_content.title[0].text}</span>
          <span>{page_content.date_range[0].text}</span>
        </h1>

        {gridView ? <GridView /> : <ListView />}
      </main>
      <footer className={styles.footer}>
        <Image
          layout="responsive"
          width={page_content.footer_graphic.dimensions.width}
          height={page_content.footer_graphic.dimensions.height}
          src={page_content.footer_graphic.url}
          alt="Collect Graphic"
        />
      </footer>
    </div>
  );
};

Home.Layout = MyLayout;
export default Home;
