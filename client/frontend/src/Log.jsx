import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { fetchLog, resetSlice } from './redux/logSlice';
import { SpinnerComp } from "./SpinnerComp"
import './App.css'

const Log = ({ selectedDevice }) => {
    const { log } = useSelector((state) => state.log);
    const [displaySpinner, setDisplaySpinner] = useState("none");
    const dispatch = useDispatch();
    
    useEffect (() => {
        const getInfo = async () => {
            // debugger;
            if (selectedDevice) {
                setDisplaySpinner("block");
                await dispatch(fetchLog(selectedDevice));
                setDisplaySpinner("none");
            } else {
                dispatch(resetSlice());
            }
        }
        getInfo();
    }, [selectedDevice]);

    return (
        <div style={{width: '100%', backgroundColor: '#8b7a7aff', flexGrow: 0, maxHeight: '68%', padding: '0.5rem', borderRadius: '8px', marginBottom: '1rem'}}>
            <h5>Log (Packets Summary)</h5>
            { log.length > 0 ? (
                <table style={{fontSize: '0.7rem', display: 'block', maxHeight: '90%', overflowY: 'auto', borderCollapse: 'collapse'}}>
                    <tbody style={{display: 'table', width: '100%'}}>
                        <tr style={{position: 'sticky', top: 0, backgroundColor: '#8b7070ff'}}>
                            <th>Time</th>
                            <th>src-mac</th>
                            <th>src-ip</th>
                            <th>dst-mac</th>
                            <th>dst-ip</th>
                            <th>protocol</th>
                            <th>dns_qry</th>
                        </tr>
                        {log.map((logItem, index) => (
                            <tr key={index} >
                                <td>{logItem.timestamp}</td>
                                <td>{logItem.src_mac}</td>
                                <td>{logItem.src_ip}</td>
                                <td>{logItem.dst_mac}</td>
                                <td>{logItem.dst_ip}</td>
                                <td>{logItem.protocol}</td>
                                <td>{logItem.dns_query}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
              <p>No log found.</p>
            )}       
        </div>
    );
};

export default Log;