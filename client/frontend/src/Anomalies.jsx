import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { Link, useParams } from "react-router-dom"
import { Stack } from "@mui/material"
import { fetchAnomalies } from './redux/anomaliesSlice';
import './App.css'

const Anomalies = ({ selectedDevice }) => {
    const { anomalies } = useSelector((state) => state.anomalies);
    const { router_mac } = useSelector((state) => state.devices);
    const [anomaliesToShow, setAnomaliesToShow] = useState(anomalies);
    const SERVER_URL = `http://localhost:8000`
    const dispatch = useDispatch();
    
    useEffect (() => {
        const getInfo = async () => {
            // debugger;
            if (selectedDevice == {} || Object.keys(selectedDevice).length === 0) {
                setAnomaliesToShow(anomalies);
            } else {
                setAnomaliesToShow(anomalies.filter(anomaly => anomaly.src_mac === selectedDevice.src_mac));
            }
        }
        getInfo();
    }, [anomalies, selectedDevice]);

    return (
        <div>
            <h3>Anomalies:</h3>   
            { anomaliesToShow.length > 0 ? (
                <table style={{fontSize: '0.7rem', width: '95%', borderCollapse: 'collapse'}}>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>src-mac</th>
                            <th>src-ip</th>
                            <th>dst-mac</th>
                            <th>dst-ip</th>
                            <th>protocol</th>
                            <th>dns_qry</th>
                        </tr>
                    </thead>
                    <tbody>
                    {anomaliesToShow.map((anomaly, index) => (
                        <tr key={index} >
                            <td>{anomaly.timestamp}</td>
                            <td>{anomaly.src_mac}</td>
                            <td>{anomaly.src_ip}</td>
                            <td>{anomaly.dst_mac}</td>
                            <td>{anomaly.dst_ip}</td>
                            <td>{anomaly.protocol}</td>
                            <td>{anomaly.dns_query}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
              <p>No anomalies found.</p>
            )}  
        </div>
    );
};

export default Anomalies;