import { createBrowserRouter } from "react-router-dom";
import Root from "../Root";
import HomePage from "../pages/home/HomePage";
import Signin from "../pages/sign_in/Signin";
import SearchPage from "../pages/search/SearchPage";
import Signup from "../pages/sign_up/user_Sign_up/Signup";
import Signup_part2 from "../pages/sign_up/user_Sign_up/Signup_part2";
import AllBrands from "../pages/all_brands/AllBrands";
import BrandPage from "../components/BrandPage";
import { DashboardRoutes } from "./DashboardRoutes";
import Agencies from "../pages/agency/Agencies";
import CarTypes from "../pages/home/CarTypes";
import CarTypePage from "../components/CarTypePage";

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
                path: "/agencies",
                element: <Agencies />
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
            },
            {
                path: '/view-all-brands',
                element: <AllBrands></AllBrands>
            },
            {
                path: '/brand/:brandName',
                element: <BrandPage />
            },
            {
                path: '/carType/:type',
                element: <CarTypePage/>
            }
        ]
    },
    ...DashboardRoutes
])

export default router;