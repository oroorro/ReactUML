import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import App from './example/App';
// import AlgoFlow from './container/AlgoFlow';
import Flow from './Flow';
import App from './App';
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);


