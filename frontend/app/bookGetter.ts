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
            coverImage: "https://craftmasterpaints.de/storage/images/image?remote=https%3A%2F%2Fcraftmasterpaints.de%2FWebRoot%2FStore22%2FShops%2F22688b70-97ca-4f58-8934-25a94365fe60%2F5BEE%2FF993%2FB665%2F33DA%2F1C84%2F0A48%2F355E%2FE718%2FBright_Red.jpg&shop=22688b70-97ca-4f58-8934-25a94365fe60&width=600&height=2560",
            cover: "#FF00FF"
        }
    ]


}