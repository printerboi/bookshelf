"use client";

import { useEffect, useRef, useState } from "react";
import { ShelfEngine, type ShelfMode } from "./ShelfEngine";
import { siteConfig } from "./site-config";
import { getBooks } from "./bookGetter";
import type { CatalogBook } from "./catalog";

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <span aria-hidden="true" className={`arrow-icon arrow-icon--${direction}`}>
      <span />
    </span>
  );
}

export function ProgressLibrary() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ShelfEngine | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mode, setMode] = useState<ShelfMode>("browse");
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("Preparing the complete catalog");
  const [catalog, setCatalog] = useState<CatalogBook[]>([]);

  const activeBook = catalog[activeIndex] ?? null;
  const selectedBook = selectedIndex === null ? null : catalog[selectedIndex] ?? null;

  const isFocused = mode !== "browse";
  const hasBooks = catalog.length > 0;
  const browseControlsAreDisabled = !ready || !hasBooks || isFocused;

  useEffect(() => {
    let cancelled = false;

    async function loadBooks(): Promise<void> {
      try {
        const loadedBooks = await getBooks();

        if (cancelled) {
          return;
        }

        setCatalog(loadedBooks);
        setActiveIndex(0);
        setSelectedIndex(null);
        setMode("browse");

        if (loadedBooks.length === 0) {
          setStatus("No books found");
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load books:", error);
        setStatus("Failed to load the catalog");
      }
    }

    void loadBooks();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (catalog.length === 0) {
      return;
    }

    let cancelled = false;
    let shelfEngine: ShelfEngine | null = null;

    async function initializeShelfEngine(): Promise<void> {
      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      setReady(false);

      if ("fonts" in document) {
        await document.fonts.ready;
      }

      if (cancelled || !canvasRef.current) {
        return;
      }

      shelfEngine = new ShelfEngine(canvasRef.current, catalog, {
        onActiveIndex: setActiveIndex,
        onMode: (nextMode, index) => {
          setMode(nextMode);
          setSelectedIndex(index);
        },
        onStatus: setStatus,
        onReady: () => {
          if (!cancelled) {
            setReady(true);
          }
        },
      });

      engineRef.current = shelfEngine;
    }

    void initializeShelfEngine();

    return () => {
      cancelled = true;
      shelfEngine?.dispose();

      if (engineRef.current === shelfEngine) {
        engineRef.current = null;
      }
    };
  }, [catalog]);

  return (
    <main
      className={`press-experience ${ready ? "is-ready" : ""} ${
        isFocused ? "is-focused" : "is-browsing"
      }`}
    >
      <canvas
        ref={canvasRef}
        className="shelf-canvas"
        data-testid="shelf-canvas"
        role="application"
        tabIndex={0}
        aria-label={`Interactive three-dimensional shelf of ${catalog.length} books. Drag or use the arrow keys to browse. Press Enter to inspect the selected book.`}
      />

      <header className="site-header">
        <div className="wordmark" aria-label={`${siteConfig.wordmark}, ${siteConfig.collectionName}`}>
          <span>{siteConfig.wordmark}</span>
          <span className="wordmark__divider" />
          <span>{siteConfig.collectionName}</span>
        </div>

        <div className="header-actions">
          <div className="edition-mark">
            <span>{catalog.length} Books</span>
            <span>Reads in {new Date().getFullYear()}</span>
          </div>
        </div>
      </header>

      <section className="browse-caption" aria-hidden={isFocused} data-testid="browse-caption">
        <p className="eyebrow">
          <span>{hasBooks ? String(activeIndex + 1).padStart(2, "0") : "00"}</span>

          <span className="eyebrow__line" />

          <span>{String(catalog.length).padStart(2, "0")}</span>
        </p>

        <h1>{activeBook?.title ?? "No books available"}</h1>

        <p className="browse-caption__author">{activeBook?.author ?? ""} - {activeBook?.publisher ?? ""}</p>

        <button
          type="button"
          className="inspect-button"
          data-testid="inspect-active"
          disabled={browseControlsAreDisabled}
          onClick={() => {
            if (activeBook) {
              engineRef.current?.focusBook(activeIndex);
            }
          }}
          aria-label={activeBook ? `Inspect ${activeBook.title}` : "No book available to inspect"}
        >
          <span>Inspect book</span>
          <span aria-hidden="true">↗</span>
        </button>
      </section>

      <button
        type="button"
        className="shelf-arrow shelf-arrow--left"
        data-testid="browse-previous"
        aria-label="Previous book"
        disabled={browseControlsAreDisabled || activeIndex <= 0}
        onClick={() => engineRef.current?.browseBy(-1)}
      >
        <ArrowIcon direction="left" />
      </button>

      <button
        type="button"
        className="shelf-arrow shelf-arrow--right"
        data-testid="browse-next"
        aria-label="Next book"
        disabled={browseControlsAreDisabled || activeIndex >= catalog.length - 1}
        onClick={() => engineRef.current?.browseBy(1)}
      >
        <ArrowIcon direction="right" />
      </button>

      <nav className="shelf-index" aria-label="Catalog position">
        <div className="shelf-index__ticks">
          {catalog.map((book, index) => (
            <button
              key={book.id}
              type="button"
              className={index === activeIndex ? "is-active" : ""}
              aria-label={`Browse to ${book.title}`}
              aria-current={index === activeIndex ? "true" : undefined}
              disabled={!ready || isFocused}
              onClick={() => engineRef.current?.browseTo(index)}
            >
              <span />
            </button>
          ))}
        </div>

        <div className="input-hint" aria-hidden="true">
          <span>DRAG</span>
          <i />
          <span>SCROLL</span>
          <i />
          <span>ARROW KEYS</span>
        </div>
      </nav>

      <aside
        className="book-details"
        aria-hidden={!isFocused}
        aria-label={selectedBook ? `Details for ${selectedBook.title}` : "Book details"}
        data-testid="book-details"
      >
        {selectedBook && selectedIndex !== null ? (
          <div className="book-details__inner">
            <button
              type="button"
              className="back-button"
              data-testid="return-to-shelf"
              onClick={() => engineRef.current?.returnToShelf()}
            >
              <ArrowIcon direction="left" />
              <span>Return to shelf</span>
            </button>

            <div className="book-details__position">
              <span>{String(selectedIndex + 1).padStart(2, "0")}</span>
              <span>{String(catalog.length).padStart(2, "0")}</span>
            </div>

            <div className="book-details__copy">
              <p className="eyebrow">{siteConfig.editionEyebrow}</p>
              <h2>{selectedBook.title}</h2>

              <p className="book-details__author">{selectedBook.author}</p>

              <p className="book-details__description" />

              {
                selectedBook.book_finished_at &&
                (
                  <>
                    <dl>
                      <div>
                        <dt>Finished at</dt>
                        <dd>{selectedBook.book_finished_at}</dd>
                      </div>
                    </dl>
                    <dl>
                      <div>
                        <dt>Rating</dt>
                        <dd>{selectedBook.book_rating}/5</dd>
                      </div>
                    </dl>
                  </>
                )
              }
              <dl>
                <div>
                  <dt>Genre</dt>
                  <dd>{selectedBook.genre}</dd>
                </div>
              </dl>
              <dl>
                <div>
                  <dt>Year</dt>
                  <dd>{selectedBook.year}</dd>
                </div>
              </dl>
              <dl>
                <div>
                  <dt>Pages</dt>
                  <dd>{selectedBook.pages}</dd>
                </div>
              </dl>
            </div>

            <div className="focus-controls" aria-label="Inspection controls">
              <span>Drag to orbit</span>
              <span>Pinch or scroll to zoom</span>

              <button
                type="button"
                data-testid="reset-view"
                onClick={() => engineRef.current?.resetFocusView()}
              >
                Reset view
              </button>
            </div>
          </div>
        ) : null}
      </aside>

      <div
        className="experience-status"
        role="status"
        aria-live="polite"
        data-testid="experience-status"
      >
        <span className="experience-status__dot" />
        <span>{status}</span>
      </div>

      <div className="loading-screen" aria-hidden={ready}>
        <div className="loading-screen__mark">
          <span />
          <span />
          <span />
        </div>

        <p>Assembling {catalog.length} volumes</p>
      </div>

      <p className="independent-note">{siteConfig.independentNote}</p>

      <div className="sr-only" aria-live="polite">
        {isFocused && selectedBook
          ? `Inspecting ${selectedBook.title} by ${selectedBook.author}.`
          : activeBook
            ? `Selected ${activeBook.title} by ${activeBook.author}.`
            : "No book selected."}
      </div>
    </main>
  );
}