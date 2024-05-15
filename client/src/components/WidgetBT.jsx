import React from "react";
import Grid from '@mui/material/Grid';

import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';

import Tooltip from '@mui/material/Tooltip';

import { useTheme } from "@emotion/react";
import { Typography } from "@mui/material";

import  SensorCard from "./SensorCard";

let lastValidData = {}, visData = {};
let backgroundColor;
const width = '140px';

const WidgetBT = props => {

  const { data, meta } = props;

  const theme = useTheme();
  
// console.log('WidgetBT',props);

  // if there is no data, store/show last valid
  if (!data) {
    visData = lastValidData[meta.i];
    backgroundColor = theme.palette.grey[800];
  } else  {
    lastValidData[meta.i] = data;
    visData = data;
    backgroundColor = theme.palette.grey[700];
  }

//  console.log('WidgetBT visData',visData)

  if (!visData)
    return <SensorCard backgroundColor={backgroundColor} width={width} ></SensorCard>;
  

  // check range to show red triangle if out of range
  const outOfRange = (visData.t < meta.vmin) || (visData.t > meta.vmax);


  return (
    <>

      <SensorCard outofrange={+outOfRange} backgroundColor={backgroundColor} width={width} container item >
        {visData && <>
          <Grid container item flexDirection="row" >

            <Grid item container  xs="auto"  alignContent="center"  >
              <Tooltip title={JSON.stringify(data) + JSON.stringify(meta)}><DeviceThermostatIcon /></Tooltip>
            </Grid>
            <Grid item container xs justifyContent="center" alignContent="center"  >
              <Typography>
              {Math.floor(visData.t)}&deg;C / {visData.h}%
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


export default WidgetBT;
