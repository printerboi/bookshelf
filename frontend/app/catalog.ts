export type BookMotif =
  | "lattice"
  | "corrosion"
  | "efficiency"
  | "network"
  | "boom"
  | "organization"
  | "schematic"
  | "flight"
  | "circuit"
  | "orbit"
  | "branches"
  | "wave"
  | "runner"
  | "gather"
  | "maze"
  | "fracture"
  | "continuum"
  | "windows"
  | "steps";

export type CatalogBook = {
  id: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  pages: number;
  book_finished_at: number;
  book_rating: number;
  cover: string;
  /**
   * Optional browser URL for contributor-owned front-cover art. Put local
   * images under `public/books/<id>/` and use a URL such as
   * `/books/<id>/cover.webp`.
   */
  coverImage?: string;
};

export const catalog: CatalogBook[] = ([
  
]);
