import React from "react";

import Grid from '@mui/material/Grid';
import CodeIcon from '@mui/icons-material/Code';
import  SensorCard from "./SensorCard";



import Tooltip from '@mui/material/Tooltip';

import { useTheme } from "@emotion/react";
import { Typography } from "@mui/material";


let backgroundColor;
const width = '80px';

const WidgetDEBUG = props => {

  const { data, meta } = props;

  const theme = useTheme();
  
//  console.log('WidgetDEBUG',props)

  if (!data)
    return  <SensorCard backgroundColor={backgroundColor} width={width} ></SensorCard>;
  

//  console.log('WidgetDEBUG data',data)

  const outOfRange = (data.heap < meta.vmin) || (data.heap > meta.vmax);

  return (
    <>

        <SensorCard outofrange={+outOfRange} backgroundColor={theme.palette.grey[700]} width={width} container item >
          
          {data && <>
            <Grid container item flexDirection="row" >

              <Grid item container xs="auto"  alignContent="center"  >
                <Tooltip title={JSON.stringify(data) + JSON.stringify(meta)}><CodeIcon /></Tooltip>
              </Grid>
              <Grid item container xs justifyContent="center" alignContent="center"   >
                <Typography sx={{fontSize:'12px'}}>
                {data.heap} bytes 
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



export default WidgetDEBUG;
