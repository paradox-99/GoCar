import { Link } from 'react-router-dom';
import moment from 'moment';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { FirstPage, KeyboardArrowLeft, KeyboardArrowRight, LastPage } from '@mui/icons-material';
import { Box, IconButton, Paper, styled, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableFooter, TableHead, TablePagination, TableRow, Button } from '@mui/material';
import { useTheme } from '@emotion/react';
import { useState } from 'react';
import useRole from '../../hooks/useRole';
import Loader from '../../components/Loader';
import useAuth from '../../hooks/useAuth';

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

const ActiveBookings = () => {

     const axiosPublic = useAxiosPublic();
     const {user} = useAuth();

     const { data, isLoading } = useQuery({
          queryKey: ['bookings'],
          queryFn: async () => {
               const response = await axiosPublic.get(`agencyRoutes/getAgencyBookingsByEmail/${user?.email}`, {withCredentials: true});
               return response.data;
          },
          enabled: !!user?.email
     })

     const [page, setPage] = useState(0);
     const [rowsPerPage, setRowsPerPage] = useState(8);

     if (isLoading) return <div className="flex justify-center items-center py-20"><Loader /></div>;

     // Avoid a layout jump when reaching the last page with empty rows.
     const emptyRows =
          page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data?.length) : 0;

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
          <div>
               <h1 className="text-4xl text-center mt-8 font-semibold">Active Bookings</h1>
               <div className="mt-10 pb-10">
                    {data ?
                         <TableContainer component={Paper}>
                              <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
                                   <TableHead>
                                        <TableRow>
                                             <StyledTableCell >Vehicle</StyledTableCell>
                                             <StyledTableCell >Customer</StyledTableCell>
                                             <StyledTableCell >Pickup Date</StyledTableCell>
                                             <StyledTableCell >Status</StyledTableCell>
                                             <StyledTableCell >Action</StyledTableCell>
                                        </TableRow>
                                   </TableHead>
                                   <TableBody>
                                        {(rowsPerPage > 0
                                             ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                             : data
                                        ).map((row) => (
                                             <TableRow key={row.booking_id}>
                                                  <StyledTableCell component="th" scope="row">
                                                      <div className="font-bold">{row.brand} {row.model}</div>
                                                      <div className="text-xs text-gray-500">ID: {row.booking_id}</div>
                                                  </StyledTableCell>
                                                  <StyledTableCell>{row.user_name}</StyledTableCell>
                                                  <StyledTableCell>{row.start_ts ? moment(row.start_ts).format('DD-MMM-YYYY') : 'N/A'}</StyledTableCell>
                                                  <StyledTableCell>
                                                       <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                            row.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                                            row.status === 'Requested' ? 'bg-yellow-100 text-yellow-700' :
                                                            row.status === 'Running' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'
                                                       }`}>
                                                            {row.status}
                                                       </span>
                                                  </StyledTableCell>
                                                  <StyledTableCell>
                                                      <Button 
                                                          component={Link}
                                                          to={`/dashboard/agency/bookings/${row.booking_id}`}
                                                          state={{ booking: row }}
                                                          variant="outlined" 
                                                          size="small"
                                                          sx={{ color: '#F58300', borderColor: '#F58300', '&:hover': { background: '#F58300', color: '#fff' }}}
                                                      >
                                                          Manage
                                                      </Button>
                                                  </StyledTableCell>
                                             </TableRow>
                                        ))}
                                        {emptyRows > 0 && (
                                             <TableRow style={{ height: 53 * emptyRows }}>
                                                  <TableCell colSpan={6} />
                                             </TableRow>
                                        )}
                                   </TableBody>
                                   <TableFooter>
                                        <TableRow>
                                             <TablePagination
                                                  rowsPerPageOptions={[8]}
                                                  colSpan={3}
                                                  count={data?.length}
                                                  rowsPerPage={rowsPerPage}
                                                  page={page}
                                                  slotProps={{
                                                       select: {
                                                            inputProps: {
                                                                 'aria-label': 'rows per page',
                                                            },
                                                            native: true,
                                                       },
                                                  }}
                                                  onPageChange={handleChangePage}
                                                  onRowsPerPageChange={handleChangeRowsPerPage}
                                                  ActionsComponent={TablePaginationActions}
                                             />
                                        </TableRow>
                                   </TableFooter>
                              </Table>
                         </TableContainer> :
                         <div className="flex justify-center items-center py-20">
                              <Loader />
                         </div>
                    }
               </div>
          </div>
     );
};

export default ActiveBookings;