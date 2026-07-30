
class Cover:
    isbn: str
    image: bytearray

    def __init__(self, isbn: str, image: bytearray):
        self.isbn = isbn
        self.image = image