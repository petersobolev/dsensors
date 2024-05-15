import React from 'react';

import ReactDOM from 'react-dom/client';
import AppWrapper from './AppWrapper';

globalThis.__DEV__ = false; // hide 'download graphql devtool' message

console.log('process.env.NODE_ENV',process.env.NODE_ENV)

console.log('import.meta.env',import.meta.env);

ReactDOM.createRoot(document.getElementById('root')).render(
    <AppWrapper />
)
