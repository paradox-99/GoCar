import { Box, CardContent, CardMedia, Typography } from "@mui/material";
import PropTypes from "prop-types";

const AgencyCard = ({ agency }) => {

     const { agency_id, agency_Name, image, total_vehicles, agency_email} = agency

     return (
          <div className='flex  border rounded-xl lg:w-[35%] mx-auto shadow-xl px-5 py-2 items-center justify-between hover:scale-102 duration-500 cursor-pointer border-primary'
               // onClick={() => gotoDetails(agency.agency_id)}
               >
               <Box sx={{ display: 'flex', flexDirection: 'column' }}>

                    <CardContent sx={{ flex: '1 0 auto' }}>

                         <Typography component="div" variant="p">
                              Agency Name: {agency_Name}
                         </Typography>
                         <Typography
                              variant="subtitle1"
                              component="div"
                              sx={{ color: 'text.secondary' }}
                         >
                         </Typography>
                    </CardContent>

                    <CardContent sx={{ flex: '1 0 auto' }}>

                         <Typography component="div" variant="p">
                              Agency Id: {agency_id}
                         </Typography>
                         <Typography
                              variant="subtitle1"
                              component="div"
                              sx={{ color: 'text.secondary' }}
                         >
                         </Typography>
                    </CardContent>

                    <CardContent sx={{ flex: '1 0 auto' }}>

                         <Typography component="div" variant="p">
                              No of Vehicle: {total_vehicles}
                         </Typography>
                         <Typography
                              variant="subtitle1"
                              component="div"
                              sx={{ color: 'text.secondary' }}
                         >
                         </Typography>
                    </CardContent>

                    <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>

                    </Box>
               </Box>
               <div className='h-36 w-36 rounded-full overflow-hidden border border-primary'>
                    <CardMedia
                         component="img"
                         sx={{ width: 151 }}
                         image={image}
                         alt="Live from space album cover"

                    />
               </div>
          </div>
     );
};

AgencyCard.propTypes = {
     agency: PropTypes.object.isRequired,
}

export default AgencyCard;