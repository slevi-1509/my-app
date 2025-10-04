import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { Link, Outlet, useNavigate } from "react-router-dom"
import io from 'socket.io-client';
import { Stack, Button } from "@mui/material"
import Slider from '@mui/material/Slider'
import axios from 'axios'
import { fetchDevices, setRouterMac } from './redux/devicesSlice';
import { fetchAnomalies } from './redux/anomaliesSlice';
import Anomalies from './Anomalies';
import DevicesComp from './DevicesComp';
import './App.css'

let router_mac = ''
let iotProbability = 0;

export const getInitialValues = (interfaces) => {
  let parameters_initial = {};
  if (localStorage.getItem('parameters')) {
    parameters_initial = JSON.parse(localStorage.getItem('parameters'));
  } else {
    parameters_initial = {'interface': interfaces[0].mac,
      'interval': 1,
      'no_of_packets': 100,
      'no_of_sessions': 1,
      'collect_data_time': 3600,
      'ports_scan': false,
      'os_detect': false,
      'iot_probability': 0,
    };
    localStorage.setItem('parameters', JSON.stringify(parameters_initial));
  }
  iotProbability = parameters_initial.iot_probability;
  router_mac = parameters_initial.interface;
  return parameters_initial;
}

const HomePage = () => {
  const { interfaces } = useSelector((state) => state.interfaces);
  const { devices } = useSelector((state) => state.devices);
  const [parameters, setParameters] = useState({});
  // const [iotProbability, setIotProbability] = useState();
  const [selectedDevice, setSelectedDevice] = useState({});
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const dispatch = useDispatch();
  
  // useEffect(() => {
  //       const ws = new WebSocket("ws://localhost:8000/ws/chat"); // Connect to your FastAPI WebSocket endpoint
  //       ws.onopen = () => {
  //         console.log("WebSocket connection established");
  //       };
  //       ws.onmessage = (event) => {
  //         setMessages((prevMessages) => [...prevMessages, event.data]);
  //       };
  //       ws.onclose = () => {
  //         console.log("WebSocket connection closed");
  //       };
  //       ws.onerror = (error) => {
  //         console.error("WebSocket error: ", error);
  //       };
  //       setSocket(ws);
  //       return () => {
  //         ws.close(); // Clean up on component unmount
  //       };
  //     }, []);
  
  // useEffect (() => {
  //   let remote_ip = '';
  //   if (remoteIp === '') {
  //     if (localStorage.getItem('remoteIp')) {
  //       remote_ip = localStorage.getItem('remoteIp');
  //       setRemoteIp(remote_ip);
  //     } else {
  //       remote_ip = 'localhost';
  //       setRemoteIp('localhost');
  //       localStorage.setItem('remoteIp', 'localhost');
  //     }
  //   } else {
  //     remote_ip = remoteIp;
  //     localStorage.setItem('remoteIp', remoteIp);
  //   }
  //   if (status === 'idle') {
  //     getInterfaces();
  //     // dispatch(fetchInterfaces()); // trigger the fetch once
  //   }
  // }, [status, dispatch]);

  useEffect(() => {
    // dispatch(setRouterMac(parameters.interface));
    setParameters(getInitialValues(interfaces));
    // setIotProbability(parameters.iot_probability);
    getDevices();
    getAnomalies();
  }, []);

  const getDevices = () => {
    dispatch(fetchDevices(router_mac));
  }

  const getAnomalies = () => {
    dispatch(fetchAnomalies());
  }

  const handleSelect = (e) => {
    let { value, name } = e.target;
    if (['interval', 'no_of_packets', 'no_of_sessions', 'collect_data_time'].includes(name)) {
      value = parseInt(value);
    }
    if (['ports_scan', 'os_detect'].includes(name)) {
      value = e.target.checked;
    }
    if (name === 'interface'){
      value = e.target.value;
      if (value !== '') {
        router_mac = value
        getDevices();
      }
    }
    if (name === 'iot_probability') {
      iotProbability = value;
      value = e.target.value
    }
    setParameters({...parameters, [name]: value})
    localStorage.setItem('parameters', JSON.stringify({...parameters, [name]: value}));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    // parameters['iot_probability'] = iotProbability;
    try {
      // sendMessage(JSON.stringify({'action': 'start_sniffer', 'parameters': parameters}));
      let response = await axios.post(`http://localhost:8000/runsniffer`, parameters);
    } catch (error) {
      console.log(error.message);
    }
  }

  const handle_device_click = async (device) => {
    let { src_mac } = device;
    setSelectedDevice(device);
    // setAnomaliesToShow(anomalies.filter(anomaly => anomaly.src_mac === src_mac));
  }

  const sendMessage = (msg) => {
    if (socket && msg.trim() !== '') {
      socket.send(msg);
    }
  };

  return (
    <>
      <Stack spacing={1} direction="row">
          <Link to={`devices/${parameters.interface}`} >
              More data...
          </Link>
      </Stack>
      <h1>My Python Sniffer Client</h1>
      {/* <br/>
      <button type="button" onClick={()=>{setRemoteIpChange(!remoteIpChange)}}>Set Remote IP</button>
      <input type="text" id="remoteIp" name="remoteIp" value={remoteIp} onChange={(e) => setRemoteIp(e.target.value)} />
      <br/> */}
      <br/>
      <div className='settings-container' style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
        <div>
          { interfaces.length > 0 &&
            <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <h3>Interface List</h3>
              <label htmlFor="interface">Select an interface:</label>
              <select name="interface" id="interface" value={parameters.interface} onChange={handleSelect}>
                {interfaces.map((item, index) => (
                  <option key={index} value={`${item['mac']}`}>{`${item['interface']} - ${item['ip']}`}</option>
                ))}
              </select>
            </section>
          }
          <br/>
          <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h3>Options:</h3>
            <p>port scan {String(parameters.ports_scan)}</p>
            <label htmlFor="interval">Set interval (seconds): </label>
            <input type="number" id="interval" name="interval" defaultValue={parameters.interval} min="0" onChange={handleSelect} />
            <label htmlFor="no_of_packets">Set number of packets: </label>
            <input type="number" id="no_of_packets" name="no_of_packets" defaultValue={parameters.no_of_packets} min="1" onChange={handleSelect} />
            <label htmlFor="no_of_sessions">Set number of sessions (0 for infinite): </label>
            <input type="number" id="no_of_sessions" name="no_of_sessions" defaultValue={parameters.no_of_sessions} min="1" onChange={handleSelect} />
            <label htmlFor="collect_data_time">Set collection data time for anomalies (seconds): </label>
            <input type="number" id="collect_data_time" name="collect_data_time" defaultValue={parameters.collect_data_time} min="600" onChange={handleSelect} />
            <label><input type="checkbox" name="ports_scan" checked={parameters.ports_scan} onChange={handleSelect} /> Ports Scanning</label>
            <label><input type="checkbox" name="os_detect" checked={parameters.os_detect} onChange={handleSelect} /> Deep OS detection (slower)</label>
            <div className="slidecontainer" style={{width: "12rem"}}>
                <label htmlFor="iot_probability" style={{fontSize: '0.9rem'}}>Minimum IoT Probability: <strong>{parameters.iot_probability}</strong></label>
                <div id="iot_probability">
                  <Slider 
                      name="iot_probability"
                      min={0}
                      max={100}
                      step={1}
                      aria-label="IoT Probability"
                      value={iotProbability}
                      valueLabelDisplay="auto"
                      onChange={handleSelect} 
                  />
                </div>
            </div>
            <button type="submit" value="Submit" onClick={handleSubmit}> Submit </button>
          </section>
        </div>
        {/* <div className='chat-box' style={{ marginLeft: '2rem', border: '1px solid yellow', padding: '1rem', width: '55%', height: '20rem', overflowY: 'scroll' }}>
          <h4>WebSocket Chat</h4>
          {messages.map((msg, index) => (
            <p key={index}>{msg}</p>
          ))}
        </div> */}
      </div>
      <br/>
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <h3>Devices:</h3>
        {Object.keys(devices).length > 0 ? (
          <DevicesComp iot={parameters.iot_probability} />
        ) : (
          <p>No devices found.</p>
        )}
        <br/>
        <Anomalies selectedDevice={selectedDevice} />
        <br/> 
      </div>
    </>
  )
}

export default HomePage;
