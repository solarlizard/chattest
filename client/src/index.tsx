import React from 'react';
import './index.css';
import './..//node_modules/bootstrap/dist/css/bootstrap.min.css';
import {App} from './app/App';
import reportWebVitals from './reportWebVitals';
import { createRoot } from 'react-dom/client';

const rootContainer = document.getElementById('root')!;

createRoot(rootContainer)
    .render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );


reportWebVitals();
