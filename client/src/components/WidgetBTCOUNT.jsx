import React from "react";

import Grid from '@mui/material/Grid';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import BatteryStdOutlinedIcon from '@mui/icons-material/BatteryStdOutlined';
import BatteryIcon from './BatteryIcon';
import  SensorCard from "./SensorCard";



import Tooltip from '@mui/material/Tooltip';

import { useTheme } from "@emotion/react";
import { Typography } from "@mui/material";

let lastValidData = {}, data = {};
let backgroundColor;
const width = '150px';

const WidgetBTCOUNT = props => {

  const { data, meta } = props;

  const theme = useTheme();
  
//  console.log('WidgetBTCOUNT',props)

  if (!data)
    return  <SensorCard backgroundColor={backgroundColor} width={width} ></SensorCard>;
  

//  console.log('WidgetBTCOUNT data',data)

  const outOfRange = (data.filter(item => item.valid===1).length < meta.vmin) || (data.filter(item => item.valid===1).length > meta.vmax);

  return (
    <>

        <SensorCard outofrange={+outOfRange} backgroundColor={theme.palette.grey[700]} width={width} container item >
          
          {data && <>
            <Grid container item flexDirection="row" >

              <Grid item container xs="auto"  alignContent="center"  >
                <BluetoothIcon  />
              </Grid>
              <Grid item container xs justifyContent="center" alignContent="center"   >
                <Typography>
                {data.filter(item => item.valid===1).length} / {data.length} 
                </Typography>
              </Grid>

           
            </Grid>

            <Grid container item justifyContent="center">
              
              {meta.name}
            </Grid>
            
          </>}

        </SensorCard>



    </>
  );
}



export default WidgetBTCOUNT;
