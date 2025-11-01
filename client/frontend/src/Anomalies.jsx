import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import './App.css'

const Anomalies = ({ selectedDevice }) => {
    // const { selectedDevice } = useSelector((state) => state.devices);
    const { anomalies } = useSelector((state) => state.anomalies);
    const { router_mac } = useSelector((state) => state.devices);
    const [anomaliesToShow, setAnomaliesToShow] = useState(anomalies);
    const [anomalies_title, setAnomaliesTitle] = useState('');

    useEffect (() => {
        const getInfo = async () => {
            // debugger;
            if (!selectedDevice) {
                setAnomaliesToShow(anomalies);
                setAnomaliesTitle('for all devices');
            } else {
                setAnomaliesToShow(anomalies.filter(anomaly => anomaly.src_mac === selectedDevice || anomaly.dst_mac === selectedDevice));
                setAnomaliesTitle(`for device: ${selectedDevice}`);
            }
        }
        getInfo();
    }, [anomalies, selectedDevice]);

    return (
        <div style={{display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%', backgroundColor: '#8f4f4fff', flexGrow: 1, maxHeight: '88%', padding: '0.5rem', borderRadius: '8px', marginBottom: '0.5rem'}}>
            <h5>Anomalies <span style={{ fontSize: '1rem', color: 'darkgray' }}>({anomalies_title})</span></h5>
            { anomaliesToShow.length > 0 ? (
                <table style={{fontSize: '0.7rem', display: 'block', maxHeight: '94%', overflowY: 'auto', borderCollapse: 'collapse'}}>
                    <tbody style={{display: 'table', width: '100%'}}>
                        <tr style={{position: 'sticky', top: -1, backgroundColor: '#8b7070ff'}}>
                            <th>Time</th>
                            <th>src-mac</th>
                            <th>src-ip</th>
                            <th>dst-mac</th>
                            <th>dst-ip</th>
                            <th>protocol</th>
                            <th>dns_qry</th>
                        </tr>
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