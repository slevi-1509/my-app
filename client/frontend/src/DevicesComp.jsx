import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import './App.css'

const DevicesComp = ({ iot }) => {
    const { devices } = useSelector((state) => state.devices);
    const [ devicesToShow, setDevicesToShow] = useState([]);
    const dispatch = useDispatch();
    
    useEffect (() => {
        const getInfo = async () => {
            // debugger;
            setDevicesToShow(Object.values(devices).filter(device => Number(device.is_iot) >= iot));
        }
        getInfo();
    }, [devices, iot]);

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
                        <tr key={index} onClick={() => handle_device_click(device)}>
                            <td style={{cursor: 'pointer'}}>{device.src_mac}</td>
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