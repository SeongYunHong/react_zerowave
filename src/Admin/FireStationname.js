import React, { useEffect, useState } from 'react';
import axios from 'axios';

function FireStationname() {
    const [firestations, setFirestations] = useState({ fsname: ''});

    useEffect(() => {
        const fetchFireStationInfo = async () => {
            try {
                const response = await axios.get('http://34.64.96.111:8081/api/firestation/info', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                console.log(response.data);
                setFirestations({
                    fsname: response.data.fsName,
                });
            } catch (error) {
                console.error('회원 정보 조회 실패', error);
            }
        };
        fetchFireStationInfo();
    },[]);
    return (
        <div></div>
    );
}
export default FireStationname;