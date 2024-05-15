import React from "react";

import { format, parseISO, formatISO, formatDistance, differenceInHours } from 'date-fns'

import Grid from '@mui/material/Grid';

import BatteryStdOutlinedIcon from '@mui/icons-material/BatteryStdOutlined';
import BatteryIcon from './BatteryIcon';
import  SensorCard from "./SensorCard";



import Tooltip from '@mui/material/Tooltip';

import { useTheme } from "@emotion/react";
import { Typography } from "@mui/material";


let backgroundColor;
const width = '150px';

const WidgetBATTERY = props => {

  const { data, meta } = props;

  const theme = useTheme();
  
//  console.log('WidgetBATTERY',props)

  if (!data)
    return  <SensorCard backgroundColor={backgroundColor} width={width} ></SensorCard>;
  
  // darken card if more than 1h passed since wifi event received
  if (differenceInHours( new Date(),data.dtCrt ) > 1 ) {
    backgroundColor = theme.palette.grey[800];
  } else  {
    backgroundColor = theme.palette.grey[700];
  }

//  console.log('WidgetBATTERY data',data)

  let percent = Math.floor((data.upsV - 6)/2.4*100);
  if (percent < 0)
    percent = 0;

  const outOfRange = (percent < meta.vmin) || (percent > meta.vmax);

  return (
    <>

        <SensorCard outofrange={+outOfRange} backgroundColor={backgroundColor} width={width} container item >
          
          {data && <>
            <Grid container item flexDirection="row" >

              <Grid item container xs="auto"  alignContent="center"  >
                <BatteryIcon percent={percent} charging={(data.upsC>0)} />
              </Grid>
              <Grid item container xs justifyContent="center" alignContent="center"   >
                <Typography>
                 {percent}% ({data.upsV} v)
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



export default WidgetBATTERY;
