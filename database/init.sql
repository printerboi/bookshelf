-- Authors
CREATE TABLE authors (
    author_id SERIAL PRIMARY KEY,
    author_name TEXT NOT NULL
);

-- Publishers
CREATE TABLE publishers (
    publisher_id SERIAL PRIMARY KEY,
    publisher_name TEXT NOT NULL
);

-- Book Genre
CREATE TABLE genres (
    genre_id SERIAL PRIMARY KEY,
    genre_name TEXT NOT NULL
);

-- Book Topic
CREATE TABLE topics (
    topic_id SERIAL PRIMARY KEY,
    topic_name TEXT NOT NULL
);

-- Books
CREATE TABLE books (
    isbn VARCHAR(50) PRIMARY KEY,
    book_title TEXT NOT NULL,
    book_created_at TIMESTAMP NOT NULL,
    book_publisher_id INTEGER NOT NULL,
    book_genre_id INTEGER NOT NULL,
    book_year INTEGER NOT NULL,
    book_pages INTEGER NOT NULL,
    book_finished_at TIMESTAMP,
    book_rating INTEGER,
    book_cover_image BYTEA,

    CONSTRAINT fk_book_genre
        FOREIGN KEY (book_genre_id)
        REFERENCES genres(genre_id),

    CONSTRAINT fk_book_publisher
        FOREIGN KEY (book_publisher_id)
        REFERENCES publishers(publisher_id)
);

-- n:n Book to authors
CREATE TABLE books_x_authors (
    book_isbn VARCHAR(50) NOT NULL,
    author_id INTEGER NOT NULL,

    PRIMARY KEY (book_isbn, author_id),

    FOREIGN KEY (book_isbn)
        REFERENCES books(isbn),

    FOREIGN KEY (author_id)
        REFERENCES authors(author_id)
);

-- n:n Book to topics
CREATE TABLE books_x_topics (
    book_isbn VARCHAR(50) NOT NULL,
    topic_id INTEGER NOT NULL,

    PRIMARY KEY (book_isbn, topic_id),

    FOREIGN KEY (book_isbn)
        REFERENCES books(isbn),

    FOREIGN KEY (topic_id)
        REFERENCES topics(topic_id)
);

-- Lend table
CREATE TABLE lend_to (
    lend_to_id SERIAL PRIMARY KEY,
    lend_to_name TEXT NOT NULL,
    lend_to_date TIMESTAMP NOT NULL,
    lend_to_book_isbn VARCHAR(50),

    CONSTRAINT fk_lend_to_book
        FOREIGN KEY (lend_to_book_isbn)
        REFERENCES books(isbn)
);