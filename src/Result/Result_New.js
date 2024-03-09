import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Result_New.css';

function Result_New() {
    const {command} = useParams();
    const [resultData, setResultData] = useState({
        dtime: '',
        cdate: '',
        wtime: '',
        ff: 0,
        ftruck: 0,
        hc: 0,
        fw: 0,
        losses: 0,
        lmoney: 0,
        darea: 0,
        fireSituationRoom: 0,
    });
    const [results, setResults] = useState([]);
    const navigate = useNavigate();
    
    //------------------------------------------------------------------------------------------------------------------------------------------------------
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://34.64.96.111:8081/api/fireSituationRoom`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setResults(response.data);
            } catch (error) {
                console.error('데이터를 가져오는데 실패했습니다.', error);
            }
        };

        fetchData();
    }, []);
    //------------------------------------------------------------------------------------------------------------------------------------------------------
    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;
        // 숫자 필드의 경우, 값을 숫자로 변환
        if (['ff', 'ftruck', 'hc', 'fw', 'losses', 'lmoney', 'darea'].includes(name)) {
            newValue = value ? parseInt(value, 10) : 0;
        }

        let newResult = { ...resultData, [name]: value };
        if (name === 'dtime' || name === 'cdate') {
            const dtimeValue = (name === 'dtime') ? value : resultData.dtime;
            const cdateValue = (name === 'cdate') ? value : resultData.cdate;

            if (dtimeValue && cdateValue) {
                const wtimeValue = calculateTimeDifference(dtimeValue, cdateValue);
                newResult = { ...newResult, wtime: wtimeValue };
            }
        }
        setResultData(newResult);
    };
    //------------------------------------------------------------------------------------------------------------------------------------------------------
    const handleResultSubmit = async (e) => {
        e.preventDefault();
        const updatedResult = {
            ...resultData,
            dtime: convertToUTC(resultData.dtime),
            cdate: convertToUTC(resultData.cdate),
            fireSituationRoom: command,
        };
        console.log(command)
        try {
            const response = await axios.post('http://34.64.96.111:8081/api/result', updatedResult);
            // await axios.post(`http://34.64.96.111:8081/api/fireReception/complete/${command}`);
            alert('진화 완료로 상태가 변경되었습니다.');
            navigate('/fire/result');
        } catch (error) {
            console.error('Error posting result', error);
        }
    };
    //------------------------------------------------------------------------------------------------------------------------------------------------------
    const convertToUTC = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString();
    };
    //------------------------------------------------------------------------------------------------------------------------------------------------------
    const calculateTimeDifference = (dtime, cdate) => {
        const dtimeDate = new Date(dtime);
        const cdateDate = new Date(cdate);
        const diffMs = Math.abs(cdateDate - dtimeDate);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffMinutes = Math.floor((diffMs % 3600000) / 60000);
        return `${diffHours}시간 ${diffMinutes}분`;
    };

    //------------------------------------------------------------------------------------------------------------------------------------------------------
    // imgurl 변환 함수
    const convertImageUrl = (relativeUrl) => {
        const baseUrl = "http://34.64.96.111:8081";
        const imagePath = relativeUrl.split("static")[1].replace(/\\/g, "/");
        return `${baseUrl}${imagePath}`;
    };
    //------------------------------------------------------------------------------------------------------------------------------------------------------
    return (
        <div className="Result" >
            <div className="Card">
                {results.map((result, index) => (
                    <img key={index} src={convertImageUrl(result.imgurl)} alt={`Result ${index}`} />
                ))}
                <form onSubmit={handleResultSubmit}>
                    <div><label>출동 시각: <input name="dtime" type="datetime-local" value={resultData.dtime} onChange={handleChange} /></label></div>
                    <div><label>종료 시간: <input name="cdate" type="datetime-local" value={resultData.cdate} onChange={handleChange} /></label></div>
                    <div><label>걸린 시간: <input name="wtime" type="text" value={resultData.wtime} readOnly /></label></div>
                    <div><label>출동 인원: <input name="ff" type="number" value={resultData.ff} onChange={handleChange} /></label></div>
                    <div><label>출동 소방차: <input name="ftruck" type="number" value={resultData.ftruck} onChange={handleChange} /></label></div>
                    <div><label>출동 헬기: <input name="hc" type="number" value={resultData.hc} onChange={handleChange} /></label></div>
                    <div><label>소화수: <input name="fw" type="number" value={resultData.fw} onChange={handleChange} /></label></div>
                    <div><label>사상자: <input name="losses" type="number" value={resultData.losses} onChange={handleChange} /></label></div>
                    <div><label>피해 금액: <input name="lmoney" type="number" value={resultData.lmoney} onChange={handleChange} /></label></div>
                    <div><label>피해 면적: <input name="darea" type="number" value={resultData.darea} onChange={handleChange} /></label></div>
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div >
    );
}

export default Result_New;