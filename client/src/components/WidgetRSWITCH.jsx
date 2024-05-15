import React from "react";

import { format, parseISO, formatISO, formatDistance, differenceInHours } from 'date-fns'


import Grid from '@mui/material/Grid';

//import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import SensorDoorOutlinedIcon from '@mui/icons-material/SensorDoorOutlined';
import  SensorCard from "./SensorCard";

import Tooltip from '@mui/material/Tooltip';

import { useTheme } from "@emotion/react";
import { Typography } from "@mui/material";

let backgroundColor;
const width = '130px';

const WidgetRSWITCH = props => {

  const { data, meta } = props;

  const theme = useTheme();
  
//  console.log('WidgetRSWITCH',props)


  if (!data)
    return  <SensorCard backgroundColor={backgroundColor} width={width} ></SensorCard>;
  


//  console.log('WidgetRSWITCH visData',data)


  const timePassed = formatDistance(data.dtCrt, new Date(), {
    includeSeconds: false,
    addSuffix: true,
  });

// check if rswitch was detected recently to show red triangle
  const outOfRange = differenceInHours( new Date(),data.dtCrt ) < 1 ;

  return (
    <>

        <SensorCard outofrange={+outOfRange} backgroundColor={theme.palette.grey[700]} width={width} container item >
          
          {data && <>
            <Grid container item flexDirection="row" >

              <Grid item container xs="auto"  alignContent="center"  >
                <Tooltip title={JSON.stringify(data) + JSON.stringify(meta)}><SensorDoorOutlinedIcon /></Tooltip>
              </Grid>
              <Grid item container xs justifyContent="center" alignContent="center" sx={{textAlign:'center', overflowX: 'hidden', whiteSpace:'nowrap'}}  >
                <Typography sx={{fontSize:'12px'}}>
                {timePassed}
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



export default WidgetRSWITCH;
