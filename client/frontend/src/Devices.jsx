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
        setSelectedDevice(value in devices ? devices[value] : {});
       
    }

    return (
        <div>
            <Stack spacing={1} direction="row">
                <Link to={'/'}>
                    Home
                </Link>
            </Stack>
            <h2>Devices and Anomalies Information</h2>
            <br/>
            <h4>Router Mac: {router_mac}</h4>
            <br/>
            { Object.keys(devices).length > 0 && 
                <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <label htmlFor="device">Select a device:</label>
                    <select name="device" id="device" onChange={handleSelect}>
                        <option>Show All Anomalies</option>
                        {Object.values(devices).map((device, index) => (
                            <option key={index} value={`${device['src_mac']}`}>{`IP : ${device['src_ip']} / MAC : ${device['src_mac']} / IoT : ${device['is_iot']}%`}</option>
                        ))}
                    </select>
                </section> 
            }  
            <br/>
            {Object.keys(selectedDevice).length > 0 && 
                <div className="device-info">
                    <h3>Device Information</h3>
                    <p><strong>IP:</strong> {selectedDevice.src_ip}</p>
                    <p><strong>MAC:</strong> {selectedDevice.src_mac}</p> 
                    <p><strong>IoT Probability:</strong> {selectedDevice.is_iot}%</p>
                    <p><strong>Host Name:</strong> {selectedDevice.host_name}</p>
                    <p><strong>Device OS:</strong> {selectedDevice.os}</p>
                    <p><strong>Ports Scan Result:</strong> {selectedDevice.port_scan_result}</p>
                    <p><strong>TTL:</strong> {selectedDevice.ttl}</p>
                    <p><strong>TCP Window Size:</strong> {selectedDevice.tcp_window_size}</p>
                    <p><strong>IoT AI Reasoning:</strong> {selectedDevice.iot_reasoning}</p>
                </div>
            }
            <br/>
            <Anomalies selectedDevice={selectedDevice.src_mac} />
            <br/> 
            <Log selectedDevice={selectedDevice.src_mac} />
        </div>
    );
};

export default Devices;