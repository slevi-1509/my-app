import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { fetchLog } from './redux/logSlice';
import './App.css'

const Log = ({ selectedDevice }) => {
    const { log } = useSelector((state) => state.log);
    const dispatch = useDispatch();
    
    useEffect (() => {
        const getInfo = async () => {
            // debugger;
            if (selectedDevice != null) {
                getLog();
            }
        }
        getInfo();
    }, [selectedDevice]);

    const getLog = () => {
        dispatch(fetchLog( selectedDevice.src_mac ));
    }

    return (
        <div>
            <h3>Log (Packets Summary):</h3>   
            { log.length > 0 ? (
                <table style={{fontSize: '0.7rem', display: 'block', width: 'fit-content', height: '20rem', overflowY: 'auto', borderCollapse: 'collapse'}}>
                    <thead>
                        <tr style={{position: 'sticky', top: 0, backgroundColor: '#8b7070ff'}}>
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