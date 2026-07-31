import axios from "axios";
import { CatalogBook } from "./catalog";


function getCatName(id: number) {
    switch(id) {
        case 0:
            return "year";
        case 1:
            return "pipeline";
        default:
            return "year";
    }
}

export async function getBooks(id: number): Promise<CatalogBook[]> {
    let books: CatalogBook[] = [];
    const resp = await axios.get(`/backend/books/${getCatName(id)}`);

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