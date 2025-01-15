import DashBoardLayout from "../dashboard/DashBoardLayout";
import DashBoard from "../dashboard/user/DashBoard";
import MyProfile from "../dashboard/user/MyProfile";
import AdminDashboard from "../dashboard/admin/AdminDashboard";
import AdminProfile from "../dashboard/admin/AdminProfile";
import Guardians from "../dashboard/admin/Guardians";
import AgencyDashboard from "../dashboard/agency/AgencyDashboard";
import AgencyProfile from "../dashboard/agency/AgencyProfile";

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


               // agency routes
               {
                    path: '/dashboard/agency',
                    element: <AgencyDashboard />
               },
               {
                    path: '/dashboard/agency-profile',
                    element: <AgencyProfile />
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

          ]
     }
]