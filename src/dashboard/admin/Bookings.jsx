import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { FirstPage, KeyboardArrowLeft, KeyboardArrowRight, LastPage } from '@mui/icons-material';
import { Box, IconButton, Paper, styled, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableFooter, TableHead, TablePagination, TableRow } from '@mui/material';
import { useTheme } from '@emotion/react';
import { useState } from 'react';

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

const Bookings = () => {

     const axiosPublic = useAxiosPublic()

     const { data } = useQuery({
          queryKey: ['bookings'],
          queryFn: async () => {
               const response = await axiosPublic.get(`agencyRoutes/getAllBookings`);
               return response.data;
               },
     })

     const [page, setPage] = useState(0);
     const [rowsPerPage, setRowsPerPage] = useState(8);

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
               <h1 className="text-4xl text-center mt-8 font-semibold">Booking Information&rsquo;s</h1>
               <div className="mt-10 pb-10">
                    {data ?
                         <TableContainer component={Paper}>
                              <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
                                   <TableHead>
                                        <TableRow>
                                             <StyledTableCell >User Name</StyledTableCell>
                                             <StyledTableCell >Email</StyledTableCell>
                                             <StyledTableCell >Vehicle</StyledTableCell>
                                             <StyledTableCell >Agency</StyledTableCell>
                                             <StyledTableCell >From</StyledTableCell>
                                             <StyledTableCell >To</StyledTableCell>
                                             <StyledTableCell >Price</StyledTableCell>
                                             <StyledTableCell >Total Hours</StyledTableCell>
                                        </TableRow>
                                   </TableHead>
                                   <TableBody>
                                        {(rowsPerPage > 0
                                             ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                             : data
                                        ).map((row) => (
                                             <TableRow key={row.donor_id}>
                                                  <StyledTableCell>{row.name}</StyledTableCell>
                                                  <StyledTableCell>{row.email}</StyledTableCell>
                                                  <StyledTableCell>{row.brand} {row.model}</StyledTableCell>
                                                  <StyledTableCell>{row.agency_Name}</StyledTableCell>
                                                  <StyledTableCell>{row.pickup_date.split('T')[0]}</StyledTableCell>
                                                  <StyledTableCell>{row.dropoff_date.split('T')[0]}</StyledTableCell>
                                                  <StyledTableCell>{row.total_cost}</StyledTableCell>
                                                  <StyledTableCell>{row.total_rent_hours}</StyledTableCell>
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
                         <p className="text-center mt-20">Loading ...</p>
                    }
               </div>
          </div>
     );
};

export default Bookings;