import DashBoardLayout from "../dashboard/DashBoardLayout";
import DashBoard from "../dashboard/user/DashBoard";
import MyProfile from "../dashboard/user/MyProfile";
import AdminDashboard from "../dashboard/admin/AdminDashboard";
import AdminProfile from "../dashboard/admin/AdminProfile";
import AdminUserDetail from "../dashboard/admin/AdminUserDetail";
import AdminVehicleDetail from "../dashboard/admin/AdminVehicleDetail";
import Agencies from "../dashboard/admin/Agencies";
import AdminDrivers from "../dashboard/admin/AdminDrivers";
import AdminDriverDetail from "../dashboard/admin/AdminDriverDetail";
import AdminAgencyDetail from "../dashboard/admin/AdminAgencyDetail";
import AgencyDashboard from "../dashboard/agency/AgencyDashboard";
import FavouriteCars from "../dashboard/user/FavouriteCars";
import UserBookings from "../dashboard/user/UserBookings";
import UserDamageReports from "../dashboard/user/UserDamageReports";
import BookingDetails from "../dashboard/user/BookingDetails";
import Users from "../dashboard/admin/Users";
import Vehicles from "../dashboard/admin/Vehicles";
import Bookings from "../dashboard/admin/Bookings";
import PaymentHistory from "../dashboard/admin/PaymentHistory";
import OwnerProfile from "../dashboard/agency/OwnerProfile";
import AgencyCars from "../dashboard/agency/AgencyCars";
import AgencyCarDetails from "../dashboard/agency/AgencyCarDetails";
import AddCars from "../dashboard/agency/AddCars";
import ActiveBookings from "../dashboard/agency/ActiveBookings";
import AgencyBookingDetail from "../dashboard/agency/AgencyBookingDetail";
import AgencyDrivers from "../dashboard/agency/AgencyDrivers";
import PrivateRoute from "../private/PrivateRoute";
import RoleRoute from "../private/RoleRoute";
import DriverDashboard from "../dashboard/driver/DriverDashboard";
import DriverProfile from "../dashboard/driver/DriverProfile";
import Notifications from "../dashboard/shared/Notifications";
import TripOps from "../dashboard/shared/TripOps";
import DamageReportForm from "../dashboard/shared/DamageReportForm";
import SubmitReview from "../dashboard/shared/SubmitReview";
import ChatBox from "../dashboard/shared/ChatBox";
import DriverTrips from "../dashboard/driver/DriverTrips";
import DriverTripDetail from "../dashboard/driver/DriverTripDetail";
import DriverPickup from "../dashboard/driver/DriverPickup";
import DriverReturn from "../dashboard/driver/DriverReturn";

export const DashboardRoutes = [
     {
          path: '/dashboard',
          element: <PrivateRoute><DashBoardLayout /></PrivateRoute>,
          children: [
               {
                    path: '/dashboard',
                    element: <RoleRoute allowedRoles={['user']}><DashBoard></DashBoard></RoleRoute>
               },
               {
                    path: '/dashboard/myprofile',
                    element: <RoleRoute allowedRoles={['user']}><MyProfile></MyProfile></RoleRoute>
               },
               {
                    path: '/dashboard/my-cart',
                    element: <RoleRoute allowedRoles={['user']}><FavouriteCars /></RoleRoute>
               },
               {
                    path: '/dashboard/user/bookings',
                    element: <RoleRoute allowedRoles={['user']}><UserBookings></UserBookings></RoleRoute>
               },
               {
                    path: '/dashboard/user/bookings/:id',
                    element: <RoleRoute allowedRoles={['user']}><BookingDetails></BookingDetails></RoleRoute>
               },

               // agency routes
               {
                    path: '/dashboard/agency',
                    element: <RoleRoute allowedRoles={['agency']}><AgencyDashboard /></RoleRoute>
               },
               {
                    path: '/dashboard/agency/profile',
                    element: <RoleRoute allowedRoles={['agency']}><OwnerProfile></OwnerProfile></RoleRoute>
               },
               {
                    path: '/dashboard/agency/vehicles',
                    element: <RoleRoute allowedRoles={['agency']}><AgencyCars/></RoleRoute>
               },
               {
                    path: '/dashboard/agency/vehicles/:id',
                    element: <RoleRoute allowedRoles={['agency']}><AgencyCarDetails /></RoleRoute>
               },
               {
                    path: '/dashboard/agency/add-cars',
                    element: <RoleRoute allowedRoles={['agency']}><AddCars /></RoleRoute>
               },
               {
                    path: '/dashboard/my-bookings',
                    element: <RoleRoute allowedRoles={['user']}><UserBookings /></RoleRoute>
               },
               {
                    path: '/dashboard/my-damage-reports',
                    element: <RoleRoute allowedRoles={['user']}><UserDamageReports /></RoleRoute>
               },
               {
                    path: '/dashboard/my-bookings/:id',
                    element: <RoleRoute allowedRoles={['user', 'agency', 'driver']}><BookingDetails /></RoleRoute>
               },
               {
                    path: '/dashboard/agency/bookings',
                    element: <RoleRoute allowedRoles={['agency']}><ActiveBookings /></RoleRoute>
               },
               {
                    path: '/dashboard/agency/bookings/:id',
                    element: <RoleRoute allowedRoles={['agency']}><AgencyBookingDetail /></RoleRoute>
               },
               {
                    path: '/dashboard/agency/drivers',
                    element: <RoleRoute allowedRoles={['agency']}><AgencyDrivers /></RoleRoute>
               },

               // driver routes
               {
                    path: '/dashboard/driver',
                    element: <RoleRoute allowedRoles={['driver']}><DriverDashboard /></RoleRoute>
               },
               {
                    path: '/dashboard/driver-profile',
                    element: <RoleRoute allowedRoles={['driver']}><DriverProfile /></RoleRoute>
               },
               {
                    path: '/dashboard/driver/trips',
                    element: <RoleRoute allowedRoles={['driver']}><DriverTrips /></RoleRoute>
               },
               {
                    path: '/dashboard/driver/trips/:id',
                    element: <RoleRoute allowedRoles={['driver']}><DriverTripDetail /></RoleRoute>
               },
               {
                    path: '/dashboard/driver/trips/:id/pickup',
                    element: <RoleRoute allowedRoles={['driver']}><DriverPickup /></RoleRoute>
               },
               {
                    path: '/dashboard/driver/trips/:id/return',
                    element: <RoleRoute allowedRoles={['driver']}><DriverReturn /></RoleRoute>
               },


               // admin routes
               {
                    path: '/dashboard/admin',
                    element: <RoleRoute allowedRoles={['admin']}><AdminDashboard></AdminDashboard></RoleRoute>
               },
               {
                    path: '/dashboard/admin-profile',
                    element: <RoleRoute allowedRoles={['admin']}><AdminProfile></AdminProfile></RoleRoute>
               },
               {
                    path: '/dashboard/admin/users',
                    element: <RoleRoute allowedRoles={['admin']}><Users /></RoleRoute>
               },
               {
                    path: '/dashboard/admin/users/:id',
                    element: <RoleRoute allowedRoles={['admin']}><AdminUserDetail /></RoleRoute>
               },
               {
                    path: '/dashboard/admin/vehicles',
                    element: <RoleRoute allowedRoles={['admin']}><Vehicles /></RoleRoute>
               },
               {
                    path: '/dashboard/admin/vehicles/:id',
                    element: <RoleRoute allowedRoles={['admin']}><AdminVehicleDetail /></RoleRoute>
               },
               {
                    path: '/dashboard/admin/agencies',
                    element: <RoleRoute allowedRoles={['admin']}><Agencies /></RoleRoute>
               },
               {
                    path: '/dashboard/admin/agencies/:id',
                    element: <RoleRoute allowedRoles={['admin']}><AdminAgencyDetail /></RoleRoute>
               },
               {
                    path: '/dashboard/admin/drivers',
                    element: <RoleRoute allowedRoles={['admin']}><AdminDrivers /></RoleRoute>
               },
               {
                    path: '/dashboard/admin/drivers/:id',
                    element: <RoleRoute allowedRoles={['admin']}><AdminDriverDetail /></RoleRoute>
               },
               {
                    path: '/dashboard/admin/bookings',
                    element: <RoleRoute allowedRoles={['admin']}><Bookings></Bookings></RoleRoute>
               },
               {
                    path: '/dashboard/admin/payment-history',
                    element: <RoleRoute allowedRoles={['admin']}><PaymentHistory></PaymentHistory></RoleRoute>
               },
               {
                    path: '/dashboard/notificationsDriver',
                    element: <RoleRoute allowedRoles={['driver']}><Notifications /></RoleRoute>
               },
               {
                    path: '/dashboard/notificationsUser',
                    element: <RoleRoute allowedRoles={['user']}><Notifications /></RoleRoute>
               },
               {
                    path: '/dashboard/notificationsAgency',
                    element: <RoleRoute allowedRoles={['agency']}><Notifications /></RoleRoute>
               },
               {
                    path: '/dashboard/user/return-damage',
                    element: <RoleRoute allowedRoles={['user']}><TripOps /></RoleRoute>
               },
               {
                    path: '/dashboard/user/reviews/new',
                    element: <RoleRoute allowedRoles={['user']}><SubmitReview /></RoleRoute>
               },
               {
                    path: '/dashboard/chat',
                    element: <RoleRoute allowedRoles={['user', 'agency', 'driver']}><ChatBox /></RoleRoute>
               },
               {
                    path: '/dashboard/report-damage',
                    element: <PrivateRoute><DamageReportForm /></PrivateRoute>
               }

          ]
     }
]