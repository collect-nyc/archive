import { useState, useEffect, useContext } from "react";
import Head from "next/head";
import SharedHead from "../components/SharedHead";
import MyLayout from "../layouts/MyLayout";
import Prismic from "prismic-javascript";
import { Client } from "../lib/prismic-config";
import { DateTime } from "luxon";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import Masonry from "react-masonry-css";
import _ from "lodash";
import Carot from "../svg/carot.svg";
import MemoryContext from "../components/MemoryContext";
import styles from "../styles/Index.module.scss";

export async function getServerSideProps() {
  const everything = await fetch(
    "https://collectnyc.cdn.prismic.io/api/v2"
  ).then((res) => res.json());

  // const taggers = await fetch(
  //   "https://collectnyc.cdn.prismic.io/api/tags"
  // ).then((res) => res.json());

  //Page Data
  const document = await Client().getSingle("index_page");

  // Archive Items
  const archives = await Client().query(
    Prismic.Predicates.at("document.type", "archive_item"),
    { pageSize: 100 }
  );

  const page = "index";

  return {
    props: { document, archives, page, everything },
  };
}

const Home = ({ archives, document, everything }) => {
  const {
    layoutView,
    setLayoutView,
    azSort,
    setAzSort,
    timeSort,
    setTimeSort,
    currentTag,
    setCurrentTag,
    archiveList,
    setArchiveList,
  } = useContext(MemoryContext);

  // data
  const page_content = document.data;
  const tags = everything.tags;
  const loaded_archives = [...archives.results];

  // State
  // const [gridView, setGridView] = useState(false);
  // const [azSort, setAzSort] = useState(null);
  // const [timeSort, setTimeSort] = useState(null);
  // const [archiveList, setArchiveList] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  // const [currentTag, setCurrentTag] = useState("All Work");

  const ShuffeList = (list) => {
    if (!archiveList) {
      const default_list = _.shuffle(loaded_archives);
      setArchiveList(default_list);
    }
  };

  useEffect(() => {
    ShuffeList();
  }, []);

  // console.log("DATA", page_content, "ARCHIVES", archiveList);

  // Pull archive items by tag
  const GetByTag = (name) => {
    setCurrentTag(name);
    setFilterOpen(false);

    axios
      .post("/api/get-tag-archives", {
        name: name,
      })
      .then(function (response) {
        // console.log("NEW LIST", response.data);

        // const shuffled_tag_results = _.shuffle(response.data.results);
        const shuffled_tag_results = response.data.results;

        setArchiveList(shuffled_tag_results);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const AllTags = () => {
    setCurrentTag("All Work");
    // const default_list = _.shuffle(loaded_archives);
    const default_list = loaded_archives;
    setArchiveList(default_list);
    setFilterOpen(false);
  };

  const ToggleFilters = () => {
    setFilterOpen(!filterOpen);
  };

  // Switch from List to Grid view
  const SwapView = () => {
    setLayoutView(!layoutView);
    // setGridView(!gridView);
  };

  // Sort by title alphabetically
  const AlphabetSort = () => {
    if (azSort === "az") {
      const list = _.orderBy(
        archiveList,
        [
          function (o) {
            return o.data.title[0].text;
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
            return o.data.title[0].text;
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
    if (!timeSort) {
      const list = _.orderBy(
        archiveList,
        [
          function (o) {
            return o.data.creation_date;
          },
        ],
        ["desc"]
      );

      setArchiveList(list);
      setTimeSort("new");
    } else if (timeSort === "new") {
      const list = _.orderBy(
        archiveList,
        [
          function (o) {
            return o.data.creation_date;
          },
        ],
        ["asc"]
      );

      setArchiveList(list);
      setTimeSort("old");
    } else if (timeSort === "old") {
      const list = _.orderBy(
        archiveList,
        [
          function (o) {
            return o.data.creation_date;
          },
        ],
        ["desc"]
      );

      setArchiveList(list);
      setTimeSort("new");
    }
  };

  // List View JSX
  const ListView = () => {
    // console.log("LIST", archiveList);
    return (
      <section className={styles.all_archives}>
        <ul>
          {archiveList && archiveList.length > 0 ? (
            archiveList.map((archive, key) => (
              <li key={key}>
                {archive.data.coming_soon ? (
                  <div className={styles.coming_soon}>
                    <span className={styles.coming_text}>Coming Soon</span>
                    <span className={styles.name}>
                      <span>{archive.data.title[0].text}</span>
                    </span>

                    <span className={styles.tags}>
                      {archive.tags.map((tag, key) => (
                        <span key={key}>
                          {archive.tags.length === key + 1 && tag
                            ? tag
                            : tag
                            ? tag + ", "
                            : null}
                        </span>
                      ))}
                    </span>

                    <span className={styles.date}>
                      {archive.data.creation_date
                        ? DateTime.fromISO(archive.data.creation_date).toFormat(
                            "yyyy"
                          )
                        : "TBD"}
                    </span>
                  </div>
                ) : (
                  <Link href={"/item/" + archive.uid}>
                    <a>
                      <span className={styles.name}>
                        {archive.data.title[0].text}
                      </span>

                      <span className={styles.tags}>
                        {archive.tags.map((tag, key) => (
                          <span key={key}>
                            {archive.tags.length === key + 1 && tag
                              ? tag
                              : tag
                              ? tag + ", "
                              : null}
                          </span>
                        ))}
                      </span>

                      <span className={styles.date}>
                        {archive.data.creation_date
                          ? DateTime.fromISO(
                              archive.data.creation_date
                            ).toFormat("yyyy")
                          : "TBD"}
                      </span>
                    </a>
                  </Link>
                )}
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
    // console.log("GRID", archiveList);

    const breakpointColumnsObj = {
      default: 3,
      900: 2,
    };

    return (
      <section className={styles.all_archives_grid}>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {archiveList && archiveList.length > 0 ? (
            archiveList.map((archive, key) => (
              <article key={key} className={styles.grid_item}>
                {archive.data.coming_soon ? (
                  <a className={`${styles.thumbnail} ${styles.coming_soon}`}>
                    {archive.data.index_thumbnail?.url ? (
                      <Image
                        className={styles.lazyloaded}
                        alt={archive.data.index_thumbnail.alt}
                        src={archive.data.index_thumbnail.url}
                        height={archive.data.index_thumbnail.dimensions.height}
                        width={archive.data.index_thumbnail.dimensions.width}
                      />
                    ) : archive.data.images[0].image.url ? (
                      <Image
                        className={styles.lazyloaded}
                        alt={archive.data.images[0].image.alt}
                        src={archive.data.images[0].image.url}
                        height={archive.data.images[0].image.dimensions.height}
                        width={archive.data.images[0].image.dimensions.width}
                      />
                    ) : null}
                  </a>
                ) : (
                  <Link href={"/item/" + archive.uid}>
                    <a className={styles.thumbnail}>
                      {archive.data.index_thumbnail?.url ? (
                        <Image
                          className={styles.lazyloaded}
                          alt={archive.data.index_thumbnail.alt}
                          src={archive.data.index_thumbnail.url}
                          height={
                            archive.data.index_thumbnail.dimensions.height
                          }
                          width={archive.data.index_thumbnail.dimensions.width}
                        />
                      ) : archive.data.images[0].image.url ? (
                        <Image
                          className={styles.lazyloaded}
                          alt={archive.data.images[0].image.alt}
                          src={archive.data.images[0].image.url}
                          height={
                            archive.data.images[0].image.dimensions.height
                          }
                          width={archive.data.images[0].image.dimensions.width}
                        />
                      ) : null}
                    </a>
                  </Link>
                )}
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
        <SharedHead />
      </Head>

      <nav className={styles.filter_bar}>
        <span className={styles.label}>
          <button
            className={filterOpen ? styles.open : styles.closed}
            onClick={() => ToggleFilters()}
          >
            {currentTag} <Carot />
          </button>
        </span>

        <ul
          className={
            filterOpen
              ? `${styles.tag_list} ${styles.tag_list_open}`
              : styles.tag_list
          }
        >
          {currentTag === "All Work" ? null : (
            <li>
              <button onClick={() => AllTags()}>All Work</button>
            </li>
          )}

          {tags && tags.length > 0
            ? tags.map((tag, key) =>
                tag === currentTag ? null : (
                  <li key={key}>
                    <button index={tag.id} onClick={() => GetByTag(tag)}>
                      {tag}
                    </button>
                  </li>
                )
              )
            : null}
        </ul>

        <span
          className={
            filterOpen
              ? `${styles.controls} ${styles.controls_open}`
              : styles.controls
          }
        >
          <button onClick={() => SwapView()}>
            {layoutView ? "Grid" : "List"}
          </button>
          <button onClick={() => AlphabetSort()}>
            {!azSort || azSort === "az" ? "A-Z" : "Z-A"}
          </button>
          <button onClick={() => TimeSort()}>
            {!timeSort
              ? "New, Old"
              : timeSort === "new"
              ? "New, Old"
              : timeSort === "old"
              ? "Old, New"
              : null}
          </button>
        </span>
      </nav>

      <div className={styles.title_holder}>
        <div className={styles.title}>
          {page_content.header_image ? (
            <Image
              layout={"responsive"}
              src={page_content.header_image.url}
              alt={page_content.header_image.alt}
              height={page_content.header_image.dimensions.height}
              width={page_content.header_image.dimensions.width}
            />
          ) : null}
        </div>
      </div>

      <main
        className={layoutView ? `${styles.main} ${styles.grid}` : styles.main}
      >
        <div className={styles.interior}>
          {layoutView ? <GridView /> : <ListView />}
        </div>
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
