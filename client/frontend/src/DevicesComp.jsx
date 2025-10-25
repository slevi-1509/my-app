import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedDevice } from './redux/devicesSlice';
import './App.css'

const DevicesComp = ({ iot }) => {
    const { devices } = useSelector((state) => state.devices);
    const [ devicesToShow, setDevicesToShow] = useState([]);
    const dispatch = useDispatch();
    
    useEffect (() => {
        const getInfo = () => {
            // debugger;
            setDevicesToShow(Object.values(devices).filter(device => Number(device.is_iot) >= iot));
        }
        getInfo();
    }, [devices, iot]);

    const handle_device_click = (device) => {
        // let { src_mac } = device;
        dispatch(setSelectedDevice(device.src_mac));
    }

    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {devicesToShow.length > 0 ? (
                <table style={{fontSize: '0.7rem', width: '95%', borderCollapse: 'collapse'}}>
                    <thead>
                    <tr>
                        <th>Mac</th>
                        <th>IP</th>
                        <th>OS</th>
                        <th>Vendor</th>
                        <th>Hostname</th>
                        <th>is_IoT</th>
                    </tr>
                    </thead>
                    <tbody>
                    {devicesToShow.map((device, index) => (
                        <tr style={{cursor: 'pointer'}}key={index} onClick={() => handle_device_click(device)}>
                            <td>{device.src_mac}</td>
                            <td>{device.src_ip}</td>
                            <td>{device.os}</td>
                            <td>{device.vendor}</td>
                            <td>{device.host_name}</td>
                            <td>{device.is_iot}%</td>
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