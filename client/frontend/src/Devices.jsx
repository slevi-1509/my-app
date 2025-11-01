import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { Link, useParams } from "react-router-dom"
import { Stack } from "@mui/material"
import Anomalies from './Anomalies';
import Log from './Log';
import { fetchDevices, setRouterMac } from './redux/devicesSlice';
import { fetchAnomalies } from './redux/anomaliesSlice';
import './App.css'

const Devices = () => {
    const { devices } = useSelector((state) => state.devices);
    const [selectedDevice, setSelectedDevice] = useState({});
    const dispatch = useDispatch();
    const router_mac = useParams().router_mac;

    useEffect (() => {
        const getInfo = async () => {
            if (devices == {} || Object.keys(devices).length === 0) {
                // debugger
                // router_mac = getInitialValues().interface;
                dispatch(fetchDevices(router_mac));
                dispatch(fetchAnomalies());
            }
        }
        getInfo();
    }, [])

    const handleSelect = async (e) => {
        let { value } = e.target;
        if (value === "Show All Anomalies") {
            setSelectedDevice({});
        }
        setSelectedDevice(value in devices ? devices[value] : {});
    }

    return (
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'row', alignItems: 'flex-start', margin: '1rem', backgroundColor: '#222020', padding: '0.5rem', borderRadius: '8px', minWidth: '76rem' }}>
            <section style={{width: '30rem'}}>
                <Stack spacing={1} direction="row">
                    <Link to={'/'}>
                        Home
                    </Link>
                </Stack>
                <br/>
                <h2 style={{fontFamily: 'fantasy', color: 'yellow'}}>Devices Information</h2>
                <br/>
                <h5>Interface Mac: {router_mac}</h5>
                <br/>
                { Object.keys(devices).length > 0 && 
                    <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <label htmlFor="device">Select a device:</label>
                        <select name="device" id="device" onChange={handleSelect} style={{ marginTop: '0.5rem', width: '20rem', backgroundColor: '#383333', color: 'white', border: '1px solid #c7d140', borderRadius: '4px', padding: '0.3rem 0 0.3rem 0' }}>
                            <option>Show All Anomalies</option>
                            {Object.values(devices).map((device, index) => (
                                <option style={{fontSize: '0.8rem'}} key={index} value={`${device['src_mac']}`}>{`IP : ${device['src_ip']} / MAC : ${device['src_mac']} / IoT : ${device['is_iot']}%`}</option>
                            ))}
                        </select>
                    </section> 
                }  
                <br/>
                {Object.keys(selectedDevice).length > 0 && 
                    <div className="device-info">
                        <h4>Device Information</h4>
                        <p><strong>IP:</strong> {selectedDevice.src_ip}</p>
                        <p><strong>MAC:</strong> {selectedDevice.src_mac}</p> 
                        <p><strong>Host Name:</strong> {selectedDevice.host_name}</p>
                        <p><strong>Device OS:</strong> {selectedDevice.os}</p>
                        <p><strong>Ports Scan Result:</strong> {selectedDevice.port_scan_result}</p>
                        <p><strong>TTL:</strong> {selectedDevice.ttl}</p>
                        <p><strong>TCP Window Size:</strong> {selectedDevice.tcp_window_size}</p>
                        <p><strong>IoT Probability:</strong> {selectedDevice.is_iot}%</p>
                        <p><strong>IoT AI Reasoning:</strong> {selectedDevice.iot_reasoning}</p>
                    </div>
                }
            </section>
            <section style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#383333', width: '100%', height: '50rem', padding: '0.5rem', borderRadius: '8px' }}>
                {Object.keys(selectedDevice).length > 0 && <Log selectedDevice={selectedDevice.src_mac} />}
                <Anomalies selectedDevice={selectedDevice.src_mac} />
            </section>
        </div>
    );
};

export default Devices;