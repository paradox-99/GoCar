import { createBrowserRouter } from "react-router-dom";
import Root from "../Root";
import HomePage from "../pages/home/HomePage";
import Signin from "../pages/sign_in/Signin";
import SearchPage from "../pages/search/SearchPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root></Root>,
        children: [
            {
                path: "/",
                element: <HomePage />
            },
            {
                path: "/search",
                element: <SearchPage />
            },
            {
                path: "/sign-in",
                element: <Signin />
            }
        ]
    }
])

export default router;