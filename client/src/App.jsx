import React, { useState, useReducer } from 'react';
import { useQuery, useLazyQuery, useMutation, gql } from "@apollo/client";

import { format, formatDuration, intervalToDuration, formatDistance, formatDistanceStrict, differenceInMinutes, differenceInSeconds, fromUnixTime, getUnixTime } from 'date-fns'

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';


import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Drawer from '@mui/material/Drawer';
import { useSnackbar } from 'notistack';

import WidgetDIV from './components/WidgetDIV';
import WidgetOT from './components/WidgetOT';
import WidgetBT from './components/WidgetBT';
import WidgetV from './components/WidgetV';

import WidgetMOTION from './components/WidgetMOTION';
import WidgetRSWITCH from './components/WidgetRSWITCH';
import WidgetBATTERY from './components/WidgetBATTERY';
import WidgetBTCOUNT from './components/WidgetBTCOUNT';
import WidgetDEBUG from './components/WidgetDEBUG';

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';

import { NativeSelect } from '@mui/material';

import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';


import NetworkStatus from './components/NetworkStatus';

import  TitleCard from "./components/TitleCard";

import { useTheme } from "@emotion/react";


import Divider from '@mui/material/Divider';


import {
  LineChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

import { LinearProgress } from '@mui/material';

import { getLastQuery, getAllQuery, getAllSrcs, getAllLocs, updateCustomSrcMutation } from "./graphql.gql";



function App() {


  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [lastRows, setlastRows] = useState(60); //10
  const [loc, setLoc] = useState(1);

  
  let defaultValues = {
    period: 0, // 300 sec = 5 min    between requests from device
    reset: 0, // 0 until we want to reset device
    sleep: 0, // 
    relay1: '', // relay 1 off
    relay2: '', // relay 2 off
    loc : loc, // # location
    src: 1 // # device at location
  };

  const [values, setValues] = useReducer(
    (prev, updated) => ({ ...prev, ...updated }),
    defaultValues
  );


  const [openDrawer, setOpenDrawer] = useState(false); //false


  const drawerWidth = 250; //240  
  
  const [auth, setAuth] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  
  const allLocs = useQuery( getAllLocs, { variables: { } } )
  const allSrcs = useQuery( getAllSrcs, { variables: { loc: loc }, onCompleted: data => { 

    setValues({
      period: data.allStSrcs.nodes[0].period, 
      reset:  data.allStSrcs.nodes[0].reset == 1 ? true : false,
      sleep:  data.allStSrcs.nodes[0].sleep == 1 ? true : false, 
      relay1: data.allStSrcs.nodes[0].relay1 == 1 ? true : false, 
      relay2: data.allStSrcs.nodes[0].relay2 == 1 ? true : false,
    }) 
  }, } )

  const lastData = useQuery( getLastQuery, { pollInterval: Math.floor(values.period/2)*1000, variables: { loc: loc } } )
  const allData = useQuery( getAllQuery, { skip: false, pollInterval: Math.floor(values.period/2)*1000, variables: { last: lastRows, loc: loc } } )

  const [updateCustomSrc] = useMutation(updateCustomSrcMutation, { variables: { } });

//  console.log('lastData',lastData);
//  console.log('allData',allData);
//  console.log('allLocs',allLocs);
//  console.log('allSrcs',allSrcs);
//  console.log('allData.data',allData.data);

  if ((allData.loading) || (lastData.loading || allLocs.loading || allSrcs.loading ))
    return <LinearProgress />;

if (lastData.data.allStMains.nodes.length===0) {
  console.log('NO EVENTS, ASK DEVICE TO PUT SOME!');
  return false;
}

//console.log('allData.data.allStMains',allData.data.allStMains);

  const allDataChart = allData.data.allStMains.nodes.map(item => {

    return {
      id: item.id,
//      date: item.wTimeUt,
//      date: new Date(item.dtCrt),
      date: getUnixTime(new Date(item.dtCrt)),
      heap: item.heap,
      count: item.count,
      uptime: item.uptime,
      btFound: item.btFound,
      upsC: item.upsC,
      upsV: item.upsV,
      upsPercent: Math.floor((item.upsV - 6)/2.4*100),
      wRssi: item.wRssi,
      ot0: item.stOtsByMainId.nodes.find(sensor=>sensor.i==0)?.t,
      ot1: item.stOtsByMainId.nodes.find(sensor=>sensor.i==1)?.t,
      ot2: item.stOtsByMainId.nodes.find(sensor=>sensor.i==2)?.t,
      bte0t: item.stBtsByMainId.nodes.find(sensor=>sensor.addr=="a4:c1:38:8f:5e:e0")?.t,
      bta7t: item.stBtsByMainId.nodes.find(sensor=>sensor.addr=="a4:c1:38:43:10:a7")?.t,
      bt19t: item.stBtsByMainId.nodes.find(sensor=>sensor.addr=="a4:c1:38:be:5f:19")?.t,
      bte0h: item.stBtsByMainId.nodes.find(sensor=>sensor.addr=="a4:c1:38:8f:5e:e0")?.h,
      bta7h: item.stBtsByMainId.nodes.find(sensor=>sensor.addr=="a4:c1:38:43:10:a7")?.h,
      bt19h: item.stBtsByMainId.nodes.find(sensor=>sensor.addr=="a4:c1:38:be:5f:19")?.h,
//      bte0r: item.stBtsByMainId.nodes.find(sensor=>sensor.addr=="a4:c1:38:8f:5e:e0")?.rssi,
//      bta7r: item.stBtsByMainId.nodes.find(sensor=>sensor.addr=="a4:c1:38:43:10:a7")?.rssi,
//      bt19r: item.stBtsByMainId.nodes.find(sensor=>sensor.addr=="a4:c1:38:be:5f:19")?.rssi,
      v1: item.stVsByMainId.nodes.find(sensor=>sensor.i==1)?.v, 
      v2: item.stVsByMainId.nodes.find(sensor=>sensor.i==2)?.v, 
      motion1: item.stMotionsByMainId.nodes.find(sensor=>sensor.i==1)?.m, 
      motion2: item.stMotionsByMainId.nodes.find(sensor=>sensor.i==2)?.m, 
      rswitch: item.stRswitchesByMainId.nodes.find(sensor=>sensor.i==1)?.s, 
    }
  });
//  console.log('allDataChart',allDataChart);
  let dataGaps = [];
  // find gaps in data (if device skipped data sending for some time)
  for (let i=0; i<allDataChart.length; i++) { 

    if ((allDataChart[i+1]?.date - allDataChart[i]?.date)>(values.period*2)) { 

      dataGaps.push({

        date: allDataChart[i]?.date, 
        gapLabel: formatDuration(
                    intervalToDuration({ 
                      start: Number(allDataChart[i]?.date)*1000, 
                      end: Number(allDataChart[i+1]?.date)*1000 
                    })
                  ,{ format: ['days', 'hours', 'minutes']})  
      } 
      );

    }//if
  }//for

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  

// check if motion was detected recently to show red triangle
  const outOfRange = differenceInSeconds( new Date(),new Date(lastData.data.allStMains.nodes[0].dtCrt) ) > 60*10;

  const CustomTooltip = ({ active, payload, label }) => {
//console.log('CustomTooltip payload',payload);
    if (active && payload && payload.length) {
      return (
        <Grid sx={{backgroundColor:'#000', border: '1px solid #aaa', padding: '8px'}}>
          <div style={{fontWeight: 'bold', marginBottom: '-6px'}}>{format(fromUnixTime(label), "MM/dd/yyyy HH:mm:ss")}</div>
          <div style={{fontSize: '11px', marginBottom: '5px'}}>{formatDistanceStrict(new Date( fromUnixTime(label)) , new Date(), { includeSeconds: false, addSuffix: true })}</div>
{/*             <div style={{fontWeight: 'bold', }}>ut: {label}</div> */}
          {payload.map(item=>(<div key={item.dataKey} style={{color: item.stroke }}>{item.name} ({item.dataKey}) : {item.value}</div>))}
        </Grid>
      );
    }

    return null;
  };


  const handleInputChange = e => {
    //    console.log('handleInputChange e', e);
    let { name, value, checked } = e.target;
//    console.log('name, value, checked:',name, value, checked);

    // for <Switch/>
    if (checked) value = checked;

    setValues({ [name]: value });

    if (name=='loc') {
      console.log('refetching',value);
      allSrcs.refetch({loc:value})
    }

  };


  return (
    <>



        <AppBar position="relative" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          
          <Toolbar variant="dense">
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={()=>setOpenDrawer(!openDrawer)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              DSensors / {allLocs?.data.allStLocs.nodes.find(item=>item.loc==loc).name}
            </Typography>

            <NetworkStatus status={(lastData.networkStatus===8) ? false : true } />

            {auth && (
              <div>
                <Button
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                  <Typography sx={{ marginLeft:'10px',textTransform:'none' }}>
                    guest
                  </Typography>                        
                </Button>
                
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  

                  {allLocs?.data.allStLocs.nodes.map((item) => (<MenuItem key={item.loc} selected={item.loc===loc} 
                    onClick={()=>{ 
                      setLoc(item.loc); 
                      setValues({ loc: item.loc });
                      handleClose(); 
                    } }>{item.name} ({item.loc})</MenuItem>))}

                  <Divider />

                </Menu>
              </div>
            )}
          </Toolbar>
        </AppBar>



    


      <Drawer  
         
         variant="persistent" 
         open={openDrawer} 
         PaperProps={{ sx:{paddingTop:'60px', backgroundColor:theme.palette.grey[900] } }}
         sx={{
           midth: drawerWidth,
           
           flexShrink: 0,
           [`& .MuiDrawer-paper`]: {
             
             boxSizing: "border-box",
             overflowX: 'hidden',
             overflowY: 'auto',
             width: drawerWidth,
           }
         }}
        >

        <Box sx={{m:1}}>
          <Typography sx={{mb:2}}>Send to device:</Typography>
          <FormControl fullWidth>
            <FormGroup>


                <FormControl>
                  <FormControlLabel sx={{m:0}} control={

                    <Select fullWidth sx={{m:0}}
                      name="loc"
                      labelId="control-loc-label"
                      value={values.loc ?? ''}
                      onChange={handleInputChange}
                    >
                    {allLocs?.data.allStLocs.nodes.map((item) => (<MenuItem key={`loc_${item.loc}`} value={item.loc} selected={item.loc===values.loc} onClick={()=>{  } }>{item.name} ({item.loc})</MenuItem>))}                 

                    </Select>
                  } label="" labelPlacement="start" />
                </FormControl>

                <FormControl>
                  <FormControlLabel sx={{m:0}} control={

                    <Select fullWidth sx={{m:0 }}
                      name="src"
                      labelId="control-src-label"
                      value={values.src ?? ''}
                      onChange={handleInputChange}
                    >
                    {allSrcs?.data?.allStSrcs.nodes.map((item) => (<MenuItem key={`src_${item.src}`} value={item.src} selected={item.src===values.src} onClick={()=>{  } }>{item.name} ({item.src})</MenuItem>))}                 

                    </Select>
                  } label="" labelPlacement="start" />


                </FormControl>



                <FormControlLabel sx={{"& > span:last-of-type": { width: '100%', }}} control={
                  <Switch 
                    
                    name="reset"
                    value={(values.reset === 'true' ? 'on' : '')}
                    checked={Boolean(values.reset)}
                    onChange={handleInputChange}
                    color="primary"
                  />
                } label="Reset:" labelPlacement="start" />

                <FormControlLabel sx={{"& > span:last-of-type": { width: '100%', }}} control={
                  <Switch 
                    
                    name="relay1"
                    value={(values.relay1 === 'true' ? 'on' : '')}
                    checked={Boolean(values.relay1)}
                    onChange={handleInputChange}
                    color="primary"
                  />
                } label="Relay 1:" labelPlacement="start" />

                <FormControlLabel sx={{"& > span:last-of-type": { width: '100%', }}} control={
                  <Switch
                    
                    name="relay2"
                    value={(values.relay2 === 'true' ? 'on' : '')}
                    checked={Boolean(values.relay2)}
                    onChange={handleInputChange}
                    color="primary"
                  />
                } label="Relay 2:" labelPlacement="start" />



              <FormControlLabel sx={{m:0}} control={

                <Select fullWidth sx={{m:0}}
                  name="period"
                  value={values.period ?? ''}
                  labelId="control-period-label"
                  onChange={handleInputChange}
                >
                  <MenuItem value="30" selected>Every 0.5 min</MenuItem>
                  <MenuItem value="60" selected>Every 1 min</MenuItem>
                  <MenuItem value="300">Every 5 min</MenuItem>
                  <MenuItem value="600">Every 10 min</MenuItem>
                  <MenuItem value="1800">Every 30 min</MenuItem>
                  <MenuItem value="3600">Every 60 min</MenuItem>
                </Select>
                } label="" labelPlacement="start" />




                <Button
                  sx={{mt:3}}
                  variant="outlined"
                  onClick={async ()=>{

                    console.log('updating src with values:', values);
                    const res = await updateCustomSrc({variables: {
                      loc: Number(values.loc),
                      src: Number(values.src),
                      relay1: values.relay1 ? 1 : 0, 
                      relay2: values.relay2 ? 1 : 0, 
                      period: Number(values.period),
                      reset: Number(values.reset),
                      sleep: Number(values.sleep),
                    }});

                    enqueueSnackbar({
                      message: 'New prefs will be sent to device soon',
                      variant: 'info',
                    });
        

                  }}
                >
                  Update
                </Button>
            </FormGroup>
          </FormControl>
        </Box>

        <Divider sx={{mt:2}} />

        <Typography sx={{ml:2,mt: 2}}>Ranges:</Typography>

         <List>

         {lastData?.data.allStWidgets.edges.map((item) => (
            <ListItem key={item.node.id} disablePadding  dense
            secondaryAction={<Typography sx={{fontSize:'12px'}}>{item.node.vmin},{item.node.vmax}</Typography>}
            >
              <ListItemButton>
                <ListItemText primary={item.node.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
           
       </Drawer>

       
       <Grid container item sx={{ flexGrow: 1, paddingLeft: '8px', paddingRight: '8px',overflowY: 'scroll', overflowX: 'hidden' }} >
         <Grid container item justifyContent="flex-start" alignContent="flex-start"
          sx={{
            
            gap:'8px',
            
            transition: theme.transitions.create("margin", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen
            }),
            
            marginLeft: 0,
            //marginLeft: `-calc(  ${drawerWidth}px-100%)`,
            ...(openDrawer && {
              transition: theme.transitions.create("margin", {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen
              }),
              marginLeft: `${drawerWidth}px`,
            }),
  
          }}
          >

            <TitleCard lastData={lastData.data.allStMains.nodes[0]} outOfRange={outOfRange} />

            <Grid container item justifyContent="flex-start" alignContent="flex-start"  sx={{ gap:'8px', flexGrow: 1, background: outOfRange ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, #ccc 10px, #ccc 20px )' : 'none' }} 
            >

            {lastData?.data.allStWidgets.edges.map(item => (
// for each sensor

            <React.Fragment key={item.node.id} >
            {(() => {

              switch(item.node.widget) {

                case 'div' : return <WidgetDIV meta={item.node} />

                case 'ot' : return <WidgetOT data={lastData.data.allStMains.nodes[0].stOtsByMainId.nodes.find(item2 => item2.i==item.node.i)} meta={item.node} />

                case 'bt' : return <WidgetBT data={lastData.data.allStMains.nodes[0].stBtsByMainId.nodes.find(item2 => item2.addr==item.node.i  )} meta={item.node} />

                case 'v' :      return <WidgetV      data={lastData.data.allStMains.nodes[0].stVsByMainId.nodes.find(     item2 => item2.i==item.node.i)} meta={item.node} />

                case 'motion' : return <WidgetMOTION data={   {...lastData.data.allStMotions1.nodes.find(item2 => item2.i==item.node.i) , ...lastData.data.allStMotions2.nodes.find(item2 => item2.i==item.node.i) }       } meta={item.node} />

                case 'rswitch' : return <WidgetRSWITCH data={lastData.data.allStRswitches.nodes[0]} meta={item.node} />

                case 'battery' : return <WidgetBATTERY data={lastData.data.allStMains.nodes[0]} meta={item.node} />

                case 'btcount' : return <WidgetBTCOUNT data={lastData.data.allStMains.nodes[0].stBtsByMainId.nodes} meta={item.node} />

                case 'debug' : return <WidgetDEBUG data={lastData.data.allStMains.nodes[0]} meta={item.node} />

                default: ;
              }
            })()}
              
            </React.Fragment>
            ) )}

          </Grid>            

            <Grid outofrange={+outOfRange} container backgroundColor="#505060" width="100%" height="auto" 
            sx={{    
              flexGrow: '1',
              paddingLeft: '5px',
              paddingRight: '5px',
              paddingTop: '5px',
              paddingBottom: '4px',
            }}
            >
              <Grid xs={12} md={6} container item alignContent="center"><Typography sx={{fontSize: '14px'}}>Charts</Typography></Grid>
              <Grid xs={12} md={6} container item alignContent="center"  justifyContent={{xs: "flex-start", md: "flex-end"}}>
                <NativeSelect disableUnderline={true} value={lastRows} onChange={(e)=>{ 
                  console.log('setlastRows',Number(e.target.value));
                  setlastRows(Number(e.target.value));
                  enqueueSnackbar({
                    message: `Loading data for ${Number(e.target.value)} events`,
                    variant: 'info',
                  });

                  }} >
                  <option value={1*3600/values.period}>Last 1 hour ({1*3600/values.period} events by {values.period/60} min)</option>
                  <option value={3*3600/values.period}>Last 3 hours ({3*3600/values.period} events by {values.period/60} min)</option>
                  <option value={5*3600/values.period}>Last 5 hours ({5*3600/values.period} events by {values.period/60} min)</option>
                  <option value={12*3600/values.period}>Last 12 hours ({12*3600/values.period} events by {values.period/60} min)</option>
                  <option value={24*3600/values.period}>Last 1 day ({24*3600/values.period} events by {values.period/60} min)</option>
                  <option value={48*3600/values.period}>Last 2 days ({48*3600/values.period} events by {values.period/60} min)</option>
                  <option value={72*3600/values.period}>Last 3 days ({72*3600/values.period} events by {values.period/60} min)</option>
                </NativeSelect>                
              </Grid>
            </Grid>



              <ResponsiveContainer width="100%" height={200}>

              <BarChart width={500} height={20} data={allDataChart}
                  syncId="anyId"
                  margin={{ top: 5, right: 40, bottom: 5, left: -20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => format(fromUnixTime(date), "HH:mm") } />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend  />
                {dataGaps.map(item => <ReferenceLine x={item.date} label={item.gapLabel} strokeDasharray="2 5" stroke="red" strokeWidth={8} isFront key={item.date} />)}
                
                <Bar name="stairs f2" dataKey="motion1" fill="#8e1b93" stackId="a"/>
                <Bar name="room f2" dataKey="motion2" fill="#4444ff" stackId="a"/>
              </BarChart>
            </ResponsiveContainer>



            <ResponsiveContainer width="100%" height={200} style={{marginTop: '10px'}}>
              <LineChart
                data={allDataChart}
                syncId="anyId"
                margin={{ top: 5, right: -20, bottom: 5, left: -20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => format(fromUnixTime(date), "HH:mm") } />

                <YAxis yAxisId="left" domain={[0, 300]} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />


                <Tooltip content={<CustomTooltip />} />
                <Legend  />

                {dataGaps.map(item => <ReferenceLine x={item.date} label={item.gapLabel} strokeDasharray="2 5" stroke="red" strokeWidth={8} isFront key={item.date} yAxisId="left" />)}

                <Line name="UPS, V" yAxisId="left"  type="monotone" dataKey="v1" stroke="#ff5555" fill="#8884d8" dot={false} />
                <Line name="Grid, V" yAxisId="left"  type="monotone" dataKey="v2" stroke="#9999ff" fill="#8884d8" dot={false} />
                <Line name="Li battery, %" yAxisId="right"  type="monotone" dataKey="upsPercent" stroke="#ffffff" fill="#8884d8" dot={false} />
              </LineChart>

            </ResponsiveContainer>

            
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                margin={{ top: 5, right: 40, bottom: 5, left: -20 }}
                data={allDataChart}
                syncId="anyId"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => format(fromUnixTime(date), "HH:mm") } />
                <YAxis domain={[-30, 30]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend  />

                {dataGaps.map(item => <ReferenceLine x={item.date} label={item.gapLabel} strokeDasharray="2 5" stroke="red" strokeWidth={8} isFront key={item.date} />)}

                <Line name="device f2, C" type="monotone" dataKey="ot0" stroke="#aaaaff" fill="#8884d8" dot={false} />
                <Line name="outdoor, C" type="monotone" dataKey="ot1" stroke="#ffffff" fill="#8884d8" dot={false} />
                <Line name="indoor f2, C" type="monotone" dataKey="ot2" stroke="#00ff00" fill="#8884d8" dot={false} />
              </LineChart>
            </ResponsiveContainer>


            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={allDataChart}
                syncId="anyId"
                margin={{ top: 5, right: 40, bottom: 5, left: -20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => format(fromUnixTime(date), "HH:mm") } />
                <YAxis domain={[-5, 30]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend  />

                {dataGaps.map(item => <ReferenceLine x={item.date} label={item.gapLabel} strokeDasharray="2 5" stroke="red" strokeWidth={8} isFront key={item.date} />)}

                <Line name="AGM batteries, C" type="monotone" dataKey="bte0t" stroke="#aaaaff" fill="#8884d8" dot={false} />
                <Line name="bathroom pipes, C" type="monotone" dataKey="bta7t" stroke="#ffffff" fill="#8884d8" dot={false} />
                <Line name="kitchen pipes, C" type="monotone" dataKey="bt19t" stroke="#00ff00" fill="#8884d8" dot={false} />
              </LineChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={allDataChart}
                syncId="anyId"
                margin={{ top: 5, right: 40, bottom: 5, left: -20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => format(fromUnixTime(date), "HH:mm") } />
                <YAxis domain={[20, 60]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend  />
                {dataGaps.map(item => <ReferenceLine x={item.date} label={item.gapLabel} strokeDasharray="2 5" stroke="red" strokeWidth={8} isFront key={item.date} />)}
                <Line name="AGM batteries, H" type="monotone" dataKey="bte0h" stroke="#aaaaff" fill="#8884d8" dot={false} />
                <Line name="bathroom pipes, H" type="monotone" dataKey="bta7h" stroke="#ffffff" fill="#8884d8" dot={false} />
                <Line name="kitchen pipes, H" type="monotone" dataKey="bt19h" stroke="#00ff00" fill="#8884d8" dot={false} />
              </LineChart>
            </ResponsiveContainer>


            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={allDataChart}
                syncId="anyId"
                margin={{ top: 5, right: -22, bottom: 5, left: -20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => format(fromUnixTime(date), "HH:mm") } />
                <YAxis yAxisId="left" domain={[-212, 4]}  />
                <YAxis yAxisId="right" orientation="right" domain={[5, 9]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend  />
                {dataGaps.map(item => <ReferenceLine x={item.date} label={item.gapLabel} strokeDasharray="2 5" stroke="red" strokeWidth={8} isFront key={item.date} yAxisId="left" />)}
                <Line name="Li battery current, mA" yAxisId="left"  type="monotone" dataKey="upsC" stroke="#8884d8" fill="#8884d8" dot={false} />
                <Line name="Li battery voltage, V" yAxisId="right"  type="monotone" dataKey="upsV" stroke="#ffffff" fill="#8884d8" dot={false} />
              </LineChart>
            </ResponsiveContainer>



            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={allDataChart}
                syncId="anyId"
                margin={{ top: 5, right: -22, bottom: 5, left: -20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => format(fromUnixTime(date), "HH:mm") } />
                <YAxis yAxisId="left" domain={[-30, -10]} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 30]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend  />
                {dataGaps.map(item => <ReferenceLine x={item.date} label={item.gapLabel} strokeDasharray="2 5" stroke="red" strokeWidth={8} isFront key={item.date} yAxisId="left" />)}
                <Line name="WiFi RSSI" yAxisId="left" type="monotone" dataKey="wRssi" stroke="#8884d8" fill="#8884d8" dot={false} />
                <Line name="BT devices found" yAxisId="right" type="monotone" dataKey="btFound" stroke="#ffffff" fill="#8884d8" dot={false} />
              </LineChart>
            </ResponsiveContainer>


            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={allDataChart}
                syncId="anyId"
                margin={{ top: 5, right: -22, bottom: 5, left: -20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => format(fromUnixTime(date), "HH:mm") } />
                <YAxis yAxisId="left" domain={[100, 200]} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 2000]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend  />
                {dataGaps.map(item => <ReferenceLine x={item.date} label={item.gapLabel} strokeDasharray="2 5" stroke="red" strokeWidth={8} isFront key={item.date} yAxisId="left" />)}
                <Line name="heap" yAxisId="left" type="monotone" dataKey="heap" stroke="#8884d8" fill="#8884d8" dot={false} />
                <Line name="count" yAxisId="right" type="monotone" dataKey="count" stroke="#ffffff" fill="#8884d8" dot={false} />
              </LineChart>
            </ResponsiveContainer>




          </Grid>
          
       

         
       </Grid>
     



        <Backdrop
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1000 }}
          open={false}
          invisible={true}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

    </>
  );
}

export default App;
