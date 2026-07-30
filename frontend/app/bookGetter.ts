import { CatalogBook } from "./catalog";


export function getBooks(): CatalogBook[] {


    return [
        {
            id: "9783257228007",
            title: "Das Parfum",
            author: "Patrik Süßkind",
            publisher: "Diogenes",
            year: 1985,
            pages: 320,
            book_finished_at: 213123123,
            book_rating: 5,
            coverImage: "/backend/cover/9783257228007",
            cover: "#FFFFFF"
        },
        {
            id: "9780241398869",
            title: "The man from the future",
            author: "Ananyo Bhattacharya",
            publisher: "Penguin",
            year: 2021,
            pages: 354,
            book_finished_at: 3123154124,
            book_rating: 4,
            coverImage: "/backend/cover/9780241398869",
            cover: "#FFFFFF"
        }
    ]


}