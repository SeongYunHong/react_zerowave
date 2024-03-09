/* global kakao */
import React from "react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationCrosshairs, faTemperatureThreeQuarters, faDroplet, faCloudShowersHeavy, faWind } from '@fortawesome/free-solid-svg-icons';

import './Mainpage.css';

const loadKakaoMapsScript = (appKey) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    document.head.appendChild(script);
    return script;
};

function Mainpage() {
    const [counts, setCounts] = useState({ 진화중: 0, 진화완료: 0, 산불외종료: 0, });
    const [notices, setNotices] = useState([]);
    const navigate = useNavigate();
    const mapRef = useRef(null); // 지도를 담을 ref 생성
    const [map, setMap] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [address, setAddress] = useState(''); // 주소 정보를 저장할 새로운 상태 변수
    const [mountain, setMountain] = useState(null);

    // 좌표 변환 상수
    const RE = 6371.00877; // 지구 반지름 (km)
    const GRID = 5.0; // 격자 간격 (km)
    const SLAT1 = 30.0; // 투영 위도 1 (도)
    const SLAT2 = 60.0; // 투영 위도 2 (도)
    const OLON = 126.0; // 기준 경도 (도)
    const OLAT = 38.0; // 기준 위도 (도)
    const XO = 43; // 원점 X 좌표 (GRID)
    const YO = 136; // 원점 Y 좌표 (GRID)

    // LCC DFS 좌표 변환 함수
    function dfs_xy_conv(code, v1, v2) {
        const DEGRAD = Math.PI / 180.0;
        const RADDEG = 180.0 / Math.PI;

        const re = RE / GRID;
        const slat1 = SLAT1 * DEGRAD;
        const slat2 = SLAT2 * DEGRAD;
        const olon = OLON * DEGRAD;
        const olat = OLAT * DEGRAD;

        let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
        sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
        let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
        sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
        let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
        ro = re * sf / Math.pow(ro, sn);
        let rs = {};
        if (code === "toXY") {
            rs['lat'] = v1;
            rs['lng'] = v2;
            let ra = Math.tan(Math.PI * 0.25 + (v1) * DEGRAD * 0.5);
            ra = re * sf / Math.pow(ra, sn);
            let theta = v2 * DEGRAD - olon;
            if (theta > Math.PI) theta -= 2.0 * Math.PI;
            if (theta < -Math.PI) theta += 2.0 * Math.PI;
            theta *= sn;
            rs['x'] = Math.floor(ra * Math.sin(theta) + XO + 0.5);
            rs['y'] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
        }
        return rs;
    }

    function calculateWindDirection(u, v) {
        // UUU와 VVV 값을 사용하여 풍향 계산
        const angle = Math.atan2(u, v) * (180 / Math.PI);
        const degrees = (angle < 0 ? angle + 360 : angle);

        if (degrees > 315 || degrees <= 45) {
            return '북쪽 - 북동쪽';
        } else if (degrees > 45 && degrees <= 90) {
            return '북동쪽 - 북쪽';
        } else if (degrees > 90 && degrees <= 135) {
            return '동쪽 - 남동쪽';
        } else if (degrees > 135 && degrees <= 180) {
            return '남동쪽 - 동쪽';
        } else if (degrees > 180 && degrees <= 225) {
            return '남쪽 - 남서쪽';
        } else if (degrees > 225 && degrees <= 270) {
            return '남서쪽 - 남쪽';
        } else if (degrees > 270 && degrees <= 315) {
            return '서쪽 - 북서쪽';
        } else {
            return '북서쪽 - 서쪽';
        }
    }

    // 기상청 API를 사용하여 날씨 데이터 가져오기
    const fetchWeatherData = (gridX, gridY) => {
        // 현재 시간 기준으로 baseDate 및 baseTime 설정
        const now = new Date();
        let baseDate;
        let baseTime;

        if (now.getMinutes() >= 40) {
            // 40분 이후이면 현재 시간을 사용
            baseDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
            baseTime = `${String(now.getHours()).padStart(2, '0')}00`;
        } else {
            // 40분 이전이면 한 시간 전 데이터를 사용
            now.setHours(now.getHours() - 1);
            baseDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
            baseTime = `${String(now.getHours()).padStart(2, '0')}00`;
        }

        const encodedServiceKey = 'BHpQTexrH%2FOEjVR2zDPhMQ3v%2FZkfRBCR5LD8YR6iUBG8td9NeFggtx2yNVB6w4ttERGo7dTzRq5OTkCnC40zfw%3D%3D'; // 여기에 실제 인코딩된 서비스 키를 사용하세요.
        const url = `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst`;
        const queryParams = `?serviceKey=${encodedServiceKey}&pageNo=1&numOfRows=10&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${gridX}&ny=${gridY}`;

        fetch(url + queryParams)
            .then(response => response.json())
            .then(data => {
                // console.log(data); // API 응답 로깅
                if (data.response.header.resultCode === "00" && data.response.body.items.item.length > 0) {
                    const { T1H, REH, RN1, UUU, VVV, WSD } = data.response.body.items.item.reduce((acc, current) => {
                        acc[current.category] = current.obsrValue;
                        return acc;
                    }, {});
                    setWeatherData({ T1H, REH, RN1, UUU, VVV, WSD });
                } else {
                    console.error('날씨 데이터를 가져오는 데 실패했습니다.', data.response.header.resultMsg);
                }
            })
            .catch(error => {
                console.error('날씨 데이터를 가져오는 중 오류:', error);
            });
    };


    // 현재 위치 가져오기 및 지도에 마커 표시
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const grid = dfs_xy_conv("toXY", lat, lon);

                // 지도의 중심을 현재 위치로 이동
                const moveLatLon = new kakao.maps.LatLng(lat, lon);
                if (map) {
                    map.setCenter(moveLatLon);

                    // 현재 위치에 새로운 마커 생성
                    const marker = new kakao.maps.Marker({
                        position: moveLatLon
                    });
                    marker.setMap(map);
                }

                // 날씨 데이터 가져오기
                fetchWeatherData(grid.x, grid.y);

                // 주소 정보 가져오기
                const geocoder = new kakao.maps.services.Geocoder();
                const coord = new kakao.maps.LatLng(lat, lon);
                const callback = function (result, status) {
                    if (status === kakao.maps.services.Status.OK) {
                        // console.log('현재 위치의 주소는 ' + result[0].address.address_name + ' 입니다.');
                        setAddress(result[0].address.address_name);
                    }
                };

                geocoder.coord2Address(coord.getLng(), coord.getLat(), callback);
            }, () => {
                alert('위치 정보를 가져올 수 없습니다.');
            });
        } else {
            alert('이 브라우저에서는 Geolocation이 지원되지 않습니다.');
        }
    };

    // 지도 초기화
    useEffect(() => {
        const appKey = 'f6bac856fcd6429389ace76f13ffaf23';
        const script = document.createElement('script');
        script.async = true;
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services,clusterer,drawing`;
        document.head.appendChild(script);

        script.onload = () => {
            kakao.maps.load(() => {
                const mapContainer = mapRef.current;
                const mapOption = {
                    center: new kakao.maps.LatLng(33.450701, 126.570667),
                    level: 3
                };

                const kakaoMap = new kakao.maps.Map(mapContainer, mapOption);
                setMap(kakaoMap);

                // 확대 축소 컨트롤 생성
                var zoomControl = new kakao.maps.ZoomControl();
                kakaoMap.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

                // 지도 타입 컨트롤 생성
                var mapTypeControl = new kakao.maps.MapTypeControl();
                kakaoMap.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

            });
        };

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    // 날짜 형식 변환
    function formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear(); // 년도
        const month = ('0' + (d.getMonth() + 1)).slice(-2); // 월
        const day = ('0' + d.getDate()).slice(-2); // 일
        return { year, month, day };
    }

    // 산불 현황
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 상태 코드에 따라 요청
                const responses = await Promise.all([
                    axios.get('http://34.64.96.111:8081/api/fireReception/count/0'),
                    axios.get('http://34.64.96.111:8081/api/fireReception/count/1'),
                    axios.get('http://34.64.96.111:8081/api/fireReception/count/2'),
                ]);
                // 응답에서 데이터 설정
                setCounts({
                    진화중: responses[0].data,
                    진화완료: responses[1].data,
                    산불외종료: responses[2].data,
                });
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    // 공지사항
    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const response = await axios.get('http://34.64.96.111:8081/api/notice');
                // console.log(response.data);
                setNotices(response.data);
            } catch (error) {
                console.error('공지사항 데이터를 불러오는 데 실패했습니다.', error);
            }
        };

        fetchNotices();
    }, []);

    const gotoNotice = () => {
        navigate('/notice');
    }

    useEffect(() => {
        const fetchMountain = async () => {
            try {
                const response = await axios.get('http://34.64.96.111:8081/api/mountain/main');
                setMountain(response.data);
            } catch (error) {
                console.error('등산로 데이터를 불러오는 데 실패했습니다.', error);
            }
        };

        fetchMountain();
    }, []);

    // imgurl 변환 함수
    const convertImageUrl = (relativeUrl) => {
        const baseUrl = "http://34.64.96.111:8081";
        const imagePath = relativeUrl.split("static")[1].replace(/\\/g, "/");
        return `${baseUrl}${imagePath}`;
    };

    return (
        <>
            <main className='index'>
                <div className='bg'></div>
                <div className='containerV1'>
                    <article className='itemBox'>
                        <section className={`map_wrap ${map ? 'fade-in' : ''}`}>
                            <div className="inner">
                                <div className="item" ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
                            </div>
                        </section>
                        <section className='right_contents'>
                            <ul className='fire_state_box'>
                                <li className="item1">
                                    <figure className="img"><img src="/images/jinhwajung.png" /></figure>
                                    <div className="text_box">
                                        <p className='text1'>진화 중</p>
                                        <span className="count">{counts.진화중}</span>
                                    </div>
                                </li>
                                <li className="item2">
                                    <figure className="img"><img src="/images/jinhwawanryo.png" /></figure>
                                    <div className="text_box">
                                        <p className='text1'>진화 완료</p>
                                        <span className="count">{counts.진화완료}</span>
                                    </div>
                                </li>
                                <li className="item3">
                                    <figure className="img"><img src="/images/sanburoejongryo.png" /></figure>
                                    <div className="text_box">
                                        <p className='text1'>산불 외 종료</p>
                                        <span className="count">{counts.산불외종료}</span>
                                    </div>
                                </li>
                            </ul>
                            <div className='gi_shang_chung'>
                                <div className={`title_box ${address ? 'fade-in' : ''}`}>
                                    {address ? (
                                        <p className="text1">
                                            <FontAwesomeIcon className="icon" icon={faLocationCrosshairs} />
                                            {address}
                                        </p> // 주소 정보가 있을 때
                                    ) : (
                                        <p className="text1">위치 정보를 불러오는 중입니다.</p> // 주소 정보가 없을 때
                                    )}
                                    <button onClick={getCurrentLocation} type="button" className="btn btn-primary">내 위치 가져오기</button>
                                </div>
                                <div className={`weather_box ${weatherData ? 'fade-in' : ''}`}>
                                    {
                                        weatherData ? (
                                            <>
                                                <p className="ondo">
                                                    <span className="tem_box">
                                                        {weatherData.T1H}<span className="tem">℃</span>
                                                    </span>
                                                    <small>체감({weatherData.T1H}℃)<FontAwesomeIcon className="icon" icon={faTemperatureThreeQuarters} /></small>
                                                </p>
                                                <ul className="inner">
                                                    <li>
                                                        <p className="text1"><FontAwesomeIcon className="icon" icon={faDroplet} /> 습도</p>
                                                        <p className="text2">{weatherData.REH}%</p>
                                                    </li>
                                                    <li>
                                                        <p className="text1"><FontAwesomeIcon className="icon" icon={faCloudShowersHeavy} />강수량</p>
                                                        <p className="text2">{weatherData.RN1}mm</p>
                                                    </li>
                                                    <li>
                                                        <p className="text1"><FontAwesomeIcon className="icon" icon={faWind} />풍향</p>
                                                        <p className="text2">{calculateWindDirection(weatherData.UUU, weatherData.VVV)}</p>
                                                    </li>
                                                    <li>
                                                        <p className="text1"><FontAwesomeIcon className="icon" icon={faWind} />풍속</p>
                                                        <p className="text2">{weatherData.WSD}m/s</p>
                                                    </li>
                                                </ul>
                                            </>
                                        ) : (
                                            <p className="text_none">날씨 정보를 불러오는 중입니다...</p>
                                        )
                                    }

                                </div>
                            </div>
                            <div className='bottom_box'>
                                <div className='notice_box item'>
                                    <div className="basic-post-list1">
                                        <section className="title_box">
                                            <p className="text">공지사항</p>
                                            <div className="more">
                                                <Link to="/notice" className="widget_btn"><span>+</span></Link>
                                            </div>
                                        </section>
                                        <ul className="post-list">
                                            {notices.length === 0 ? (
                                                <p className="text_none">글이 없습니다.</p>
                                            ) : (
                                                notices.slice(0, 6).map((notice, idx) => {
                                                    const { year, month, day } = formatDate(notice.createDate);
                                                    if (idx === 0) {
                                                        return (
                                                            <li className="item-first" key={idx}>
                                                                <Link to={`/notice/${notice.num}`}>
                                                                    <div className="dateBox">
                                                                        <div className="Ym">{`${year}.${month}`}</div>
                                                                        <div className="day">{day}</div>
                                                                    </div>
                                                                    <div className="textBox">
                                                                        <h3 className="titleV2">{notice.title}</h3>
                                                                        <p className="text">{notice.post}</p>
                                                                    </div>
                                                                </Link>
                                                            </li>
                                                        );
                                                    } else {
                                                        return (
                                                            <li className="basic" key={idx}>
                                                                <Link to={`/notice/${notice.num}`}>
                                                                    <span className="ellipsis wr_subject">{notice.title}</span>
                                                                    <span className="dateV1">
                                                                        {`${year}.${month}.${day}`}
                                                                    </span>
                                                                </Link>
                                                            </li>
                                                        );
                                                    }
                                                })
                                            )}
                                        </ul>
                                    </div>
                                </div>
                                <div className='olhae_sanbul_balsaeng item'>
                                    {mountain ? (
                                        <>
                                            <div className="basic-post-list1">
                                                <section className="title_box">
                                                    <p className="text">오늘의 추천 등산로</p>
                                                    <div className="more">
                                                        <Link to="/mountain" className="widget_btn"><span>+</span></Link>
                                                    </div>
                                                </section>
                                            </div>
                                            <section className="inner">
                                                <div className="mt_title_box">
                                                    <h2>[{mountain.address}] {mountain.mt}</h2>
                                                </div>
                                                <div className="textBox1">
                                                    <p className="season">{mountain.season}</p>
                                                    <p className="height1">{mountain.height}m</p>
                                                </div>
                                                <p className="mttime text_v1">소요 시간: {mountain.mttime}</p>
                                                <figure className="img">
                                                    <img src={convertImageUrl(mountain.imgurl)} alt="Mountain" />
                                                </figure>
                                                <p className="contents text_v1">{mountain.mtpost}</p>
                                            </section>
                                        </>
                                    ) : (
                                        <p className="text_none">추천 등산로를 불러오는 중...</p>
                                    )}
                                </div>
                            </div>
                        </section>
                    </article>
                </div>
            </main >
        </>
    )
}
export default Mainpage;