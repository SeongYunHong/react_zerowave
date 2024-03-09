import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Notice.css'; // 공통 CSS 사용
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';


const Notice = () => {
  const [notices, setNotices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [noticesPerPage] = useState(10);
  const [isAdmin, setIsAdmin] = useState(false);
  const [firstNoticeNum, setFirstNoticeNum] = useState();
  const [lastNoticeNum, setLastNoticeNum] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://34.64.96.111:8081/api/auth/role', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          // 관리자인 경우만 isAdmin을 true로 설정
          setIsAdmin(response.data.roles.includes('ROLE_ADMIN'));
        } catch (error) {
          console.error('Role fetching failed', error);
        }
      }
    };

    fetchUserRole();
  }, []);

  // 0303 수정
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await axios.get('http://34.64.96.111:8081/api/notice');
        // 정렬
        const sortedData = response.data.sort((a, b) => b.num - a.num);
        setFirstNoticeNum(response.data[sortedData.length - 1].num);
        setLastNoticeNum(response.data[0].num);
        setNotices(sortedData);
      } catch (error) {
        console.error('공지사항 데이터를 불러오는 데 실패했습니다.', error);
      }
    };

    fetchNotices();
  }, []);

  // 0303 수정
  // 현재 페이지에서 표시할 공지사항 계산
  const indexOfLastNotice = currentPage * noticesPerPage;
  const indexOfFirstNotice = indexOfLastNotice - noticesPerPage;
  const currentNotices = notices.slice(indexOfFirstNotice, indexOfLastNotice);

  // 페이지 번호를 클릭했을 때 실행될 함수
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // 전체 페이지 수 계산
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(notices.length / noticesPerPage); i++) {
    pageNumbers.push(i);
  }

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

  const write = () => {
    navigate('/notice/new');
  };

  const gotoPrev = () => {
    // 현재 페이지가 1보다 큰 경우에만 이전 페이지로 이동 가능
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }
  
  const gotoNext = () => {
    // 현재 페이지가 전체 페이지 수보다 작은 경우에만 다음 페이지로 이동 가능
    setCurrentPage(prev => Math.min(prev + 1, pageNumbers.length));
  }

  return (
    <div className="sub_frame containerV1">
      {isAdmin && (
        <div className='notice_write_box'>
          <button onClick={write}>
            <FontAwesomeIcon className="icon" icon={faPen} />
            글쓰기
          </button>
        </div>
      )}
      <div className="list-board ik-board-basic">
        <div className="div-head">
          <span className="wr-num hidden-xs">번호</span>
          <span className="wr-subject">제목</span>
          <span className="wr-date hidden-xs">작성일</span>
        </div>
        <ul className="post-list list-body">
          {currentNotices.length > 0 ? (
            currentNotices.map(notice => (
              <li className="list-item" key={notice.num}>
                <div className="wr-num hidden-xs">{notice.num}</div>
                <div className="wr-subject">
                  <Link to={`/notice/${notice.num}`} state={{ firstNoticeNum: String(firstNoticeNum), lastNoticeNum: String(lastNoticeNum) }}>
                    {notice.title}
                  </Link>
                </div>
                <div className="wr-date hidden-xs">{formatDate(notice.createDate)}</div>
              </li>
            ))
          ) : (
            <p className='zerowave_text_none padding_all text_center'>게시글이 없습니다.</p>
          )}
        </ul>
      </div>

      <div className="notice-pagination">
        <button onClick={() => gotoPrev('previous')}>
          <FontAwesomeIcon className='icon' icon={faAngleLeft} />
        </button>
        {pageNumbers.map(number => (
          <button key={number} onClick={() => paginate(number)} className={currentPage === number ? 'active' : ''}>
            {number}
          </button>
        ))}
        <button onClick={() => gotoNext('next')}>
          <FontAwesomeIcon className='icon' icon={faAngleRight} />
        </button>
      </div>
    </div>
  );
};

export default Notice;
