import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin_Result_Detail.css'

// 240302 수정
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus,faPersonRunning,faTruckMoving,faHelicopter,faFireExtinguisher,faSkullCrossbones,faMoneyBill,faMountainSun } from '@fortawesome/free-solid-svg-icons';



function Admin_Result_Detail() {
    const { command } = useParams();
    const [informations, setInformations] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState([]);
    const navigate = useNavigate();

    // 240302 수정
    const [allResults, setAllResults] = useState([]);


    //권한 확인------------------------------------------------------------------------------------------------------------------------------------------------------
    useEffect(() => {
        const fetchUserRole = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('관리자만 접근할 수 있는 페이지입니다.');
                navigate('/');
                return;
            }
            try {
                const response = await axios.get('http://34.64.96.111:8081/api/auth/role', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                // 관리자인지 확인
                if (!response.data.roles.includes('ROLE_ADMIN')) {
                    alert('관리자만 접근할 수 있는 페이지입니다.');
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
    //이미지 불러오기------------------------------------------------------------------------------------------------------------------------------------------------------
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://34.64.96.111:8081/api/fireSituationRoom/admin`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                // `useParams`에서 가져온 `command`가 문자열이라고 가정하고, 비교를 위해 숫자로 변환
                const commandNumber = parseInt(command, 10);
                // 응답 데이터를 필터링하여 command가 일치하는 항목만 포함
                const filteredResults = response.data.filter(item => item.command === commandNumber);
                setResults(filteredResults);

                // 240303 수정
                const sortedData = response.data.sort((a, b) => b.command - a.command);
                setAllResults(sortedData);


            } catch (error) {
                console.error('데이터를 가져오는데 실패했습니다.', error);
            }
        };

        fetchData();
    }, []);

    // 240303 수정
    // imgurl 변환 함수
    const convertImageUrl = (relativeUrl) => {
        const baseUrl = "http://34.64.96.111:8081";
        const imagePath = relativeUrl.split("static")[1].replace(/\\/g, "/");
        // 타임스탬프를 URL에 추가
        const timeStamp = new Date().getTime();
        return `${baseUrl}${imagePath}?${timeStamp}`;
    };

    //상황일지(Result 테이블 정보) 가져오기------------------------------------------------------------------------------------------------------------------------------------------------------
    useEffect(() => {
        const fetchResultDetail = async () => {
            const token = localStorage.getItem('token'); // 토큰 가져오기
            try {
                const response = await axios.get(`http://34.64.96.111:8081/api/result/${command}`);
                setInformations(response.data); // axios를 사용하므로, 바로 data에 접근
            } catch (error) {
                console.error('Error:', error);
                setError('데이터를 가져오는 데 실패했습니다.'); // 에러 메시지 수정
                alert('데이터가 없거나 데이터를 불러오는 작업에 실패하였습니다.');
                navigate('/fire/result');
            } finally {
                setIsLoading(false);
            }
        };

        fetchResultDetail();
    }, [command]);
    //------------------------------------------------------------------------------------------------------------------------------------------------------
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!informations) return <div>No result found</div>;
    //------------------------------------------------------------------------------------------------------------------------------------------------------
    const formatDateAndTime = (isoString) => {
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${year}/${month}/${day} ${hours}시 ${minutes}분 ${seconds}초`;
    };
    //------------------------------------------------------------------------------------------------------------------------------------------------------
    const gotoResult = () => {
        navigate(`/admin/result`);
    };
    //------------------------------------------------------------------------------------------------------------------------------------------------------

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

    const gotoResult_detail = (command) => {
        navigate(`/admin/result/${command}`);
    };
    // 240302 수정


    // 240303 수정
    return (
        <div className="sub_frame containerV1">
            <section className="result_detail_box">
                {results.map((result, index) => (
                    <>
                        <figure className='img'><img key={index} src={convertImageUrl(result.imgurl)} alt={`Result ${index}`} /></figure>
                        <div className="item-info textBox">
                            <div className='inner1'>
                                <p className='state'>{result.progress}</p>
                                <p className='addr'><span>[{result.command}] {result.address}</span></p>
                                <p className='date'>{formatDate(result.adate)}</p>
                            </div>
                            <ul className='inner2'>
                                <li>
                                    <p className='text1'>출동 시각</p>
                                    <p className='text2'>{formatDateAndTime(informations.dtime)}</p>
                                </li>
                                <li>
                                    <p className='text1'>종료 시간</p>
                                    <p className='text2'>{formatDateAndTime(informations.cdate)}</p>
                                </li>
                                <li>
                                    <p className='text1'>걸린 시간</p>
                                    <p className='text2'>{informations.wtime}</p>
                                </li>
                                <li>
                                    <p className='text1'>출동 인원</p>
                                    <p className='text2'>{informations.ff}명</p>
                                </li>
                                <li>
                                    <p className='text1'>출동 소방차 수</p>
                                    <p className='text2'>{informations.ftruck}대</p>
                                </li>
                                <li>
                                    <p className='text1'>출동 헬기 수</p>
                                    <p className='text2'>{informations.hc}대</p>
                                </li>
                                <li>
                                    <p className='text1'>소화수</p>
                                    <p className='text2'>{informations.fw}L</p>
                                </li>
                                <li>
                                    <p className='text1'>사상자</p>
                                    <p className='text2'>{informations.losses}명</p>
                                </li>
                                <li>
                                    <p className='text1'>피해 금액</p>
                                    <p className='text2'>{informations.lmoney}원</p>
                                </li>
                                <li>
                                    <p className='text1'>피해 면적</p>
                                    <p className='text2'>{informations.darea}ha</p>
                                </li>

                            </ul>
                        </div>
                    </>
                ))}
                <div className='iconBox'>
                    <ul>
                        <li>
                            <FontAwesomeIcon className='icon' icon={faPersonRunning} /> 
                            <p className='text'><span>{informations.ff}</span></p>
                        </li>
                        <li>
                            <FontAwesomeIcon className='icon' icon={faTruckMoving} />
                            <p className='text'><span>{informations.ftruck}</span></p>
                        </li>
                        <li>
                            <FontAwesomeIcon className='icon' icon={faHelicopter} />
                            <p className='text'><span>{informations.hc}</span></p>
                        </li>
                        <li>
                            <FontAwesomeIcon className='icon' icon={faFireExtinguisher} />
                            <p className='text'><span>{informations.fw}</span></p>
                        </li>
                        <li>
                            <FontAwesomeIcon className='icon' icon={faSkullCrossbones} />
                            <p className='text'><span>{informations.losses}</span></p>
                        </li>
                        <li>
                            <FontAwesomeIcon className='icon' icon={faMoneyBill} />
                            <p className='text'><span>{informations.lmoney}</span></p>
                        </li>
                        <li>
                            <FontAwesomeIcon className='icon' icon={faMountainSun} />
                            <p className='text'><span>{informations.darea}</span></p>
                        </li>
                    </ul>
                </div>
                

                
            </section>

            <div className='result_detail_btn_wrap'>
                <button onClick={gotoResult}>목록으로</button>
            </div>

            <section className={`result_gallery`}>
                {allResults.length > 0 ? (
                    allResults.map((result, index) => (
                        <div className="item" key={index}>
                            <figure className='img' onClick={() => gotoResult_detail(result.command)}>
                                <img src={convertImageUrl(result.imgurl)} alt={`Result ${index}`} />
                                <span className='hover_bg'><FontAwesomeIcon className="icon" icon={faCirclePlus} /></span>
                            </figure>
                            <div className="item-info textBox">
                                <p className='addr'><b>[{result.command}]</b> {result.address}</p>
                                <div className='inner1'>
                                    <p className='date'>{formatDate(result.adate)}</p>
                                    <span className='icon'>|</span>
                                    <p className='state'>{result.progress}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>글이 없습니다.</p>
                )}
            </section>
        </div>
    );
    // 240303 수정
}
export default Admin_Result_Detail;