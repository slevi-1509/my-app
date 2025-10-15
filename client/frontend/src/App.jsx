import './App.css'
import { useEffect, useState } from 'react'
import { Routes, Route } from "react-router-dom"
import { useSelector, useDispatch } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import Devices from './Devices'
import HomePage from './HomePage'
import { fetchInterfaces } from './redux/interfacesSlice';

function App() {
  const [remoteIp, setRemoteIp] = useState('');
  const { interfaces, status, error } = useSelector((state) => state.interfaces);
  const dispatch = useDispatch();

  useEffect (() => {
      let remote_ip = '';
      if (remoteIp === '') {
        if (localStorage.getItem('remoteIp')) {
          remote_ip = localStorage.getItem('remoteIp');
          setRemoteIp(remote_ip);
        } else {
          remote_ip = 'localhost';
          setRemoteIp('localhost');
          localStorage.setItem('remoteIp', 'localhost');
        }
      } else {
        remote_ip = remoteIp;
        localStorage.setItem('remoteIp', remoteIp);
      }
      if (status === 'idle') {
        dispatch(fetchInterfaces());
        // dispatch(fetchInterfaces()); // trigger the fetch once
      }
    }, [status]);

  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'failed') return <p>Failed to load items</p>;
  
  // APP_PORT = 3300;

  // SERVER_IP = "http://localhost:";
  // DEVICES_URL = SERVER_IP+APP_PORT+"/devices";
  // MAIN_URL = SERVER_IP+APP_PORT+"/";

  return (
    <>
      {interfaces.length > 0 ? (
        <div>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/devices/:router_mac' element={<Devices />} />
          </Routes>
        </div>
        ) : (
            <p>No interfaces found.</p>
        )}
    </>
)}

export default App


    
