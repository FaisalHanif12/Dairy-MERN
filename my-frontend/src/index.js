import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { GlobalStyle } from './GlobalStyle';
import reportWebVitals from './reportWebVitals';



if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
	  navigator.serviceWorker.register('/service-worker.js')
		.then(reg => console.log('Service Worker: Registered (Pages may be served from cache.)'))
		.catch(err => console.log(`Service Worker: Error: ${err}`));
	});
  }
  
  ReactDOM.render(
	<React.StrictMode>
	  <App />
	</React.StrictMode>,
	document.getElementById('root')
  );
  
  // Optionally, use reportWebVitals to measure and log performance
  reportWebVitals();