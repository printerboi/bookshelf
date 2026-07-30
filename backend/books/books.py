
from authors.authors import Author
from publishers.publisher import Publisher

class Book:
    id: str
    title: str
    authors: list[Author]
    publisher: Publisher
    year: int
    pages: int
    book_finished_at: int
    book_rating: int
    cover: str

    def __init__(self, id: str, title: str, authors: list[Author], publisher: Publisher, year: int, pages: int, book_finished_at: int, book_rating: int):
        self.id = id
        self.title = title
        self.authors = authors
        self.publisher = publisher
        self.year = year
        self.pages = pages
        self.book_finished_at = book_finished_at
        self.book_rating = book_rating
        self.cover = "#FF00FF"

