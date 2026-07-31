from fastapi import FastAPI, Response
from util.dbConnector import DBConnector
import os

# ===================== Env handling ======================

dbhost = os.getenv("DB_HOST")
dbport = os.getenv("DB_PORT")
dbname = os.getenv("DB_NAME")
dbuser = os.getenv("DB_USER")
dbpassword = os.getenv("DB_PASSWORD")

if dbhost is None:
    raise RuntimeError("DB_HOST is missing. Define the environment variable DB_HOST")

if dbport is None:
    raise RuntimeError("DB_PORT is missing. Define the environment variable DB_PORT")

if dbname is None:
    raise RuntimeError("DB_NAME is missing. Define the environment variable DB_NAME")

if dbuser is None:
    raise RuntimeError("DB_USER is missing. Define the environment variable DB_USER")

if dbpassword is None:
    raise RuntimeError("DB_PASSWORD is missing. Define the environment variable DB_PASSWORD")

# ===========================================================

app = FastAPI()
db = DBConnector(dbhost, dbport, dbname, dbuser, dbpassword)

@app.get("/books/{cat}")
async def getAllBooks(cat):
    books = db.getBooks(cat)
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

@app.get("/color/{isbn}")
async def getColorsForBook(isbn):
    cover = db.getCover(isbn)
    
    return {
        "main": cover.getMainColor(),
        "text": cover.getTextColor(),
    }