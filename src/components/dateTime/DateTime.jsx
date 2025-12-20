import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import moment from 'moment';
import { useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';

const DateTime = ({ getTime, time, dis=false }) => {

     const [fromTs, setFromTs] = useState(time?.fromTs);
     const [untilTs, setUntilTs] = useState(time?.untilTs);
     const currentTime = moment();

     const getFromDateAndTime = (e) => {
          const fromTs  = moment(e).format();
          setFromTs(fromTs);
          submit();
     }

     const getUntilDateAndTime = (e) => {
          const untilTs = moment(e).format();
          setUntilTs(untilTs);
          const fromDateTime = moment(fromTs);
          const toDateTime = moment(untilTs);
          const diff = toDateTime.diff(fromDateTime, 'hours');

          if (diff < 10) {
               toast.error("You have to select at least 10 hours");
               e.reset();
               return;
          }
          submit();
     }

     const submit = () => {
          if (fromTs && untilTs) {
               const time = { fromTs, untilTs };
               getTime(time);
          }
     }

     return (
          <div className='mt-2 md:mt-0 flex flex-col md:flex-row gap-3 md:items-center'>
               <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DemoContainer components={['DateTimePicker']}>
                         <DateTimePicker label="From" name='fromDate&Time' onChange={getFromDateAndTime} minDate={currentTime} maxDate={moment(currentTime.clone().add(3, "months"))} disabled={dis ? true:false} defaultValue={time && moment(time.fromTs)} slotProps={{ textField: { size: 'medium', required: true } }} sx={{backgroundColor: 'white'}}/>
                    </DemoContainer>
               </LocalizationProvider>
               <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DemoContainer components={['DateTimePicker']} >
                         <DateTimePicker label="Until" name='untilDate&Time' onChange={getUntilDateAndTime} minDate={currentTime} maxDate={moment(currentTime.clone().add(3, "months"))} disabled={dis ? true:false} defaultValue={time && moment(time.untilTs)} slotProps={{ textField: { size: 'medium', required: true } }} sx={{backgroundColor: 'white'}}/>
                    </DemoContainer>
               </LocalizationProvider>
          </div>
     );
};

DateTime.propTypes = {
     getTime: PropTypes.func,
     time: PropTypes.object,
}

export default DateTime;