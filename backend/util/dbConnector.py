import psycopg
from psycopg.rows import dict_row

from books.books import Book
from books.cover import Cover
from authors.authors import Author
from publishers.publisher import Publisher

class DBConnector:
    url: str

    def __init__(self, host: str, port: int, db: str, user: str, password: str):
        self.host = host
        self.port = port
        self.database_name = db
        self.user = user
        self.password = password

    def connect(self):
        return psycopg.connect(
            host=self.host,
            port=self.port,
            dbname=self.database_name,
            user=self.user,
            password=self.password,
            row_factory=dict_row,
        )
    
    def _getCatQuery(self, cat: int):
        # Reads in 2026
        if cat == "year":
            return """
            SELECT
                book.*,
                publisher.publisher_name AS publisher,
                genre.genre_name AS genre,
                (
                    SELECT STRING_AGG(
                        author.author_name,
                        ', '
                        ORDER BY author.author_name
                    )
                    FROM public.books_x_authors AS book_author
                    JOIN public.authors AS author
                        ON author.author_id = book_author.author_id
                    WHERE book_author.book_isbn = book.isbn
                ) AS authors
            FROM public.books AS book
            LEFT JOIN public.publishers AS publisher
                ON publisher.publisher_id = book.book_publisher_id
            LEFT JOIN public.genres AS genre
                ON genre.genre_id = book.book_genre_id
            WHERE book.book_finished_at >= TIMESTAMP '2026-01-01 00:00:00'
            AND book.book_finished_at < TIMESTAMP '2027-01-01 00:00:00';
            """
        # Books in the Pipeline
        if cat == "pipeline":
            return """
                SELECT
                book.*,
                publisher.publisher_name AS publisher,
                genre.genre_name AS genre,
                (
                    SELECT STRING_AGG(
                        author.author_name,
                        ', '
                        ORDER BY author.author_name
                    )
                    FROM public.books_x_authors AS book_author
                    JOIN public.authors AS author
                        ON author.author_id = book_author.author_id
                    WHERE book_author.book_isbn = book.isbn
                ) AS authors
            FROM public.books AS book
            LEFT JOIN public.publishers AS publisher
                ON publisher.publisher_id = book.book_publisher_id
            LEFT JOIN public.genres AS genre
                ON genre.genre_id = book.book_genre_id
            WHERE book.book_created_at >= TIMESTAMP '2026-01-01 00:00:00'
            AND book.book_created_at < TIMESTAMP '2027-01-01 00:00:00';
            """
        else:
            return """
            SELECT
                book.*,
                publisher.publisher_name AS publisher,
                genre.genre_name AS genre,
                (
                    SELECT STRING_AGG(
                        author.author_name,
                        ', '
                        ORDER BY author.author_name
                    )
                    FROM public.books_x_authors AS book_author
                    JOIN public.authors AS author
                        ON author.author_id = book_author.author_id
                    WHERE book_author.book_isbn = book.isbn
                ) AS authors
            FROM public.books AS book
            LEFT JOIN public.publishers AS publisher
                ON publisher.publisher_id = book.book_publisher_id
            LEFT JOIN public.genres AS genre
                ON genre.genre_id = book.book_genre_id;
            """;
    
    def getBooks(self, cat = "year"):
        connector = self.connect()

        with connector.cursor() as db_cursor:
            db_cursor.execute(
                self._getCatQuery(cat)
            )

            books_in_db = db_cursor.fetchall()
            books: list[Book] = []

            for book_db in books_in_db:
                books.append(
                    Book(
                        book_db["isbn"],
                        book_db["book_title"],
                        book_db["authors"],
                        book_db["publisher"],
                        book_db["genre"],
                        book_db["book_year"],
                        book_db["book_pages"],
                        book_db["book_finished_at"],
                        book_db["book_rating"],
                    )
                )

            return books
        
    def getCover(self, id: str):
        connector = self.connect()

        with connector.cursor() as db_cursor:
            db_cursor.execute(
                """
                SELECT isbn, book_cover_image
                FROM books
                where isbn = %s
                """,
                (id,),
            )

            books_in_db = db_cursor.fetchone()
            
            return Cover(
                books_in_db["isbn"],
                books_in_db["book_cover_image"]
            )
        