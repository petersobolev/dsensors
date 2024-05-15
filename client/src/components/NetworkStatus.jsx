
import React, { useState, useEffect } from 'react';


import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';

import { useTheme } from "@emotion/react";

const NetworkStatus = ({status}) => {

const theme = useTheme();

return (<>
  {status && <WifiIcon />}
  {!status && <WifiOffIcon />}
</>)
}

export default NetworkStatus;
