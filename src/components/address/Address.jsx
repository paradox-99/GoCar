import { Autocomplete, TextField } from '@mui/material';
import { useState } from 'react';
import { district, upazillas, keyArea } from './locationData';
import PropTypes from 'prop-types';

const Address = ({ getAddress }) => {

    const [districtValue, setDistrictValue] = useState("")
    const [upazillasValue, setUpazillasValue] = useState("")
    const [areaValue, setAreaValue] = useState("")
    const [area, setArea] = useState("");
    const [visible, setVisible] = useState(false)

    const setAddress = (upa, ar) => {
        const address = {
            district: districtValue,
            upazilla: upa,
            area: ar
        }
        getAddress(address);
    }

    return (
        <div className='mt-4 flex gap-3 w-full'>
            <Autocomplete
                disablePortal
                options={district}
                onChange={(event, newValue) => {
                    setDistrictValue(newValue?.label);
                    setUpazillasValue('');
                }}
                // value={districtValue}
                fullWidth
                renderInput={(params) => <TextField {...params} label="District" size='small' fullWidth sx={{minWidth: "200px"}} required/>}
            />
            <Autocomplete
                disablePortal
                options={upazillas}
                onChange={(event, newValue) => {
                    setUpazillasValue(newValue?.label);
                    if (newValue?.label === "Dhaka North") {
                        setArea(keyArea['Dhaka North'])
                        setVisible(true)
                        setAreaValue('')
                    }
                    else if (newValue?.label === "Dhaka South") {
                        setArea(keyArea['Dhaka South'])
                        setVisible(true)
                        setAreaValue('')
                    }
                    else {
                        setArea("")
                        setVisible(false)
                        setAreaValue('')
                    }
                    setAddress(newValue?.label, '')
                }}
                // value={upazillasValue}
                disabled={!districtValue}
                fullWidth
                sx={{minWidth: "200px"}}
                renderInput={(params) => <TextField {...params} label="Upazillas/City" size='small' />}
            />
            {
                visible &&
                <Autocomplete
                    disablePortal
                    options={area}
                    onChange={(event, newValue) => {
                        setAreaValue(newValue);
                        setAddress(upazillasValue, newValue || '')

                    }}
                    // value={areaValue}
                    fullWidth
                    sx={{minWidth: "200px"}}
                    renderInput={(params) => <TextField {...params} label="Area" size='small' />}
                />
            }
        </div>
    );
};

Address.propTypes = {
    getAddress: PropTypes.func,
}

export default Address;