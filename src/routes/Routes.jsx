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
import CarTypePage from "../components/CarTypePage";
import DriverSignUp from "../pages/sign_up/driver_signup/DriverSignUp";
import AgencySignUp from "../pages/sign_up/agency_sign_up/AgencySignUp";
import ViewAgencyDetails from "../pages/agency/ViewAgencyDetails";
import Filter from "../pages/search/Filter";
import ViewDetails from "../components/ViewDetails";
import Booking from "../pages/booking/Booking";
import PaymentSuccess from "../components/payment/PaymentSuccess";
import PaymentFail from "../components/payment/PaymentFail";
import ErrorPage from "../ErrorPage";
import EmailVerificationPage from "../pages/sign_up/user_Sign_up/EmailVerificationPage";
import PrivateRoute from "../private/PrivateRoute";
import PersonalInfo from "../pages/sign_up/user_Sign_up/PersonalInfo";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root></Root>,
        errorElement: <ErrorPage/>,
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
                path: "/sign-up/email-verification",
                element: <PrivateRoute><EmailVerificationPage /></PrivateRoute>
            },
            {
                path: "/sign-up/user-info",
                element: <PrivateRoute><Signup_part2 /></PrivateRoute>
            },
            {
                path: "sign-up/user-contact-info",
                element: <PrivateRoute><PersonalInfo /></PrivateRoute>
            },
            {
                path: "/sign-up/agency",
                element: <AgencySignUp />
            },
            {
                path: "/sign-up/driver",
                element: <DriverSignUp />
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
            },
            {
                path: '/agency/:id',
                element: <ViewAgencyDetails/>
            },
            {
                path: '/search/queries',
                element:<SearchPage/>
            },
            {
                path: '/search',
                element: <Filter></Filter>
            },
            {
                path: '/details/:name',
                element: <ViewDetails/>
            },
            {
                path: '/booking-info',
                element: <Booking/>
            },
            {
                path: "/payment/successful/:tran_id",
                element: <PaymentSuccess />,
            },
            {
                path: "/payment/failed",
                element: <PaymentFail />
            },
        ]
    },
    ...DashboardRoutes
])

export default router;