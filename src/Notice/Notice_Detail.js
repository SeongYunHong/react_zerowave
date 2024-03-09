import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './Notice_Detail.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faClock, faEye, faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

const Notice_Detail = () => {
    const [detail, setDetail] = useState(null);
    const { noticeId } = useParams();
    const location = useLocation();
    const [isHitIncreased, setIsHitIncreased] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const { firstNoticeNum, lastNoticeNum } = location.state || {};
    const [isFirst, setIsFirst] = useState(false);
    const [isLast, setIsLast] = useState(false);
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

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const detailResponse = await axios.get(`http://34.64.96.111:8081/api/notice/${noticeId}`);
                setDetail(detailResponse.data);
            } catch (error) {
                console.error('공지사항 세부 정보를 불러오는 데 실패했습니다.', error);
            }
        };
        fetchDetail();
    }, [noticeId]);

    useEffect(() => {
        // noticeId와 비교를 위해 숫자 타입으로 안전하게 변환
        const currentId = parseInt(noticeId, 10);
        // firstNoticeNum과 lastNoticeNum이 유효한 경우에만 parseInt를 실행하고, 그렇지 않은 경우 기본값으로 처리
        const firstNum = firstNoticeNum ? parseInt(firstNoticeNum, 10) : null;
        const lastNum = lastNoticeNum ? parseInt(lastNoticeNum, 10) : null;
    
        setIsFirst(currentId === firstNum);
        setIsLast(currentId === lastNum);
    }, [noticeId, firstNoticeNum, lastNoticeNum]);

    useEffect(() => {
        if (detail && !isHitIncreased) {
            increaseHit();
            setIsHitIncreased(true);
        }
    }, [detail]);

    const increaseHit = async () => {
        try {
            await axios.get(`http://34.64.96.111:8081/api/notice/increaseHit/${noticeId}`);
        } catch (error) {
            console.error('공지사항 조회수 증가 중 오류 발생', error);
        }
    };

    if (!detail) {
        return <div className='notice_detail'>Loading...</div>;
    }

    // const formattedDate = new Date(detail.createDate).toLocaleDateString('ko-KR', {
    //     year: 'numeric',
    //     month: 'long',
    //     day: 'numeric'
    // });



    const convertImageUrl = (relativeUrl) => {
        const baseUrl = "http://34.64.96.111:8081";
        const imagePath = relativeUrl.split("static")[1].replace(/\\/g, "/");
        return `${baseUrl}${imagePath}`;
    };

    const gotoNotice = () => {
        navigate('/notice');
    };

    const updateNotice = () => {
        navigate(`/notice/update/${noticeId}`);
    }

    const deleteNotice = async () => {
        const confirmation = window.confirm('게시물을 삭제하시겠습니까?');
        if (!confirmation) {
            return;
        }

        try {
            const response = await axios.delete(`http://34.64.96.111:8081/api/notice/${noticeId}`);
            alert('게시물이 성공적으로 삭제되었습니다.');
            navigate('/notice');
        } catch (error) {
            console.error('게시물 삭제 실패', error);
            alert('게시물 삭제 중 문제가 발생했습니다.');
        }

    }

    // 이전 및 다음 게시물 이동
    const goToPrevNextNotice = async (direction) => {
    try {
        const response = await axios.get(`http://34.64.96.111:8081/api/notice/${direction}/${noticeId}`);
        if (response.data) {
            // navigate 함수에 상태를 포함하여 이전/다음 게시물로 이동
            navigate(`/notice/${response.data.num}`, { state: { firstNoticeNum, lastNoticeNum } });
        } else {
            alert('더 이상 게시물이 없습니다.');
        }
    } catch (error) {
        console.error('게시물 이동 중 오류 발생', error);
    }
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



    return (
        <section className="sub_frame containerV1 notice_detail_wrap">
            <div className='notice_detail'>
                <article className='titleBox'>
                    <h2 className='title'>{detail.title}</h2>
                    <div className="notice_info">
                        <span><FontAwesomeIcon className='icon' icon={faPen} />관리자</span>
                        <span><FontAwesomeIcon className='icon' icon={faClock} />{formatDate(detail.createDate)}</span>
                        <span><FontAwesomeIcon className='icon' icon={faEye} />{detail.hit}</span>
                    </div>
                </article>
                <article className='itemBox'>
                    <div className='img'><img src={convertImageUrl(detail.imgurl)} alt="Notice" /></div>
                    <div className='textBox' dangerouslySetInnerHTML={{ __html: detail.post }} />
                    <div className="notice_navigation">
                        {!isFirst && (
                            <button onClick={() => goToPrevNextNotice('previous')}>
                                <FontAwesomeIcon className='icon' icon={faAngleLeft} />이전글
                            </button>
                        )}
                        {!isLast && (
                            <button onClick={() => goToPrevNextNotice('next')}>
                                다음글<FontAwesomeIcon className='icon' icon={faAngleRight} />
                            </button>
                        )}
                    </div>
                </article>


                <div className='btn_box'>
                    {isAdmin && (
                        <button className='edit' onClick={updateNotice}>수정하기</button>
                    )}
                    {isAdmin && (
                        <button className='edit' onClick={deleteNotice}>삭제하기</button>
                    )}
                    <button onClick={gotoNotice}>목록으로</button>
                </div>
            </div>
        </section>
    );
};

export default Notice_Detail;
