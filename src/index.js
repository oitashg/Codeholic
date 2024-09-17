import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import {configureStore} from "@reduxjs/toolkit"
import rootReducer from './reducer';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';

//Central store is created here using configureStore and rootReducer is passed as reducer
//which contains/combines all reducers
const store = configureStore({
  reducer: rootReducer
})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* App to be wrapped by Provider in 0rder to use store, reducer and slices */}
    <Provider store={store}>
      {/* The app component is wrapped in browser router to create routes
      for every pages and components */}
      <BrowserRouter>
        <App />
        <Toaster/>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

