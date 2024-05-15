
import { styled } from "@mui/material/styles";
import Grid from '@mui/material/Grid';

const SensorCard = styled(Grid)(
  ({ outofrange, backgroundColor, width = '140px', height, theme }) =>`
    flex-grow: 1;
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 5px;
    padding-bottom: 4px;
    min-width: ${width};
    height: ${height ?? '70px'}; 
    background: ${outofrange ? `linear-gradient(225deg, ${theme.palette.error.dark} 10px, ${backgroundColor} 10px )` : backgroundColor};

`);


export default SensorCard;
