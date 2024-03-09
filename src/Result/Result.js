import React, { useState, useEffect } from 'react';
// 240303 수정
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// 240228 수정
import { jwtDecode } from 'jwt-decode';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
// 240228 수정

import './Result.css';

// 240303 수정
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faFire } from '@fortawesome/free-solid-svg-icons';

function Result() {
    const [results, setResults] = useState([]);
    const navigate = useNavigate();

    // 240228 수정
    const [messages, setMessages] = useState([]);

    // 240302 수정
    const [animate, setAnimate] = useState(false);

    //------------------------------------------------------------------------------------------------------------------------------------------------------

    // 240228 수정
    useEffect(() => {
        // JWT 토큰에서 사용자의 FireStation fs 값을 디코드하여 추출
        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);
        const userFs = decoded.fs; // fs 값이 토큰에 포함되어 있어야 합니다.

        const socket = new SockJS('http://34.64.96.111:8081/kafka'); // 스프링부트 서버의 WebSocket 엔드포인트 URL
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log('Connected to the WebSocket server');
                client.subscribe(`/topic/firestation/${userFs}`, (message) => {
                    console.log('Received message:', message.body);
                    try {
                        const newMessage = JSON.parse(message.body);
                        setMessages(prevMessages => [newMessage, ...prevMessages]);
                        // setResults(prevResults => [newMessage, ...prevResults]);

                        // 240303 수정
                        setAnimate(true); // 필터링 후 애니메이션 상태를 true로 설정
                        setTimeout(() => setAnimate(false), 500); // 애니메이션 지속시간 후 false로 설정
                        // 240303 수정
                    } catch (error) {
                        console.error('Error parsing message:', error);
                    }
                });
            },
            onDisconnect: () => {
                console.log('Disconnected from the WebSocket server');
            },
            // 연결 에러 핸들링
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, []);
    // 240228 수정

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
    //------------------------------------------------------------------------------------------------------------------------------------------------------

    //240303 수정
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://34.64.96.111:8081/api/fireSituationRoom`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                // console.log(response.data);
                const sortedData = response.data.sort((a, b) => b.command - a.command);
                setResults(sortedData);
                console.log(sortedData);
                // 240302 수정
                setAnimate(true); // 필터링 후 애니메이션 상태를 true로 설정
                setTimeout(() => setAnimate(false), 500); // 애니메이션 지속시간 후 false로 설정
                // 240302 수정

            } catch (error) {
                console.error('데이터를 가져오는데 실패했습니다.', error);
            }
        };

        fetchData();
    }, []);

    //------------------------------------------------------------------------------------------------------------------------------------------------------

    // 240303 수정
    // imgurl 변환 함수
    const convertImageUrl = (relativeUrl) => {
        const baseUrl = "http://34.64.96.111:8081";
        const imagePath = relativeUrl.split("static")[1].replace(/\\/g, "/");
        // 타임스탬프를 URL에 추가
        const timeStamp = new Date().getTime();
        return `${baseUrl}${imagePath}?${timeStamp}`;
    };

    //------------------------------------------------------------------------------------------------------------------------------------------------------

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
    const gotoResult = (command) => {
        navigate(`/fire/result/${command}`);
    };
    //------------------------------------------------------------------------------------------------------------------------------------------------------
    const gotoNewResult = (command) => {
        navigate(`/fire/result/new/${command}`);
    };
    //------------------------------------------------------------------------------------------------------------------------------------------------------
    const gotoUpdateResult = (command) => {
        navigate(`/fire/result/update/${command}`);
    };
    //------------------------------------------------------------------------------------------------------------------------------------------------------

    // 240303 수정
    // 메시지의 state에 따라 클래스 이름을 결정하는 함수
    const getItemClass = (messageState) => {
        switch (messageState) {
            case 'fire and smoke':
                return 'item fire-and-smoke';
            case 'smoke':
                return 'item smoke';
            case 'fire':
                return 'item fire';
            case 'no object':
                return 'item no-object';
            default:
                return 'item';
        }
    };

    // 240303 수정
    // progress 값에 따라 클래스 이름을 결정하는 함수
    const getProgressClass = (progress) => {
        switch (progress) {
            case '진화 중':
                return 'item progress-in-action';
            case '진화 완료':
                return 'item progress-completed';
            case '산불 외 종료':
                return 'item progress-external-completed';
            default:
                return 'item';
        }
    };

    // 상태에 따른 이미지 URL 반환 함수
    const getImageUrlByState = (state) => {
        switch (state) {
            case 'fire and smoke':
                return "/images/fire_and_smoke.jpg";
            case 'fire':
                return "/images/fire.jpg";
            case 'smoke':
                return "/images/smoke.jpg";
            case 'no object':
                return "/images/no_object.jpg";
            default:
                return ""; // 기본 이미지 경로 또는 처리
        }
    };


    // 240303 수정
    return (
        <div className="sub_frame containerV1">

            {/* 240303 수정 */}
            <section className={`message_list ${animate ? 'fade-in' : ''}`}>
                {messages.length > 0 && (
                    <div className="messages-header">
                        <FontAwesomeIcon icon={faFire} />
                        <h2>상황 발생</h2>
                    </div>
                )}
                {messages.length === 0 ? (
                    <></>
                ) : (
                    messages.slice(0, 5).map((message, idx) => {
                        const itemClass = getItemClass(message.state);
                        return (
                            <div className={itemClass} key={message.command}>
                                <Link className='link' to={`/fire/result/${message.command}`}>
                                    <figure className='img'>
                                        <img src={getImageUrlByState(message.state)} alt={`Result ${message.command}`} />
                                    </figure>
                                    <span className="addr">
                                        <b>[{message.command}]</b> <span>{message.address}</span>
                                    </span>
                                </Link>
                            </div>
                        );
                    })
                )}
            </section>


            <section className={`result_gallery ${animate ? 'fade-in' : ''}`}>
                {results.length > 0 ? (
                    results.map((result, index) => {
                        // progress에 기반한 클래스 이름을 결정
                        const progressClass = getProgressClass(result.progress);
                        return (
                            <div className={progressClass} key={index}>
                                <figure className='img' onClick={() => gotoResult(result.command)}>
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
                                {/* 240304 수정 */}
                                <div className="submitBox">
                                    <button onClick={() => gotoUpdateResult(result.command)}>수정하기</button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className='zerowave_text_none'>신고접수된 게시글이 없습니다.</p>
                )}
            </section>
        </div>
    );
    // 240303 수정
}

export default Result;