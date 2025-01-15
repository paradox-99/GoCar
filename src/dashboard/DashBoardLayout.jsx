import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { Box, Button, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, styled } from '@mui/material';
import { Add, Logout, ReportOutlined, ReviewsOutlined } from '@mui/icons-material';
import { SiBmcsoftware } from "react-icons/si";
import { FaUsersGear } from "react-icons/fa6";
import { BiSolidCoupon } from "react-icons/bi";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";
import { FaHome, FaUser } from "react-icons/fa";
import { Outlet } from 'react-router-dom';
import { HiMenu } from "react-icons/hi";
import { IoNotifications } from "react-icons/io5";
import useRole from '../hooks/useRole';
import { FaListAlt } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import { MdRateReview } from "react-icons/md";

const DashBoardLayout = () => {

     const { logOut } = useAuth();
     const [open, setOpen] = useState(false);
     const [selectedIndex, setSelectedIndex] = useState();
     const data = useRole();
     const designation = data?.userRole;

     const toggleDrawer = (newOpen) => () => {
          setOpen(newOpen);
     };

     const handleListItemClick = (event, index) => {
          setSelectedIndex(index);
     };
     const ListNav = styled(ListItemButton)({
          '& .Mui-selected': {

               // backgroundColor: '#ffffff66'
          }
     })

     const userRoutes = (
          <List component="nav" aria-label="main mailbox folders">
               <ListItem disablePadding>
                    <ListNav href="/dashboard"
                         style={{
                              backgroundColor: selectedIndex === 0 && '#ffffff66'
                         }}
                         onClick={(event) => handleListItemClick(event, 0)} >
                         <ListItemIcon style={{ fontSize: 25 }}>
                              <TbLayoutDashboardFilled color='white' />
                         </ListItemIcon>
                         <ListItemText primary="Dashboard" />
                    </ListNav>
               </ListItem>
               <ListItem disablePadding>
                    <ListNav href="/dashboard/myprofile"
                         style={{
                              backgroundColor: selectedIndex === 1 && '#ffffff66'
                         }}
                         onClick={(event) => handleListItemClick(event, 1)}>
                         <ListItemIcon style={{ fontSize: 25 }}>
                              <FaUser color='white' />
                         </ListItemIcon>
                         <ListItemText primary="My Profile" />
                    </ListNav>
               </ListItem>
               <ListItem disablePadding>
                    <ListItemButton href="/dashboard/userProfile"
                         style={{
                              backgroundColor: selectedIndex === 2 && '#ffffff66'
                         }}
                         onClick={(event) => handleListItemClick(event, 2)}>
                         <ListItemIcon style={{ fontSize: 25 }}>
                              <FaListAlt color='white' />
                         </ListItemIcon>
                         <ListItemText primary="Bookings" />
                    </ListItemButton>
               </ListItem>
               <ListItem disablePadding>
                    <ListItemButton href="/dashboard/addProducts" selected={selectedIndex === 3}
                         onClick={(event) => handleListItemClick(event, 3)}>
                         <ListItemIcon style={{ fontSize: 25 }}>
                              <MdRateReview className='text-white' />
                         </ListItemIcon>
                         <ListItemText primary="Reviews" />
                    </ListItemButton>
               </ListItem>
               <ListItem disablePadding>
                    <ListItemButton href="/dashboard/myProducts" selected={selectedIndex === 4}
                         onClick={(event) => handleListItemClick(event, 4)}>
                         <ListItemIcon style={{ fontSize: 25 }}>
                              <FaCartShopping className='text-white' />
                         </ListItemIcon>
                         <ListItemText primary="Cart" />
                    </ListItemButton>
               </ListItem>
               <ListItem disablePadding>
                    <ListItemButton href="/dashboard/myProducts" selected={selectedIndex === 6}
                         onClick={(event) => handleListItemClick(event, 6)}>
                         <ListItemIcon style={{ fontSize: 25 }}>
                              <IoNotifications className='text-white' />
                         </ListItemIcon>
                         <ListItemText primary="Notifications" />
                    </ListItemButton>
               </ListItem>
          </List>
     );

     const adminRoutes = (
          <List component="nav" aria-label="main mailbox folders">
               <ListItem disablePadding>
                    <ListItemButton href="/dashboard/admin" >
                         <ListItemIcon style={{ fontSize: 25 }}>
                              <TbLayoutDashboardFilled />
                         </ListItemIcon>
                         <ListItemText primary="Dashboard" />
                    </ListItemButton>
               </ListItem>
               <ListItem disablePadding>
                    <ListItemButton href="/dashboard/manageUsers">
                         <ListItemIcon style={{ fontSize: 25 }}>
                              <FaUsersGear />
                         </ListItemIcon>
                         <ListItemText primary="Profile" />
                    </ListItemButton>
               </ListItem>
               <ListItem disablePadding>
                    <ListItemButton href="/dashboard/guardians">
                         <ListItemIcon style={{ fontSize: 25 }}>
                              <BiSolidCoupon />
                         </ListItemIcon>
                         <ListItemText primary="Users" />
                    </ListItemButton>
               </ListItem>
               <ListItem disablePadding>
                    <ListItemButton href="/dashboard/manageCoupons">
                         <ListItemIcon style={{ fontSize: 25 }}>
                              <BiSolidCoupon />
                         </ListItemIcon>
                         <ListItemText primary="Residents" />
                    </ListItemButton>
               </ListItem>
               <ListItem disablePadding>
                    <ListItemButton href="/dashboard/manageCoupons">
                         <ListItemIcon style={{ fontSize: 25 }}>
                              <BiSolidCoupon />
                         </ListItemIcon>
                         <ListItemText primary="Circumstances" />
                    </ListItemButton>
               </ListItem>
               <ListItem disablePadding>
                    <ListItemButton href="/dashboard/manageCoupons">
                         <ListItemIcon style={{ fontSize: 25 }}>
                              <BiSolidCoupon />
                         </ListItemIcon>
                         <ListItemText primary="Report Circumstance" />
                    </ListItemButton>
               </ListItem>
               <ListItem disablePadding>
                    <ListItemButton href="/dashboard/manageCoupons">
                         <ListItemIcon style={{ fontSize: 25 }}>
                              <BiSolidCoupon />
                         </ListItemIcon>
                         <ListItemText primary="Packages" />
                    </ListItemButton>
               </ListItem>
          </List>
     )

     const agencyRoutes = (
          <List component="nav" aria-label="main mailbox folders">
               <ListItem disablePadding>
                    <ListItemButton href="/dashboard/admin">
                         <ListItemIcon style={{ fontSize: 25 }}>
                              <TbLayoutDashboardFilled />
                         </ListItemIcon>
                         <ListItemText primary="Dashboard" />
                    </ListItemButton>
               </ListItem>
               <ListItem disablePadding>
                    <ListItemButton href="/dashboard/agency-profile">
                         <ListItemIcon style={{ fontSize: 25 }}>
                              <FaUsersGear />
                         </ListItemIcon>
                         <ListItemText primary="Profile" />
                    </ListItemButton>
               </ListItem>
               <ListItem disablePadding>
                    <ListItemButton href="/dashboard/agency/cars" >
                         <ListItemIcon style={{ fontSize: 25 }}>
                              <BiSolidCoupon />
                         </ListItemIcon>
                         <ListItemText primary="Cars" />
                    </ListItemButton>
               </ListItem>
               <ListItem disablePadding>
                    <ListItemButton href="/dashboard/">
                         <ListItemIcon style={{ fontSize: 25 }}>
                              <BiSolidCoupon />
                         </ListItemIcon>
                         <ListItemText primary="Add Car" />
                    </ListItemButton>
               </ListItem>
               <ListItem disablePadding>
                    <ListItemButton href="/dashboard/manageCoupons">
                         <ListItemIcon style={{ fontSize: 25 }}>
                              <BiSolidCoupon />
                         </ListItemIcon>
                         <ListItemText primary="Active Booking" />
                    </ListItemButton>
               </ListItem>
               <ListItem disablePadding>
                    <ListItemButton href="/dashboard/manageCoupons">
                         <ListItemIcon style={{ fontSize: 25 }}>
                              <BiSolidCoupon />
                         </ListItemIcon>
                         <ListItemText primary="Booking History" />
                    </ListItemButton>
               </ListItem>
               <ListItem disablePadding>
                    <ListItemButton href="/dashboard/manageCoupons" selected={selectedIndex === 13}
                         onClick={(event) => handleListItemClick(event, 13)}>
                         <ListItemIcon style={{ fontSize: 25 }}>
                              <BiSolidCoupon />
                         </ListItemIcon>
                         <ListItemText primary="Packages" />
                    </ListItemButton>
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
                                   <ListItemButton href="/dashboard/userProfile">
                                        <ListItemIcon style={{ fontSize: 25 }}>
                                             <CgProfile />
                                        </ListItemIcon>
                                        <ListItemText primary="My Profile" />
                                   </ListItemButton>
                              </ListItem>
                              <ListItem disablePadding>
                                   <ListItemButton href="/dashboard/addProducts">
                                        <ListItemIcon style={{ fontSize: 25 }}>
                                             <Add />
                                        </ListItemIcon>
                                        <ListItemText primary="Add Products" />
                                   </ListItemButton>
                              </ListItem>
                              <ListItem disablePadding>
                                   <ListItemButton href="/dashboard/myProducts">
                                        <ListItemIcon style={{ fontSize: 25 }}>
                                             <SiBmcsoftware />
                                        </ListItemIcon>
                                        <ListItemText primary="My Products" />
                                   </ListItemButton>
                              </ListItem>
                         </>}
                         {designation === 'moderator' && <>
                              <ListItem disablePadding>
                                   <ListItemButton href="/dashboard/productsReview">
                                        <ListItemIcon style={{ fontSize: 25 }}>
                                             <ReviewsOutlined />
                                        </ListItemIcon>
                                        <ListItemText primary="Review Products" />
                                   </ListItemButton>
                              </ListItem>
                              <ListItem disablePadding>
                                   <ListItemButton href="/dashboard/reportedContents">
                                        <ListItemIcon style={{ fontSize: 25 }}>
                                             <ReportOutlined />
                                        </ListItemIcon>
                                        <ListItemText primary="Reported Products" />
                                   </ListItemButton>
                              </ListItem>
                         </>}
                         {designation === 'admin' && <>
                              <ListItem disablePadding>
                                   <ListItemButton href="/dashboard/adminDashboard">
                                        <ListItemIcon style={{ fontSize: 25 }}>
                                             <TbLayoutDashboardFilled />
                                        </ListItemIcon>
                                        <ListItemText primary="Dashboard" />
                                   </ListItemButton>
                              </ListItem>
                              <ListItem disablePadding>
                                   <ListItemButton href="/dashboard/manageUsers">
                                        <ListItemIcon style={{ fontSize: 25 }}>
                                             <FaUsersGear />
                                        </ListItemIcon>
                                        <ListItemText primary="Manage Users" />
                                   </ListItemButton>
                              </ListItem>
                              <ListItem disablePadding>
                                   <ListItemButton href="/dashboard/manageCoupons">
                                        <ListItemIcon style={{ fontSize: 25 }}>
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
          <div className="flex">
               <div className="w-72 bg-[#313131] lg:flex flex-col gap-10 hidden max-h-screen">
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
                         <nav className="absolute bottom-0" aria-label="main mailbox folders">
                              <List component="nav" aria-label="main mailbox folders">
                                   <ListItem disablePadding>
                                        <ListItemButton href="/">
                                             <ListItemIcon>
                                                  <FaHome className='text-white' />
                                             </ListItemIcon>
                                             <ListItemText primary="Home" />
                                        </ListItemButton>
                                   </ListItem>
                                   <ListItem disablePadding>
                                        <ListItemButton onClick={logOut} href="/sign-in">
                                             <ListItemIcon>
                                                  <Logout className='text-white' />
                                             </ListItemIcon>
                                             <ListItemText primary="Sign out" />
                                        </ListItemButton>
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
               <div className="w-full h-screen px-10">
                    <Outlet></Outlet>
               </div>
          </div>
     );
};

export default DashBoardLayout;