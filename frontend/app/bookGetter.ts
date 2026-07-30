import axios from "axios";
import { CatalogBook } from "./catalog";

export async function getBooks(): Promise<CatalogBook[]> {
    let books: CatalogBook[] = [];
    const resp = await axios.get("/backend/books");

    if (resp.status == 200) {
        if (resp.data) {
            resp.data.forEach((element: { id: any; title: any; authors: any; publisher: any; genre: any; year: any; pages: any; book_finished_at: any; book_rating: any; }) => {
                console.log(element);
                books.push({
                    id: element.id,
                    title: element.title,
                    author: element.authors,
                    publisher: element.publisher,
                    genre: element.genre,
                    year: element.year,
                    pages: element.pages,
                    book_finished_at: element.book_finished_at,
                    book_rating: element.book_rating,
                    coverImage: `/backend/cover/${element.id}`,
                    cover: "#FFFFFF"
                },)
            });
        }
    }


    return books;
}