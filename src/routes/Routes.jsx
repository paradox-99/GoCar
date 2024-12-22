import { createBrowserRouter } from "react-router-dom";
import Root from "../Root";
import HomePage from "../pages/home/HomePage";
import Signin from "../pages/sign_in/Signin";
import SearchPage from "../pages/search/SearchPage";
import Signup from "../pages/sign_up/user_Sign_up/Signup";
import Signup_part2 from "../pages/sign_up/user_Sign_up/Signup_part2";

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
            },
            {
                path: "/sign-up",
                element: <Signup />
            },
            {
                path: "/sign-up/user-info",
                element: <Signup_part2/>
            }
        ]
    }
])

export default router;