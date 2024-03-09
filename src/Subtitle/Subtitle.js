import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './Subtitle.css';

import { jwtDecode } from 'jwt-decode';

function Subtitle() {
    const location = useLocation(); // 현재 위치 정보를 가져옴
    const [animate, setAnimate] = useState(false); // 애니메이션 상태 
    const [firestation, setFirestation] = useState({ fsname: '' });

    useEffect(() => {
        const token = localStorage.getItem('token'); // 토큰 가져오기
        if (!token) {
            console.error('토큰이 없습니다.');
            return; // 토큰이 없으면 여기서 중단
        }
    
        const fetchRolesAndFireStationInfo = async () => {
            try {
                const roleResponse = await axios.get('http://34.64.96.111:8081/api/auth/role', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                // 소방팀인지 확인
                if (roleResponse.data.roles.includes('ROLE_FIRETEAM')) {
                    const fireStationResponse = await axios.get('http://34.64.96.111:8081/api/firestation/info', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    setFirestation({
                        fsname: fireStationResponse.data.fsName,
                    });
                }
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    console.error('토큰 인증 실패', error);
                } else {
                    console.error('역할 조회 또는 소방서 정보 조회 실패', error);
                }
            }
        };
    
        fetchRolesAndFireStationInfo();
    }, []);

    // 현재 경로에 따라 서브 타이틀 텍스트 결정
    let subtitleText;
    if (location.pathname === '/mountain') {
        subtitleText = '추천 등산로';
    } else if (location.pathname.startsWith('/notice') || location.pathname.startsWith('/admin/notice')) {
        subtitleText = '공지사항';
    } else if (location.pathname === '/reception') {
        subtitleText = '접수현황';
        //  0304
    } else if (location.pathname.startsWith('/admin/result')) {
        subtitleText = '통합 접수현황';
    } else if (location.pathname.startsWith('/login') || location.pathname.startsWith('/admin/login') || location.pathname.startsWith('/fire/login')) {
        subtitleText = '로그인 & 회원가입';
    } else if (location.pathname === '/admin/member') {
        subtitleText = '회원 조회';
        // 0304           
    } else if (location.pathname.startsWith('/fire/result')) {
        subtitleText = `상황 일지: ${firestation.fsname}`;
    } else {
        subtitleText = 'fire alert'; // 기본값
    }

    // 컴포넌트가 마운트될 때 애니메이션 상태를 true로 설정
    useEffect(() => {
        setAnimate(true);

        // 애니메이션 종료 후 애니메이션 상태를 false로 재설정하여 다음 페이지 접근 시 애니메이션이 다시 작동하게 함
        const timer = setTimeout(() => {
            setAnimate(false);
        }, 1000); // CSS 애니메이션 시간과 일치

        return () => clearTimeout(timer);
    }, [location.pathname]); // location.pathname이 변경될 때마다 useEffect가 실행됨

    return (
        <>
            <div className={`sub_title ${animate ? 'animate' : ''}`}>
                <div className="contents">
                    <div className="titleBox">
                        <span className="text1">Zero Wave Tech</span>
                        <p className="text2">{subtitleText}</p>
                    </div>
                </div>
                <figure className='bg_img'></figure>
            </div>
        </>
    );
}

export default Subtitle;