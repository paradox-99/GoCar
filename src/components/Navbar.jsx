import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { useEffect, useState } from "react";
import { LuSearch } from 'react-icons/lu';
import useAuth from '../hooks/useAuth';
import useRole from '../hooks/useRole';

const pages = [
    { title: 'Home', url: '/' },
    { title: 'Agencies', url: '/agencies' },
    { title: 'Support', url: '/services' }
];

const userDropdown = [
    { title: 'Profile', url: '/dashboard/profile' },
    { title: 'Dashboard', url: '/dashboard' },
];

const adminDropDown = [
    { title: 'Profile', url: '/dashboard/admin-profile' },
    { title: 'Dashboard', url: '/dashboard/admin' },
    { title: 'Notifications', url: '/dashboard/notificationsAdmin' },
]

const agencyDropDown = [
    { title: 'Profile', url: '/dashboard/agency-profile' },
    { title: 'Dashboard', url: '/dashboard/agency' },
    { title: 'Notifications', url: '/dashboard/notificationsAgency' }
]

const driverDropDown = [
    { title: 'Profile', url: '/dashboard/driver-profile' },
    { title: 'Dashboard', url: '/dashboard/driver' },
    { title: 'Notifications', url: '/dashboard/notificationsDriver' },
]

const Navbar = () => {

    const { user, logOut } = useAuth();
    const [previousScrollY, setPreviousScrollY] = useState(0);
    const [showNavbar, setShowNavbar] = useState(true);
    const [shadow, setShadow] = useState(false);
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const data = useRole();
    let dashboard = [''];

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > 50) {
            setShadow(true)
        } else {
            setShadow(false)
        }
        if (currentScrollY > previousScrollY && currentScrollY > 50) {
            setShowNavbar(false);
        } else if (currentScrollY < previousScrollY || currentScrollY < 50) {
            setShowNavbar(true);
        }

        setPreviousScrollY(currentScrollY);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [previousScrollY]);

    if (data?.userRole === 'user') {
        dashboard = userDropdown;
    }
    else if (data?.userRole === 'admin') {
        dashboard = adminDropDown;
    }
    else if (data?.userRole === 'driver') {
        dashboard = driverDropDown;
    }
    else if (data?.userRole === 'agency') {
        dashboard = agencyDropDown;
    }

    // console.log(user);
    

    return (

        <div className={`w-full fixed z-10 bg-white transition-transform duration-200 ${showNavbar ? `translate-y-0 ${shadow ? "shadow-xl" : "bg-white"} ` : '-translate-y-full'}`}>
            <div className='max-w-[1360px] mx-auto'>
                <AppBar position="static" sx={{ background: "white", color: "black", boxShadow: "none" }}>
                    <Container maxWidth="xl" sx={{ paddingLeft: 0, paddingRight: 1 }}>
                        <Toolbar disableGutters>
                            <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} >
                                <img src="/logo.gif" alt="" className='w-14' />
                            </Box>
                            <Typography
                                variant="h4"
                                noWrap
                                component="a"
                                href="/"
                                sx={{
                                    mr: 2,
                                    display: { xs: 'none', md: 'flex' },
                                    fontWeight: 800,
                                    letterSpacing: '.1rem',
                                    color: 'inherit',
                                    textDecoration: 'none',
                                }}
                            >
                                go<span className='text-[#F58300]'>Car</span>
                            </Typography>

                            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                                <IconButton
                                    size="large"
                                    aria-label="account of current user"
                                    aria-controls="menu-appbar"
                                    aria-haspopup="true"
                                    onClick={handleOpenNavMenu}
                                    color="inherit"
                                    sx={{ padding: 1 }}
                                >
                                    <MenuIcon />
                                </IconButton>
                                <Menu
                                    id="menu-appbar"
                                    anchorEl={anchorElNav}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                    open={Boolean(anchorElNav)}
                                    onClose={handleCloseNavMenu}
                                    sx={{ display: { xs: 'block', md: 'none' }, color: "black" }}
                                >
                                    {pages.map((page) => (
                                        <MenuItem key={page.title} onClick={handleCloseNavMenu}>
                                            <Typography sx={{ textAlign: 'center', color: "black" }} component="a" href={page.url}>{page.title}</Typography>
                                        </MenuItem>
                                    ))}
                                    {
                                        !user &&
                                        <MenuItem onClick={handleCloseNavMenu}>
                                            <Typography sx={{ textAlign: 'center', color: "black" }} component="a" href={'/sign-in'}>Login</Typography>
                                        </MenuItem>
                                    }
                                </Menu>
                            </Box>
                            <Box sx={{ display: { xs: 'flex', md: 'none', alignItems: "center" } }} >
                                <img src="/logo.gif" alt="" className='w-10' />
                            </Box>
                            <Typography
                                variant="h6"
                                noWrap
                                component="a"
                                href="/"
                                sx={{
                                    mr: 1,
                                    display: { xs: 'flex', md: 'none' },
                                    flexGrow: 1,
                                    fontWeight: 700,
                                    color: 'inherit',
                                    textDecoration: 'none',
                                    fontSize: 30
                                }}
                            >
                                go<span className='text-[#F58300]'>Car</span>
                            </Typography>
                            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'end' }}>
                                {pages.map((page) => (
                                    <Button
                                        key={page.title}
                                        onClick={handleCloseNavMenu}
                                        href={page.url}
                                        sx={{ my: 2, color: 'black', display: 'block', fontWeight: 600, textTransform: "none", fontSize: 16 }}
                                    >
                                        {page.title}
                                    </Button>
                                ))}
                            </Box>
                            <Box sx={{
                                mr: { md: 3 },
                                ml: { md: 3 }
                            }}>
                                <IconButton>
                                    <LuSearch />
                                </IconButton>
                            </Box>
                            {
                                user &&
                                <Box sx={{ flexGrow: 0, color: "black", ml: 2 }}>
                                    <Tooltip title="Menu">
                                        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                            <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                                        </IconButton>
                                    </Tooltip>
                                    <Menu
                                        sx={{ mt: '45px', color: "black" }}
                                        id="menu-appbar"
                                        anchorEl={anchorElUser}
                                        anchorOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        keepMounted
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        open={Boolean(anchorElUser)}
                                        onClose={handleCloseUserMenu}
                                    >
                                        {dashboard?.map((setting) => (
                                            <MenuItem key={setting.title} onClick={handleCloseUserMenu}>
                                                <Button
                                                    key={setting.title}
                                                    onClick={handleCloseNavMenu}
                                                    href={setting.url}
                                                    sx={{ color: 'black', display: 'block', fontWeight: 600, textTransform: "none", fontSize: 16 }}
                                                >
                                                    {setting.title}
                                                </Button>
                                            </MenuItem>
                                        ))}
                                        <MenuItem onClick={logOut}>
                                        <Button
                                                onClick={handleCloseNavMenu}
                                                sx={{ color: 'black', display: 'block', fontWeight: 600, textTransform: "none", fontSize: 16 }}
                                            >
                                                Logout
                                            </Button>
                                        </MenuItem>
                                    </Menu>
                                </Box>
                            }
                            {
                                !user &&
                                <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                                    <Button
                                        onClick={handleCloseNavMenu}
                                        href={'/sign-in'}
                                        sx={{ my: 2, color: 'white', display: 'block', fontWeight: 700, textTransform: "none", background: '#F58300', fontSize: { xs: 14, md: 16 }, ml: { xs: 0, sm: 2 } }}
                                    >
                                        Sign in
                                    </Button>
                                </Box>
                            }
                        </Toolbar>
                    </Container>
                </AppBar>
            </div>
        </div>

    );
};

export default Navbar;