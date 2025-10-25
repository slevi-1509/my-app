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
    const [deviceToShow, setDeviceToShow] = useState({});
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
        // debugger;
        if (value === "Show All Anomalies") {
            setDeviceToShow({});
        } else {
            setDeviceToShow(Object.values(devices).find(device => device.src_mac === value) || {});
        }
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
            {deviceToShow && Object.keys(deviceToShow).length > 0 &&
                <div className="device-info">
                    <h3>Device Information</h3>
                    <p><strong>IP:</strong> {deviceToShow.src_ip}</p>
                    <p><strong>MAC:</strong> {deviceToShow.src_mac}</p> 
                    <p><strong>IoT Probability:</strong> {deviceToShow.is_iot}%</p>
                    <p><strong>Host Name:</strong> {deviceToShow.host_name}</p>
                    <p><strong>Device OS:</strong> {deviceToShow.os}</p>
                    <p><strong>Ports Scan Result:</strong> {deviceToShow.port_scan_result}</p>
                    <p><strong>TTL:</strong> {deviceToShow.ttl}</p>
                    <p><strong>TCP Window Size:</strong> {deviceToShow.tcp_window_size}</p>
                    <p><strong>IoT AI Reasoning:</strong> {deviceToShow.iot_reasoning}</p>
                </div>
            }
            <br/>
            <Anomalies selectedDevice={deviceToShow} />
            <br/> 
            <Log selectedDevice={deviceToShow} />
        </div>
    );
};

export default Devices;