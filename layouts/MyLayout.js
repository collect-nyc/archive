import React, { useState, useEffect } from "react";
import SiteNav from "../components/SiteNav";
import useSWR from "swr";
import _ from "lodash";
import LoaderContext from "../components/LoaderContext";
// import Loader from "../components/Loader";
import CaseStudyFade from "../components/CaseStudyFade";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function MyLayout({
  page,
  case_study,
  project_title,
  children,
}) {
  const { data, error } = useSWR("/api/get-nav-data", fetcher);
  const [loaderDidRun, setLoaderDidRun] = useState(false);

  // useEffect(() => {
  //   console.log("Loader Run", loaderDidRun);
  // }, [loaderDidRun]);

  // console.log("MYLAYOUT", document, page, "Case Study", case_study, data);

  const totalCount = data ? data.count + data.media : null;

  const tags = data ? data.tags : null;

  // const tagPlus = data ? data.tagplus : null;

  // console.log(tagPlus);

  const latest_active =
    data && _.find(data.profile, { update: true }) ? true : false;

  return (
    <React.Fragment>
      <LoaderContext.Provider value={{ loaderDidRun, setLoaderDidRun }}>
        {/*<Loader page={page} />*/}

        <CaseStudyFade />

        <SiteNav
          page={page}
          count={data ? totalCount : null}
          latest={latest_active}
          tags={data && tags ? tags : null}
          case_study={case_study}
          project_title={project_title}
        />
        {children}
      </LoaderContext.Provider>
    </React.Fragment>
  );
}
