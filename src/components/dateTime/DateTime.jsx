import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import moment from 'moment';
import { useState } from 'react';
import PropTypes from 'prop-types';

const DateTime = ({getTime, time}) => {

     const [fromDate, setFromDate] = useState(time?.fromDate);
     const [fromTime, setFromTime] = useState(time?.fromTime);
     const [untilDate, setUntilDate] = useState(time?.untilDate);
     const [untilTime, setUntilTime] = useState(time?.untilTime);
     const currentTime = moment();

     const getFromDateAndTime = (e) => {
          const fromDate = e.format('YYYY-MM-DD');
          setFromDate(fromDate);
          const fromTime = e.format('HH:mm');
          setFromTime(fromTime);
          submit();
     }

     const getUntilDateAndTime = (e) => {
          const untilDate = e.format('YYYY-MM-DD');
          setUntilDate(untilDate);
          const untilTime = e.format('HH:mm');
          setUntilTime(untilTime);
          submit();
     }

     const submit = () => {
          if (fromDate && fromTime && untilDate && untilTime) {
               const time = { fromDate, fromTime, untilDate, untilTime };
               getTime(time);
          }
     }

     const FromDate = time?.fromDate + "T" + time?.fromTime
     const UntilDate = time?.untilDate + "T" + time?.untilTime

     return (
          <div className='flex flex-col md:flex-row gap-3 justify-between items-center mt-2'>
               <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DemoContainer components={['DateTimePicker']}>
                         <DateTimePicker label="From" name='fromDate&Time' onChange={getFromDateAndTime} minDate={currentTime} maxDate={moment(currentTime.clone().add(3, "months"))} defaultValue={time && moment(FromDate)} slotProps={{ textField: { size: 'small', fullWidth: true, required:true }}}/>
                    </DemoContainer>
               </LocalizationProvider>
               <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DemoContainer components={['DateTimePicker']} >
                         <DateTimePicker label="Until" name='untilDate&Time' onChange={getUntilDateAndTime} minDate={currentTime} maxDate={moment(currentTime.clone().add(3, "months"))} defaultValue={time && moment(UntilDate)} slotProps={{ textField: { size: 'small', fullWidth: true, required:true }}}/>
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