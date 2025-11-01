import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { Link, Outlet, useNavigate } from "react-router-dom"
import io from 'socket.io-client';
import { Stack, Button } from "@mui/material"
import Slider from '@mui/material/Slider'
import axios from 'axios'
import { fetchDevices, setSelectedDevice } from './redux/devicesSlice';
import { fetchAnomalies } from './redux/anomaliesSlice';
import Anomalies from './Anomalies';
import DevicesComp from './DevicesComp';
import Stream from './Stream';
import { SpinnerComp } from "./SpinnerComp"
import './App.css'

let router_mac = ''
let iotProbability = 0;

const HomePage = () => {
  const { interfaces } = useSelector((state) => state.interfaces);
  const { devices, selectedDevice } = useSelector((state) => state.devices);
  const [parameters, setParameters] = useState({});
  const [displaySpinner, setDisplaySpinner] = useState(false);
  const [showAConsole, setShowConsole] = useState(false);
  const [endSubmit, setEndSubmit] = useState(false);
  const [aiReply, setAiReply] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = () => {
      setParameters(getInitialValues(interfaces));
      getDevices();
    };
    fetchData();
  }, []);

  // useEffect(() => {
  //   const intervalId = setInterval(getDevices, 30000); // Poll every 30 seconds
  //   return () => clearInterval(intervalId);
  // }, []);

  const getInitialValues = (interfaces) => {
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

  const getDevices = async () => {
    // debugger;
    setDisplaySpinner(true);
    await dispatch(fetchDevices(router_mac));
    await dispatch(fetchAnomalies());
    setDisplaySpinner(false);
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
      // debugger;
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
    dispatch(setSelectedDevice(""));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      let response = axios.post(`http://localhost:8000/runsniffer`, parameters);
      // debugger;
      setEndSubmit(true)
    } catch (error) {
      console.log(error.message);
    }
  }

  const handleStop = async (e) => {
    e.preventDefault();
    // setEndSubmit(false)
    try {
      let response = await axios.post(`http://localhost:8000/stopsniffer`, parameters);
      setEndSubmit(false);
    } catch (error) {
      console.log(error.message);
    }
  }

  const handleDeleteDb = async (e) => {
    e.preventDefault();
    try {
      let response = await axios.get(`http://localhost:8000/deletedb`);
      alert('Database deleted successfully!');
      // window.location.reload();
    } catch (error) {
      console.log(error.message);
    }
  }

  const sendMessage = (msg) => {
    if (socket && msg.trim() !== '') {
      socket.send(msg);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'row', alignItems: 'flex-start', margin: '1rem', height: '53rem', backgroundColor: '#222020', padding: '0.5rem', borderRadius: '8px', minWidth: '76rem' }}>
      <div style={{width: '30rem'}}>
        <Stack spacing={1} direction="row">
            <Link to={`devices/${parameters.interface}`} >
                More data...
            </Link>
            <button type="button" style={{ fontSize: '0.5rem', marginLeft: '10rem'}} onClick={handleDeleteDb}> Delete DB </button>
        </Stack>
        <br/>
        <h2 style={{fontFamily: 'fantasy', color: 'yellow'}}>IoT Anomalies Detector</h2>
        {/* <br/>
        <button type="button" onClick={()=>{setRemoteIpChange(!remoteIpChange)}}>Set Remote IP</button>
        <input type="text" id="remoteIp" name="remoteIp" value={remoteIp} onChange={(e) => setRemoteIp(e.target.value)} />
        <br/> */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
          <div>
            { interfaces.length > 0 &&
              <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <h4 style={{color: 'lightgreen'}}>Interface List</h4>
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
              <h4 style={{color: 'lightgreen'}}>Options</h4>
              <label htmlFor="interval">Set interval (seconds): </label>
              <input type="number" id="interval" name="interval" defaultValue={parameters.interval} min="0" onChange={handleSelect} />
              <label htmlFor="no_of_packets">Set number of packets: </label>
              <input type="number" id="no_of_packets" name="no_of_packets" defaultValue={parameters.no_of_packets} min="1" onChange={handleSelect} />
              <label htmlFor="no_of_sessions">Set number of sessions (0 for infinite): </label>
              <input type="number" id="no_of_sessions" name="no_of_sessions" defaultValue={parameters.no_of_sessions} min="1" onChange={handleSelect} />
              <label htmlFor="collect_data_time">Set devices collection data time (seconds): </label>
              <input type="number" id="collect_data_time" name="collect_data_time" defaultValue={parameters.collect_data_time} min="600" onChange={handleSelect} />
              <br/>
              <label><input type="checkbox" name="ports_scan" checked={parameters.ports_scan} onChange={handleSelect} /> Ports Scanning</label>
              <label><input type="checkbox" name="os_detect" checked={parameters.os_detect} onChange={handleSelect} /> Deep OS detection (slower)</label>
              <div className="slidecontainer" style={{width: "15rem"}}>
                  <label htmlFor="iot_probability" style={{marginTop: '0.5rem', fontSize: '1rem'}}>Minimum IoT Probability: <strong>{parameters.iot_probability}</strong></label>
                  <div id="iot_probability" style={{marginLeft: '0.5rem', width: '11rem'}}>
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
              <section style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '1rem', marginTop: '0', height: '3rem' }}>
                <button type="submit" value="Submit" disabled={endSubmit} onClick={handleSubmit}> Submit </button>
                <button type="stop" onClick={handleStop}> Stop </button>
                {displaySpinner && <SpinnerComp/>}
              </section>
              <Stream getDevices={getDevices} setEndSubmit={setEndSubmit} />
            </section>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', backgroundColor: '#383333', width: '100%', height: '100%', padding: '0.5rem' ,borderRadius: '8px'}}>
        <DevicesComp parameters={parameters} />
        <Anomalies selectedDevice={selectedDevice} />
      </div>
    </div>
  )
}

export default HomePage;
