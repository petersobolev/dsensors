import React, { useState, useEffect } from 'react';

import { styled } from "@mui/material/styles";
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import  SensorCard from "./SensorCard";
import { format, formatDuration, intervalToDuration, formatDistance, formatDistanceStrict, differenceInMinutes, differenceInSeconds } from 'date-fns'

const TitleCard = props => {

  const { lastData, outOfRange } = props;

  const [currentTime, setCurrentTime] = useState(format(new Date(), "MM/dd/yyyy HH:mm"));

  const timeUpdatePassed = formatDistance(new Date( lastData.dtCrt ), new Date(), { includeSeconds: false, addSuffix: true });
  
  const timeUpdate = format(new Date( lastData.dtCrt ), "MM/dd/yyyy HH:mm");   
  
  const upTime =  formatDuration( intervalToDuration({ start: 0, end: Number(lastData.uptime) }) );   





  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(format(Date.now(), "MM/dd/yyyy HH:mm:ss")), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
            <SensorCard outofrange={+outOfRange} backgroundColor="#505060" width="100%" height="auto" container>
              <Grid xs={12} md={6} item container><Typography sx={{fontSize: '14px'}}>{currentTime} (last update: {timeUpdate}, {timeUpdatePassed})</Typography></Grid>
              <Grid xs={12} md={6} container item  justifyContent={{xs: "flex-start", md: "flex-end"}}><Typography sx={{fontSize: '14px'}}>Last uptime: {upTime}</Typography></Grid>
            </SensorCard>
  )

}

export default TitleCard;
