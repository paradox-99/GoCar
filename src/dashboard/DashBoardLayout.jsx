import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { Box, Button, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, styled } from '@mui/material';
import { Add, Logout, ReportOutlined, ReviewsOutlined } from '@mui/icons-material';
import { SiBmcsoftware } from "react-icons/si";
import { FaUsersGear } from "react-icons/fa6";
import { BiSolidCoupon } from "react-icons/bi";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";
import { FaHome, FaUser, FaUsers } from "react-icons/fa";
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { HiMenu } from "react-icons/hi";
import useRole from '../hooks/useRole';
import { FaListAlt } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import { IoCarSport } from "react-icons/io5";
import addCar from "../assets/icons/add_car.png";
import { FaRegCalendarCheck } from "react-icons/fa";
import { LuCalendarClock } from "react-icons/lu";
import { BsShop } from "react-icons/bs";
import { HiCurrencyBangladeshi } from "react-icons/hi";

const DashBoardLayout = () => {

     const { logOut } = useAuth();
     const [open, setOpen] = useState(false);
     const data = useRole();
     const designation = data?.userrole;
     const location = useLocation();
     const navigate = useNavigate();

     const toggleDrawer = (newOpen) => () => {
          setOpen(newOpen);
     };

     const isActive = (path) => {
          return location.pathname === path;
     };

     const handleNavigation = (path) => {
          navigate(path);
     };

     const ListNav = styled(ListItemButton)({
          '&.active': {
               backgroundColor: '#5b5b5b',
               color: 'white'
          },
          '&:hover': {
               backgroundColor: '#5b5b5b'
          }
     })

     const userRoutes = (
          <List component="nav" aria-label="main mailbox folders">
               <ListItem disablePadding>
                    <ListNav onClick={() => handleNavigation('/dashboard')} className={isActive('/dashboard') ? 'active' : ''}>
                         <ListItemIcon style={{ fontSize: 20 }}>
                              <TbLayoutDashboardFilled color='white' />
                         </ListItemIcon>
                         <ListItemText primary="Dashboard" />
                    </ListNav>
               </ListItem>
               <ListItem disablePadding>
                    <ListNav onClick={() => handleNavigation('/dashboard/myprofile')} className={isActive('/dashboard/myprofile') ? 'active' : ''}>
                         <ListItemIcon style={{ fontSize: 20 }}>
                              <FaUser color='white' />
                         </ListItemIcon>
                         <ListItemText primary="My Profile" />
                    </ListNav>
               </ListItem>
               <ListItem disablePadding>
                    <ListNav onClick={() => handleNavigation('/dashboard/user/bookings')} className={isActive('/dashboard/user/bookings') ? 'active' : ''}>
                         <ListItemIcon style={{ fontSize: 20 }}>
                              <FaListAlt color='white' />
                         </ListItemIcon>
                         <ListItemText primary="Bookings" />
                    </ListNav>
               </ListItem>
               <ListItem disablePadding>
                    <ListNav onClick={() => handleNavigation('/dashboard/my-cart')} className={isActive('/dashboard/my-cart') ? 'active' : ''}>
                         <ListItemIcon style={{ fontSize: 20 }}>
                              <FaCartShopping className='text-white' />
                         </ListItemIcon>
                         <ListItemText primary="Favourite List" />
                    </ListNav>
               </ListItem>
          </List>
     );

     const adminRoutes = (
          <List component="nav" aria-label="main mailbox folders">
               <ListItem disablePadding>
                    <ListNav onClick={() => handleNavigation('/dashboard/admin')} className={isActive('/dashboard/admin') ? 'active' : ''}>
                         <ListItemIcon style={{ fontSize: 20 }}>
                              <TbLayoutDashboardFilled className='text-white'/>
                         </ListItemIcon>
                         <ListItemText primary="Dashboard" />
                    </ListNav>
               </ListItem>
               <ListItem disablePadding>
                    <ListNav onClick={() => handleNavigation('/dashboard/admin-profile')} className={isActive('/dashboard/admin-profile') ? 'active' : ''}>
                         <ListItemIcon style={{ fontSize: 20 }}>
                              <FaUser color='white' />
                         </ListItemIcon>
                         <ListItemText primary="Profile" />
                    </ListNav>
               </ListItem>
               <ListItem disablePadding>
                    <ListNav onClick={() => handleNavigation('/dashboard/admin/users')} className={isActive('/dashboard/admin/users') ? 'active' : ''}>
                         <ListItemIcon style={{ fontSize: 20 }}>
                         <FaUsers className='text-white' />
                         </ListItemIcon>
                         <ListItemText primary="Users" />
                    </ListNav>
               </ListItem>
               <ListItem disablePadding>
                    <ListNav onClick={() => handleNavigation('/dashboard/admin/vehicles')} className={isActive('/dashboard/admin/vehicles') ? 'active' : ''}>
                         <ListItemIcon style={{ fontSize: 20 }}>
                         <IoCarSport className='text-white' />
                         </ListItemIcon>
                         <ListItemText primary="Vehicles" />
                    </ListNav>
               </ListItem>
               <ListItem disablePadding>
                    <ListNav onClick={() => handleNavigation('/dashboard/admin/bookings')} className={isActive('/dashboard/admin/bookings') ? 'active' : ''}>
                         <ListItemIcon style={{ fontSize: 20 }}>
                              <LuCalendarClock className='text-white' />
                         </ListItemIcon>
                         <ListItemText primary="Bookings" />
                    </ListNav>
               </ListItem>
               <ListItem disablePadding>
                    <ListNav onClick={() => handleNavigation('/dashboard/admin/payment-history')} className={isActive('/dashboard/admin/payment-history') ? 'active' : ''}>
                         <ListItemIcon style={{ fontSize: 20 }}>
                              <HiCurrencyBangladeshi className='text-white' />
                         </ListItemIcon>
                         <ListItemText primary="Payment History" />
                    </ListNav>
               </ListItem>
          </List>
     )

     const agencyRoutes = (
          <List component="nav" aria-label="main mailbox folders">
               <ListItem disablePadding>
                    <ListNav onClick={() => handleNavigation('/dashboard/agency')} className={isActive('/dashboard/agency') ? 'active' : ''}>
                         <ListItemIcon style={{ fontSize: 20 }}>
                              <TbLayoutDashboardFilled className='text-white' />
                         </ListItemIcon>
                         <ListItemText primary="Dashboard" />
                    </ListNav>
               </ListItem>
               <ListItem disablePadding>
                    <ListNav onClick={() => handleNavigation('/dashboard/agency/profile')} className={isActive('/dashboard/agency/owner-profile') ? 'active' : ''}>
                         <ListItemIcon style={{ fontSize: 20 }}>
                              <FaUser className='text-white w-5' />
                         </ListItemIcon>
                         <ListItemText primary="Profile" />
                    </ListNav>
               </ListItem>
               <ListItem disablePadding>
                    <ListNav onClick={() => handleNavigation('/dashboard/agency/vehicles')} className={isActive('/dashboard/agency/cars') ? 'active' : ''}>
                         <ListItemIcon style={{ fontSize: 20 }}>
                              <IoCarSport className='text-white' />
                         </ListItemIcon>
                         <ListItemText primary="Vehicles" />
                    </ListNav>
               </ListItem>
               <ListItem disablePadding>
                    <ListNav onClick={() => handleNavigation('/dashboard/agency/add-cars')} className={isActive('/dashboard/agency/add-cars') ? 'active' : ''}>
                         <ListItemIcon style={{ fontSize: 20 }}>
                              <img src={addCar} alt="" className='w-6'/>
                         </ListItemIcon>
                         <ListItemText primary="Add Vehicle" />
                    </ListNav>
               </ListItem>
               <ListItem disablePadding>
                    <ListNav onClick={() => handleNavigation('/dashboard/agency/active-bookings')} className={isActive('/dashboard/agency/active-bookings') ? 'active' : ''}>
                         <ListItemIcon style={{ fontSize: 20 }}>
                              <FaRegCalendarCheck className='text-white'/>
                         </ListItemIcon>
                         <ListItemText primary="Active Booking" />
                    </ListNav>
               </ListItem>
          </List>
     )

     const DrawerList = (
          <Box sx={{ width: '100%', maxWidth: 360, bgcolor: '#FE654F' }}>
               <div className="flex justify-center flex-col items-center my-10">
                    <figure>
                         <img src="/favicon.png" alt="" />
                    </figure>
                    <h1 className="text-2xl md:text-3xl font-bold mt-5">NexGenNexus</h1>
               </div>
               <nav aria-label="main mailbox folders">
                    <List>
                         {designation === 'user' && <>
                              <ListItem disablePadding>
                                   <ListItemButton href="/dashboard/myprofile">
                                        <ListItemIcon style={{ fontSize: 20 }}>
                                             <CgProfile />
                                        </ListItemIcon>
                                        <ListItemText primary="My Profile" />
                                   </ListItemButton>
                              </ListItem>
                              <ListItem disablePadding>
                                   <ListItemButton href="/dashboard/addProducts">
                                        <ListItemIcon style={{ fontSize: 20 }}>
                                             <Add />
                                        </ListItemIcon>
                                        <ListItemText primary="Add Products" />
                                   </ListItemButton>
                              </ListItem>
                              <ListItem disablePadding>
                                   <ListItemButton href="/dashboard/myProducts">
                                        <ListItemIcon style={{ fontSize: 20 }}>
                                             <SiBmcsoftware />
                                        </ListItemIcon>
                                        <ListItemText primary="My Products" />
                                   </ListItemButton>
                              </ListItem>
                         </>}
                         {designation === 'moderator' && <>
                              <ListItem disablePadding>
                                   <ListItemButton href="/dashboard/productsReview">
                                        <ListItemIcon style={{ fontSize: 20 }}>
                                             <ReviewsOutlined />
                                        </ListItemIcon>
                                        <ListItemText primary="Review Products" />
                                   </ListItemButton>
                              </ListItem>
                              <ListItem disablePadding>
                                   <ListItemButton href="/dashboard/reportedContents">
                                        <ListItemIcon style={{ fontSize: 20 }}>
                                             <ReportOutlined />
                                        </ListItemIcon>
                                        <ListItemText primary="Reported Products" />
                                   </ListItemButton>
                              </ListItem>
                         </>}
                         {designation === 'admin' && <>
                              <ListItem disablePadding>
                                   <ListItemButton href="/dashboard/adminDashboard">
                                        <ListItemIcon style={{ fontSize: 20 }}>
                                             <TbLayoutDashboardFilled />
                                        </ListItemIcon>
                                        <ListItemText primary="Dashboard" />
                                   </ListItemButton>
                              </ListItem>
                              <ListItem disablePadding>
                                   <ListItemButton href="/dashboard/manageUsers">
                                        <ListItemIcon style={{ fontSize: 20 }}>
                                             <FaUsersGear />
                                        </ListItemIcon>
                                        <ListItemText primary="Manage Users" />
                                   </ListItemButton>
                              </ListItem>
                              <ListItem disablePadding>
                                   <ListItemButton href="/dashboard/manageCoupons">
                                        <ListItemIcon style={{ fontSize: 20 }}>
                                             <BiSolidCoupon />
                                        </ListItemIcon>
                                        <ListItemText primary="Manage Coupons" />
                                   </ListItemButton>
                              </ListItem>
                         </>}
                    </List>
               </nav>
               <Divider />
               <nav aria-label="secondary mailbox folders">
                    <List>
                         <ListItem disablePadding>
                              <ListItemButton href="/">
                                   <ListItemIcon>
                                        <FaHome />
                                   </ListItemIcon>
                                   <ListItemText primary="Home" />
                              </ListItemButton>
                         </ListItem>
                         <ListItem disablePadding>
                              <ListItemButton href="/products">
                                   <ListItemIcon>
                                        <SiBmcsoftware />
                                   </ListItemIcon>
                                   <ListItemText primary="Products" />
                              </ListItemButton>
                         </ListItem>
                    </List>
               </nav>
               <nav aria-label="main mailbox folders" >
                    <List>
                         <ListItem disablePadding>
                              <ListItemButton onClick={logOut} href="/signin">
                                   <ListItemIcon>
                                        <Logout />
                                   </ListItemIcon>
                                   <ListItemText primary="Sign out" />
                              </ListItemButton>
                         </ListItem>
                    </List>
               </nav>
          </Box>
     )

     return (
          <div className="flex relative">
               <div className="w-[17%] fixed inset-y-0 left-0 z-40 bg-[#313131] lg:flex flex-col gap-10 hidden max-h-screen">
                    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: '#313131', color: 'white' }}>
                         <div className="flex justify-center flex-col items-center my-6">
                              <figure>
                                   <img src="/logo.gif" alt="" className='w-20' />
                              </figure>
                              <h1 className="text-white text-4xl font-bold  text-center">go<span className="text-primary">Car</span></h1>
                         </div>
                         <nav aria-label="main mailbox folders">
                              {designation === 'user' && userRoutes}
                              {designation === 'admin' && adminRoutes}
                              {designation === 'agency' && agencyRoutes}
                         </nav>
                         <nav className="absolute bottom-0 w-full" aria-label="main mailbox folders">
                              <List component="nav" aria-label="main mailbox folders">
                                   <ListItem disablePadding>
                                        <ListNav onClick={() => handleNavigation('/')} className={isActive('/') ? 'active' : ''}>
                                             <ListItemIcon>
                                                  <FaHome className='text-white' />
                                             </ListItemIcon>
                                             <ListItemText primary="Home" />
                                        </ListNav>
                                   </ListItem>
                                   
                                   <ListItem disablePadding>
                                        <ListNav onClick={() => { logOut(); handleNavigation('/sign-in'); }}>
                                             <ListItemIcon>
                                                  <Logout className='text-white' />
                                             </ListItemIcon>
                                             <ListItemText primary="Sign out" />
                                        </ListNav>
                                   </ListItem>
                              </List>
                         </nav>
                    </Box>
               </div>
               <div className="flex flex-col lg:hidden font-poppins">
                    <Button onClick={toggleDrawer(true)} style={{ fontSize: 24, color: "black", paddingLeft: 0, paddingRight: 0, minWidth: 24, height: 'fit' }}><HiMenu /></Button>
                    <Drawer open={open} onClose={toggleDrawer(false)}>
                         {DrawerList}
                    </Drawer>
               </div>
               <div className="w-[83%] absolute right-0 h-screen">
                    <Outlet></Outlet>
               </div>
          </div>
     );
};

export default DashBoardLayout;