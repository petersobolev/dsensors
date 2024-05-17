import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

import App from './App';
import { SnackbarProvider } from 'notistack';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from '@mui/material/styles'

import { useSnackbar } from 'notistack';


const client = new ApolloClient({
  uri: import.meta.env.VITE_APP_GRAPHQL_API, //"http://localhost:3000/graphql",
  cache: new InMemoryCache(),
});

const AppWrapper = () => {

  const CloseSnackbarAction = ({ id }) => {
    const { closeSnackbar } = useSnackbar()
    return (
      <IconButton style={{marginTop: "0.1em"}} onClick={() => {closeSnackbar(id)}}>
        <CloseIcon/>
      </IconButton>)
  }

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'dark',
//          mode: settings?.theme ?? 'light',

        },
      }),
    //[settings?.theme],
    
    );

  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider
          maxSnack={6}
          hideIconVariant
          autoHideDuration={5000}
          preventDuplicate={false}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }} 
          action={key => <CloseSnackbarAction id={key} />} 
          
        >
          <App />
        </SnackbarProvider>
        </ThemeProvider>
      </ApolloProvider>
  );
  
};

export default AppWrapper;
