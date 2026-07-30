"use client";

import dynamic from "next/dynamic";

const ProgressLibraryWithoutServerRendering = dynamic(
  () =>
    import("./ProgressLibrary").then(
      (progressLibraryModule) => progressLibraryModule.ProgressLibrary,
    ),
  {
    ssr: false,
    loading: () => (
      <main className="press-experience is-browsing">
        <div className="loading-screen" aria-hidden="true">
          <div className="loading-screen__mark">
            <span />
            <span />
            <span />
          </div>

          <p>Preparing the complete catalog</p>
        </div>
      </main>
    ),
  },
);

export function ProgressLibraryClient() {
  return <ProgressLibraryWithoutServerRendering />;
}