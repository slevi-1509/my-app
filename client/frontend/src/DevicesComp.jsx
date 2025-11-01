import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedDevice } from './redux/devicesSlice';
import './App.css'

const DevicesComp = ({ parameters }) => {
    const { devices } = useSelector((state) => state.devices);
    const [ devicesToShow, setDevicesToShow] = useState([]);
    const dispatch = useDispatch();
    
    useEffect (() => {
        const getInfo = () => {
            // debugger;
            setDevicesToShow(Object.values(devices).filter(device => Number(device.is_iot) >= parameters.iot_probability));
        }
        getInfo();
    }, [devices, parameters.iot_probability]);

    const handle_device_click = (device) => {
        // let { src_mac } = device;
        dispatch(setSelectedDevice(device.src_mac));
    }

    return (
        <div style={{backgroundColor: '#8b7a7aff', flexGrow: 1, padding: '0.5rem', minHeight: 0, maxHeight: '66%', borderRadius: '8px', marginBottom: '1rem'}}>
            <h5>Registered Devices <span style={{ fontSize: '1rem', color: 'darkgray' }}>(on router: {parameters.interface})</span> </h5>
            {devicesToShow.length > 0 ? (
                <table style={{fontSize: '0.7rem', display: 'block', maxHeight: '92%', overflowY: 'auto', borderCollapse: 'collapse'}}>
                    <tbody style={{display: 'table', width: '100%'}}>
                        <tr style={{position: 'sticky', top: 1, backgroundColor: '#8b7070ff'}}>
                            <th>Mac</th>
                            <th>IP</th>
                            <th>OS</th>
                            <th>Vendor</th>
                            <th>Hostname</th>
                            <th>is_IoT</th>
                            <th>Time</th>
                        </tr>
                        {devicesToShow.map((device, index) => (
                            <tr style={{cursor: 'pointer'}} key={index} onClick={() => handle_device_click(device)}>
                                <td>{device.src_mac}</td>
                                <td>{device.src_ip}</td>
                                <td>{device.os}</td>
                                <td>{device.vendor}</td>
                                <td>{device.host_name}</td>
                                <td>{device.is_iot}%</td>
                                <td>{device.timestamp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No devices found.</p>
            )}
      </div>
    );
};

export default DevicesComp;