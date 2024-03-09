import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Reception.css';

function Reception() {
  const [receptions, setReceptions] = useState([]);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://34.64.96.111:8081/api/fireReception', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log(response.data);
        setReceptions(response.data);
        setAnimate(true); // 필터링 후 애니메이션 상태를 true로 설정
        setTimeout(() => setAnimate(false), 500); // 애니메이션 지속시간 후 false로 설정
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
      <section className={`reception_gallery ${animate ? 'fade-in' : ''}`}>
        {receptions.length > 0 ? (
          receptions.map((reception, index) => {
            // progress에 기반한 클래스 이름을 결정
            const progressClass = getProgressClass(reception.progress);
            return (
              <div className={progressClass} key={index}>
                <figure className='img'><img src={convertImageUrl(reception.imgurl)} alt={`Reception ${index}`} /></figure>

                <div className="item-info textBox">
                  <p className='addr'>{reception.address}</p>
                  <div className='inner1'>
                    <p className='date'>{formatDate(reception.adate)}</p>
                    <span className='icon'>|</span>
                    <p className='state'>{reception.progress}</p>
                  </div>
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
}

export default Reception;