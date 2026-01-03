import DashBoardLayout from "../dashboard/DashBoardLayout";
import DashBoard from "../dashboard/user/DashBoard";
import MyProfile from "../dashboard/user/MyProfile";
import AdminDashboard from "../dashboard/admin/AdminDashboard";
import AdminProfile from "../dashboard/admin/AdminProfile";
import AgencyDashboard from "../dashboard/agency/AgencyDashboard";
import AgencyProfile from "../dashboard/agency/AgencyProfile";
import FavouriteCars from "../dashboard/user/FavouriteCars";
import UserBookings from "../dashboard/user/UserBookings";
import BookingDetails from "../dashboard/user/BookingDetails";
import Users from "../dashboard/admin/Users";
import Vehicles from "../dashboard/admin/Vehicles";
import Bookings from "../dashboard/admin/Bookings";
import PaymentHistory from "../dashboard/admin/PaymentHistory";
import OwnerProfile from "../dashboard/agency/OwnerProfile";
import AgencyCars from "../dashboard/agency/AgencyCars";
import AddCars from "../dashboard/agency/AddCars";
import ActiveBookings from "../dashboard/agency/ActiveBookings";

export const DashboardRoutes = [
     {
          path: '/dashboard',
          element: <DashBoardLayout />,
          children: [
               {
                    path: '/dashboard',
                    element: <DashBoard></DashBoard>
               },
               {
                    path: '/dashboard/myprofile',
                    element: <MyProfile></MyProfile>
               },
               {
                    path: '/dashboard/my-cart',
                    element: <FavouriteCars />
               },
               {
                    path: '/dashboard/user/bookings',
                    element: <UserBookings></UserBookings>
               },
               {
                    path: '/dashboard/user/bookings/:id',
                    element: <BookingDetails></BookingDetails>
               },

               // agency routes
               {
                    path: '/dashboard/agency',
                    element: <AgencyDashboard />
               },
               {
                    path: '/dashboard/agency/profile',
                    element: <OwnerProfile></OwnerProfile>
               },
               {
                    path: '/dashboard/agency/vehicles',
                    element: <AgencyCars/>
               },
               {
                    path: '/dashboard/agency/add-cars',
                    element: <AddCars />
               },
               {
                    path: '/dashboard/agency/active-bookings',
                    element: <ActiveBookings />
               },


               // admin routes
               {
                    path: '/dashboard/admin',
                    element: <AdminDashboard></AdminDashboard>
               },
               {
                    path: '/dashboard/admin-profile',
                    element: <AdminProfile></AdminProfile>
               },
               {
                    path: '/dashboard/admin/users',
                    element: <Users></Users>
               },
               {
                    path: '/dashboard/admin/vehicles',
                    element: <Vehicles></Vehicles>
               },
               {
                    path: '/dashboard/admin/bookings',
                    element: <Bookings></Bookings>
               },
               {
                    path: '/dashboard/admin/payment-history',
                    element: <PaymentHistory></PaymentHistory>
               }

          ]
     }
]