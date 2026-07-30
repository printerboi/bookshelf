from fastapi import FastAPI, Response
from util.dbConnector import DBConnector

app = FastAPI()
db = DBConnector("localhost", 5432, "bookshelf", "max", "fjafoqjo3412048")

@app.get("/books")
async def getAllBooks():
    books = db.getBooks()

    covers = db.getCovers()

    return books

@app.get(
    "/cover/{isbn}",
    response_class=Response,
    responses={
        200: {
            "content": {
                "image/png": {},
            },
            "description": "PNG image",
        },
    },
)
async def getCoverForBook(isbn):
    cover = db.getCover(isbn)
    
    return Response(
        content=bytes(cover.image),
        media_type="image/png"
    )