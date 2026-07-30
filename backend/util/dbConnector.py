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
    
    def getBooks(self, id: str = ""):
        if id == "":
            connector = self.connect()

            with connector.cursor() as db_cursor:
                db_cursor.execute(
                    """
                    SELECT *
                    FROM books
                    """
                )

                books_in_db = db_cursor.fetchall()
                books: list[Book] = []

                for book_db in books_in_db:
                    books.append(
                        Book(
                            book_db["isbn"],
                            book_db["book_title"],
                            [Author(1, "test")],
                            Publisher(1, "testpub"),
                            book_db["book_year"],
                            book_db["book_pages"],
                            book_db["book_finished_at"],
                            book_db["book_rating"],
                        )
                    )

                return books
        
        else:
            return []
        
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
        