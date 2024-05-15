import React, { useState, useCallback, useEffect, useRef } from "react";

import Grid from '@mui/material/Grid';


import { useTheme } from "@emotion/react";


const WidgetDIV = props => {

  const { meta } = props;

  const theme = useTheme();
  
//  console.log('WidgetDIV',props)
  
  

  
  return (
    <>
        
        <Grid container item sx={{border: 'none', paddingTop: '5px', width: '5px', height: '70px', background: `${theme.palette.grey[800]}`  }}  >
          

        </Grid>



    </>
  );
}



export default WidgetDIV;
