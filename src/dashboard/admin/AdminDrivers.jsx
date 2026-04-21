import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Box, IconButton, Paper, styled, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableFooter, TableHead, TablePagination, TableRow, Chip, Avatar } from '@mui/material';
import { FirstPage, KeyboardArrowLeft, KeyboardArrowRight, LastPage, Info } from '@mui/icons-material';
import { useTheme } from '@emotion/react';
import { useState } from 'react';
import PropTypes from 'prop-types';

function TablePaginationActions(props) {
     const theme = useTheme();
     const { count, page, rowsPerPage, onPageChange } = props;

     const handleFirstPageButtonClick = (event) => {
          onPageChange(event, 0);
     };

     const handleBackButtonClick = (event) => {
          onPageChange(event, page - 1);
     };

     const handleNextButtonClick = (event) => {
          onPageChange(event, page + 1);
     };

     const handleLastPageButtonClick = (event) => {
          onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
     };

     return (
          <Box sx={{ flexShrink: 0, ml: 2.5 }}>
               <IconButton
                    onClick={handleFirstPageButtonClick}
                    disabled={page === 0}
                    aria-label="first page"
               >
                    {theme.direction === 'rtl' ? <LastPage /> : <FirstPage />}
               </IconButton>
               <IconButton
                    onClick={handleBackButtonClick}
                    disabled={page === 0}
                    aria-label="previous page"
               >
                    {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
               </IconButton>
               <IconButton
                    onClick={handleNextButtonClick}
                    disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                    aria-label="next page"
               >
                    {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
               </IconButton>
               <IconButton
                    onClick={handleLastPageButtonClick}
                    disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                    aria-label="last page"
               >
                    {theme.direction === 'rtl' ? <FirstPage /> : <LastPage />}
               </IconButton>
          </Box>
     );
}

TablePaginationActions.propTypes = {
     count: PropTypes.number.isRequired,
     onPageChange: PropTypes.func.isRequired,
     page: PropTypes.number.isRequired,
     rowsPerPage: PropTypes.number.isRequired,
};

const AdminDrivers = () => {
    const axiosPublic = useAxiosPublic();
    const { data: drivers, isLoading } = useQuery({
        queryKey: ['admin-all-drivers'],
        queryFn: async () => {
            const response = await axiosPublic.get(`driverRoutes/admin-all-drivers`, { withCredentials: true });
            return response.data;
        },
    });

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(8);

    if (isLoading) return <Box className="text-center mt-20">Loading Drivers ...</Box>;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: "#F58300",
            color: theme.palette.common.white,
            fontSize: 16,
            fontWeight: 600,
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    return (
        <div className="p-6">
            <h1 className="text-4xl text-center mt-4 font-semibold mb-10">All Platform Drivers</h1>
            
            <TableContainer component={Paper} className="shadow-sm rounded-xl overflow-hidden">
                <Table sx={{ minWidth: 500 }}>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Driver</StyledTableCell>
                            <StyledTableCell>Email/Phone</StyledTableCell>
                            <StyledTableCell>Agency</StyledTableCell>
                            <StyledTableCell>Experience</StyledTableCell>
                            <StyledTableCell>Status</StyledTableCell>
                            <StyledTableCell>Action</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(rowsPerPage > 0
                            ? drivers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : drivers
                        ).map((driver) => (
                            <TableRow key={driver.driver_id}>
                                <StyledTableCell component="th" scope="row">
                                    <Box className="flex items-center gap-3">
                                        <Avatar src={driver.photo} />
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">{driver.name}</Typography>
                                            <Typography variant="caption" color="textSecondary">{driver.driver_id}</Typography>
                                        </Box>
                                    </Box>
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Typography variant="body2">{driver.email}</Typography>
                                    <Typography variant="caption" color="textSecondary">{driver.phone}</Typography>
                                </StyledTableCell>
                                <StyledTableCell>{driver.agency_name || 'Independent'}</StyledTableCell>
                                <StyledTableCell>{driver.experience_year} Years</StyledTableCell>
                                <StyledTableCell>
                                    <Chip 
                                        label={driver.verified ? "Verified" : "Pending"} 
                                        color={driver.verified ? "success" : "warning"} 
                                        size="small" 
                                    />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <IconButton 
                                        component={Link} 
                                        to={`/dashboard/admin/drivers/${driver.driver_id}`}
                                        state={{ driver }}
                                        sx={{ color: '#F58300' }}
                                    >
                                        <Info />
                                    </IconButton>
                                </StyledTableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[8]}
                                colSpan={6}
                                count={drivers?.length || 0}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                ActionsComponent={TablePaginationActions}
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </div>
    );
};

export default AdminDrivers;
