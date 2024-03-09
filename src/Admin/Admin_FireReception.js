import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin_FireReception.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';

function Admin_FireReception() {
  const [receptions, setReceptions] = useState([]);
  const navigate = useNavigate();

  // 240228 수정
  const [messages, setMessages] = useState([]);

  // 240302 수정
  const [animate, setAnimate] = useState(false);

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
        // 소방팀인지 확인
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://34.64.96.111:8081/api/fireSituationRoom/admin', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const sortedData = response.data.sort((a, b) => b.command - a.command);
        setReceptions(sortedData);
        setAnimate(true); // 필터링 후 애니메이션 상태를 true로 설정
        setTimeout(() => setAnimate(false), 500); // 애니메이션 지속시간 후 false로 설정
      } catch (error) {
        console.error('데이터를 가져오는데 실패했습니다.', error);
      }
    };

    fetchData();
  }, []);

  // imgurl 변환 함수
  const convertImageUrl = (relativeUrl) => {
    const baseUrl = "http://34.64.96.111:8081";
    const imagePath = relativeUrl.split("static")[1].replace(/\\/g, "/");
    // 타임스탬프를 URL에 추가
    const timeStamp = new Date().getTime();
    return `${baseUrl}${imagePath}?${timeStamp}`;
  };

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
  const gotoAdminResult = (command) => {
    navigate(`/admin/result/${command}`);
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

  return (
    <div className="sub_frame containerV1">
      <section className={`result_gallery ${animate ? 'fade-in' : ''}`}>
        {receptions.length > 0 ? (
          receptions.map((result, index) => {
            // progress에 기반한 클래스 이름을 결정
            const progressClass = getProgressClass(result.progress);
            return (
              <div className={progressClass} key={index}>
                <figure className='img' onClick={() => gotoAdminResult(result.command)}>
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
            );
          })
        ) : (
          <p className='zerowave_text_none'>신고접수된 게시글이 없습니다.</p>
        )}
      </section>
    </div >
  );
  // 240302 수정
}

export default Admin_FireReception;