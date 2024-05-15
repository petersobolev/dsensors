import React from "react";


import Grid from '@mui/material/Grid';

import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import  SensorCard from "./SensorCard";



import Tooltip from '@mui/material/Tooltip';

import { useTheme } from "@emotion/react";
import { Typography } from "@mui/material";

let lastValidData = {}, visData = {};
let backgroundColor;
const width = '90px';

const WidgetV = props => {

  const { data, meta } = props;

  const theme = useTheme();
  
//  console.log('WidgetV',props)

 // if there is no data, store/show last valid
  if (!data) {
    visData = lastValidData[meta.i];
    backgroundColor = theme.palette.grey[800];
  } else  {
    lastValidData[meta.i] = data;
    visData = data;
    backgroundColor = theme.palette.grey[700];
  }

//  console.log('WidgetV visData',visData)

  if (!visData)
    return  <SensorCard backgroundColor={backgroundColor} width={width} ></SensorCard>;

  const outOfRange = (visData.v < meta.vmin) || (visData.v > meta.vmax);

  return (
    <>

        <SensorCard outofrange={+outOfRange} backgroundColor={backgroundColor} width={width} container item >
          
          {visData && <>
            <Grid container item flexDirection="row" >

              <Grid item container xs="auto"  alignContent="center"  >
                <Tooltip title={JSON.stringify(data) + JSON.stringify(meta)}><ElectricalServicesIcon /></Tooltip>
              </Grid>
              <Grid item container xs justifyContent="center" alignContent="center"   >
                <Typography>
                {Math.floor(visData.v)} v
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



export default WidgetV;
