import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import "./Result_Update.css";

function Result_Update() {
    const { command } = useParams();
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
    });
    const [informationss, setInformations] = useState([]);
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    //------------------------------------------------------------------------------------------------------------------------------------------------------
    useEffect(() => {
        const fetchUserRole = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('소방팀만 접근할 수 있는 페이지입니다.');
                navigate('/');
                return;
            }
            try {
                const response = await axios.get('http://34.64.96.111:8081/api/auth/role', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                // 소방팀인지 확인
                if ((!response.data.roles.includes('ROLE_FIRETEAM')) && !response.data.roles.includes('ROLE_ADMIN')) {
                    alert('소방팀만 접근할 수 있는 페이지입니다.');
                    navigate('/');
                    return;
                }
            } catch (error) {
                console.error('Role fetching failed', error);
                navigate('/');
            }
        };
        fetchUserRole();
    }, [navigate]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://34.64.96.111:8081/api/fireSituationRoom`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                // `useParams`에서 가져온 `command`가 문자열이라고 가정하고, 비교를 위해 숫자로 변환
                const commandNumber = parseInt(command, 10);
                // 응답 데이터를 필터링하여 command가 일치하는 항목만 포함
                const filteredResults = response.data.filter(item => item.command === commandNumber);
                setResults(filteredResults);
            } catch (error) {
                console.error('데이터를 가져오는데 실패했습니다.', error);
            }
        };

        fetchData();
    }, [command]);
    //------------------------------------------------------------------------------------------------------------------------------------------------------
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`http://34.64.96.111:8081/api/result/${command}`);
                setInformations(response.data);
            } catch (error) {
                console.error('데이터를 불러오는 데 실패했습니다.', error);
                setError('데이터를 불러오는 데 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [command]);
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        // dtime과 cdate를 UTC로 변환
        const updatedResult = {
            ...resultData,
            dtime: convertToUTC(resultData.dtime),
            cdate: convertToUTC(resultData.cdate),
        };
        try {
            await axios.put(`http://34.64.96.111:8081/api/result/${command}`, updatedResult);
            alert('데이터가 성공적으로 수정되었습니다.');
            navigate('/fire/result'); // 수정 후 리다이렉트할 경로 설정
        } catch (error) {
            console.error('데이터 수정 실패', error);
            setError('데이터 수정 실패');
        } finally {
            setIsLoading(false);
        }
    };
    //------------------------------------------------------------------------------------------------------------------------------------------------------
    const convertToUTC = (dateString) => {
        const date = new Date(dateString);
        const year = date.getUTCFullYear();
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = date.getUTCDate().toString().padStart(2, '0');
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const seconds = date.getUTCSeconds().toString().padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };
    //------------------------------------------------------------------------------------------------------------------------------------------------------
    const calculateTimeDifference = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const difference = endDate - startDate;

        const minutes = Math.floor(difference / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        return `${hours}시간 ${remainingMinutes}분`;
    };
    //------------------------------------------------------------------------------------------------------------------------------------------------------
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    //------------------------------------------------------------------------------------------------------------------------------------------------------
    // imgurl 변환 함수
    const convertImageUrl = (relativeUrl) => {
        const baseUrl = "http://34.64.96.111:8081";
        const imagePath = relativeUrl.split("static")[1].replace(/\\/g, "/");
        return `${baseUrl}${imagePath}`;
    };

    const gotoResult = () => {
        navigate(`/fire/result`);
    };

    // 240303 수정
    // progress 값에 따라 클래스 이름을 결정하는 함수
    const getProgressClass = (progress) => {
        switch (progress) {
            case '진화 중':
                return 'inner1 progress-in-action';
            case '진화 완료':
                return 'inner1 progress-completed';
            case '산불 외 종료':
                return 'inner1 progress-external-completed';
            default:
                return 'inner1';
        }
    };
    // 240303 수정

    // 날짜 포맷 변환 함수
    const formatDate = (dateString) => {
        if (!dateString) {
            return "날짜 정보 없음";
        }

        // DB에서 받은 날짜 문자열을 Date 객체로 변환
        const date = new Date(dateString);

        // YYYY.MM.DD 형식으로 날짜 포매팅
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth()는 0부터 시작하므로 1을 더해줍니다.
        const day = String(date.getDate()).padStart(2, '0');

        // 포매팅된 문자열 반환
        return `${year}.${month}.${day}`;
    };
    //------------------------------------------------------------------------------------------------------------------------------------------------------
    return (
        <div className="sub_frame containerV1" >
            <section className="result_update_box">
                {results.map((result, index) => {
                    // progress에 기반한 클래스 이름을 결정
                    const progressClass = getProgressClass(result.progress);
                    return (
                        <>
                            <figure className='img'><img key={index} src={convertImageUrl(result.imgurl)} alt={`Result ${index}`} /></figure>
                            <div className="item-info textBox">
                                <div className={progressClass}>
                                    <p className='state'>{result.progress}</p>
                                    <p className='addr'><span>[{result.command}] {result.address}</span></p>
                                    <p className='date'>{formatDate(result.adate)}</p>
                                </div>
                                <form className='inner2' onSubmit={handleSubmit}>
                                    <ul>
                                        <li>
                                            <p className='text1'>출동 시각</p>
                                            <p className='text2'>
                                                <input name="dtime" type="datetime-local" value={resultData.dtime} onChange={handleChange} />
                                            </p>
                                        </li>
                                        <li>
                                            <p className='text1'>종료 시간</p>
                                            <p className='text2'><input name="cdate" type="datetime-local" value={resultData.cdate} onChange={handleChange} /></p>
                                        </li>
                                        <li>
                                            <p className='text1'>걸린 시간</p>
                                            <p className='text2'>{resultData.wtime}</p>
                                        </li>
                                        <li>
                                            <p className='text1'>출동 인원</p>
                                            <p className='text2'><input name="ff" type="number" value={resultData.ff} onChange={handleChange} />명</p>
                                        </li>
                                        <li>
                                            <p className='text1'>출동 소방차 수</p>
                                            <p className='text2'><input name="ftruck" type="number" value={resultData.ftruck} onChange={handleChange} />대</p>
                                        </li>
                                        <li>
                                            <p className='text1'>출동 헬기 수</p>
                                            <p className='text2'><input name="hc" type="number" value={resultData.hc} onChange={handleChange} />대</p>
                                        </li>
                                        <li>
                                            <p className='text1'>소화수</p>
                                            <p className='text2'><input name="fw" type="number" value={resultData.fw} onChange={handleChange} />L</p>
                                        </li>
                                        <li>
                                            <p className='text1'>사상자</p>
                                            <p className='text2'><input name="losses" type="number" value={resultData.losses} onChange={handleChange} />명</p>
                                        </li>
                                        <li>
                                            <p className='text1'>피해 금액</p>
                                            <p className='text2'><input name="lmoney" type="number" value={resultData.lmoney} onChange={handleChange} />원</p>
                                        </li>
                                        <li>
                                            <p className='text1'>피해 면적</p>
                                            <p className='text2'><input name="darea" type="number" value={resultData.darea} onChange={handleChange} />ha</p>
                                        </li>
                                        <li className='submitBox'><button type="submit">수정하기</button></li>
                                    </ul>
                                </form>
                            </div>
                        </>
                    );
                })}

            </section>

            <div className='result_update_btn_wrap'>
                <button onClick={gotoResult}>목록으로</button>
            </div>
        </div>
    );
}

export default Result_Update;