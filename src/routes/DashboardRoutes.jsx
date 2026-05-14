import DashBoardLayout from "../dashboard/DashBoardLayout";
import DashBoard from "../dashboard/user/DashBoard";
import MyProfile from "../dashboard/user/MyProfile";
import AdminDashboard from "../dashboard/admin/AdminDashboard";
import AdminUserDetail from "../dashboard/admin/AdminUserDetail";
import AdminVehicleDetail from "../dashboard/admin/AdminVehicleDetail";
import Agencies from "../dashboard/admin/Agencies";
import AdminDrivers from "../dashboard/admin/AdminDrivers";
import AdminDriverDetail from "../dashboard/admin/AdminDriverDetail";
import AdminAgencyDetail from "../dashboard/admin/AdminAgencyDetail";
import AgencyDashboard from "../dashboard/agency/AgencyDashboard";
import FavouriteCars from "../dashboard/user/FavouriteCars";
import UserBookings from "../dashboard/user/UserBookings";
import BookingDetails from "../dashboard/user/BookingDetails";
import Users from "../dashboard/admin/Users";
import Vehicles from "../dashboard/admin/Vehicles";
import Bookings from "../dashboard/admin/Bookings";
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
import SubmitReview from "../dashboard/shared/SubmitReview";
import ChatBox from "../dashboard/shared/ChatBox";
import DriverTrips from "../dashboard/driver/DriverTrips";
import DriverTripDetail from "../dashboard/driver/DriverTripDetail";
import DriverPickup from "../dashboard/driver/DriverPickup";
import DriverReturn from "../dashboard/driver/DriverReturn";
import MyReviews from "../dashboard/user/MyReviews";
import ReportDamage from "../dashboard/user/ReportDamage";
import DamageHistory from "../dashboard/user/DamageHistory";
import AgencyDamageReports from "../dashboard/agency/AgencyDamageReports";
import AgencyReviews from "../dashboard/agency/AgencyReviews";
import DriverReviews from "../dashboard/driver/DriverReviews";
import Payments from "../dashboard/admin/Payments";
import AdminReviews from "../dashboard/admin/AdminReviews";
import AdminDamageReports from "../dashboard/admin/AdminDamageReports";
import AdminNotifications from "../dashboard/admin/AdminNotifications";
import AdminAddress from "../dashboard/admin/AdminAddress";
import LicenseApprovals from "../dashboard/admin/LicenseApprovals";
import VerificationQueue from "../dashboard/admin/VerificationQueue";
import ReportsAnalytics from "../dashboard/admin/ReportsAnalytics";
import AdminSettings from "../dashboard/admin/AdminSettings";


export const DashboardRoutes = [
     {
          path: '/dashboard',
          element: <PrivateRoute><DashBoardLayout /></PrivateRoute>,
          children: [
               {
                    path: '/dashboard/user',
                    element: <RoleRoute allowedRoles={['user']}><DashBoard></DashBoard></RoleRoute>
               },
               {
                    path: '/dashboard/user/myprofile',
                    element: <RoleRoute allowedRoles={['user']}><MyProfile></MyProfile></RoleRoute>
               },
               {
                    path: '/dashboard/user/my-cart',
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
               {
                    path: '/dashboard/user/my-bookings',
                    element: <RoleRoute allowedRoles={['user']}><UserBookings /></RoleRoute>
               },
               {
                    path: '/dashboard/user/my-damage-reports',
                    element: <RoleRoute allowedRoles={['user']}><DamageHistory /></RoleRoute>
               },
               {
                    path: '/dashboard/user/my-bookings/:id',
                    element: <RoleRoute allowedRoles={['user', 'agency', 'driver']}><BookingDetails /></RoleRoute>
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
                    path: '/dashboard/report-damage',
                    element: <RoleRoute allowedRoles={['user']}><ReportDamage /></RoleRoute>
               },
               {
                    path: '/dashboard/user/my-reviews',
                    element: <RoleRoute allowedRoles={['user']}><MyReviews /></RoleRoute>
               },
               {
                    path: '/dashboard/user/damage-history',
                    element: <RoleRoute allowedRoles={['user']}><DamageHistory /></RoleRoute>
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
               {
                    path: '/dashboard/agency/damage-reports',
                    element: <RoleRoute allowedRoles={['agency']}><AgencyDamageReports /></RoleRoute>
               },
               {
                    path: '/dashboard/agency/reviews',
                    element: <RoleRoute allowedRoles={['agency']}><AgencyReviews /></RoleRoute>
               },

               // driver routes
               {
                    path: '/dashboard/driver',
                    element: <RoleRoute allowedRoles={['driver']}><DriverDashboard /></RoleRoute>
               },
               {
                    path: '/dashboard/driver/profile',
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
               {
                    path: '/dashboard/driver/reviews',
                    element: <RoleRoute allowedRoles={['driver']}><DriverReviews /></RoleRoute>
               },


               // admin routes
               {
                    path: '/dashboard/admin',
                    element: <RoleRoute allowedRoles={['admin']}><AdminDashboard></AdminDashboard></RoleRoute>
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
                    path: '/dashboard/admin/payments',
                    element: <RoleRoute allowedRoles={['admin']}><Payments></Payments></RoleRoute>
               },
               {
                    path: '/dashboard/admin/reviews',
                    element: <RoleRoute allowedRoles={['admin']}><AdminReviews /></RoleRoute>
               },
               {
                    path: '/dashboard/admin/damage-reports',
                    element: <RoleRoute allowedRoles={['admin']}><AdminDamageReports /></RoleRoute>
               },
               {
                    path: '/dashboard/admin/notifications',
                    element: <RoleRoute allowedRoles={['admin']}><AdminNotifications /></RoleRoute>
               },
               {
                    path: '/dashboard/admin/address',
                    element: <RoleRoute allowedRoles={['admin']}><AdminAddress /></RoleRoute>
               },
               {
                    path: '/dashboard/admin/license-approvals',
                    element: <RoleRoute allowedRoles={['admin']}><LicenseApprovals /></RoleRoute>
               },
               {
                    path: '/dashboard/admin/verification-queue',
                    element: <RoleRoute allowedRoles={['admin']}><VerificationQueue /></RoleRoute>
               },
               {
                    path: '/dashboard/admin/reports',
                    element: <RoleRoute allowedRoles={['admin']}><ReportsAnalytics /></RoleRoute>
               },
               {
                    path: '/dashboard/admin/settings',
                    element: <RoleRoute allowedRoles={['admin']}><AdminSettings /></RoleRoute>
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
                    path: '/dashboard/notifications',
                    element: <Notifications />
               },
               {
                    path: '/dashboard/chat',
                    element: <RoleRoute allowedRoles={['user', 'agency', 'driver']}><ChatBox /></RoleRoute>
               }
          ]
     }
]