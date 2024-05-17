
import Battery0BarIcon from '@mui/icons-material/Battery0Bar'; // 0%
import Battery1BarIcon from '@mui/icons-material/Battery1Bar'; // 10%
import Battery2BarIcon from '@mui/icons-material/Battery2Bar'; // 20%
import Battery3BarIcon from '@mui/icons-material/Battery3Bar'; // 40%
import Battery4BarIcon from '@mui/icons-material/Battery4Bar'; // 50%
import Battery5BarIcon from '@mui/icons-material/Battery5Bar'; // 70%
import Battery6BarIcon from '@mui/icons-material/Battery6Bar'; // 90%
import BatteryFullIcon from '@mui/icons-material/BatteryFull'; // 100%


import BatteryCharging20Icon from '@mui/icons-material/BatteryCharging20';
import BatteryCharging30Icon from '@mui/icons-material/BatteryCharging30';
import BatteryCharging50Icon from '@mui/icons-material/BatteryCharging50';
import BatteryCharging60Icon from '@mui/icons-material/BatteryCharging60';
import BatteryCharging80Icon from '@mui/icons-material/BatteryCharging80';
import BatteryCharging90Icon from '@mui/icons-material/BatteryCharging90';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';

const BatteryIcon = props => {

  const { percent, charging } = props;


  if (charging) {

    if (percent>95)
      return <BatteryChargingFullIcon />
    else if (percent>90) 
      return <BatteryCharging90Icon />
    else if (percent>70)
      return <BatteryCharging80Icon />
    else if (percent>50)
      return <BatteryCharging60Icon />
    else if (percent>40)
      return <BatteryCharging50Icon />
    else if (percent>20)
      return <BatteryCharging30Icon />
    else
      return <BatteryCharging20Icon />

  } else {

    if (percent>95)
      return <BatteryFullIcon />
    else if (percent>90) 
      return <Battery6BarIcon />
    else if (percent>70)
      return <Battery5BarIcon />
    else if (percent>50)
      return <Battery4BarIcon />
    else if (percent>40)
      return <Battery3BarIcon />
    else if (percent>20)
      return <Battery2BarIcon />
    else if (percent>10)
      return <Battery1BarIcon />
    else
      return <Battery0BarIcon />
  }


    
};


export default BatteryIcon;
