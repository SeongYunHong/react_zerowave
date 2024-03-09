import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Notice_Detail.css';

const Notice_Update = () => {
    const [title, setTitle] = useState('');
    const [post, setPost] = useState('');
    const [imgurl, setImgurl] = useState(null);
    const { noticeId } = useParams();
    const navigate = useNavigate();

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

    useEffect(() => {
        // 공지사항의 현재 정보를 불러와서 폼에 세팅
        const fetchNoticeDetail = async () => {
            try {
                const response = await axios.get(`http://34.64.96.111:8081/api/notice/${noticeId}`);
                const data = response.data;
                setTitle(data.title || ''); // API 응답에서 undefined가 오는 경우를 대비해 기본값 설정
                setPost(data.post || ''); // API 응답에서 undefined가 오는 경우를 대비해 기본값 설정
                setImgurl(data.imgurl || ''); // API 응답에서 undefined가 오는 경우를 대비해 기본값 설정
            } catch (error) {
                console.error('공지사항 정보 불러오기 실패', error);
                alert('공지사항 정보를 불러오는 데 실패했습니다.');
            }
        };

        fetchNoticeDetail();
    }, [noticeId]); // 의존성 배열에 noticeId 추가

    // const handleSubmitAdminNotice = async (event) => {
    //     event.preventDefault();

    //     try {
    //         await axios.put(`http://34.64.96.111:8081/api/notice/${noticeId}`, {
    //             title,
    //             post,
    //             imgurl,
    //         });

    //         alert('공지사항이 성공적으로 수정되었습니다.');
    //         navigate('/notice');
    //     } catch (error) {
    //         console.error('공지사항 수정 실패', error);
    //         alert('공지사항 수정에 실패했습니다.');
    //     }
    // };

    const handleSubmitAdminNotice = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('title', title);
        formData.append('post', post);
        formData.append('image', imgurl); // 'image'는 백엔드에서 이미지 파일을 참조하는 파라미터 이름과 일치해야 합니다.


        try {
            await axios.put(`http://34.64.96.111:8081/api/notice/${noticeId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('공지사항이 성공적으로 수정되었습니다.');
            navigate('/notice');
        } catch (error) {
            console.error('공지사항 수정 실패', error);
            alert('공지사항 수정에 실패했습니다.');
        }
    };

    const gotoNotice = () => {
        navigate('/notice')
    }

    return (
        <div className='sub_frame containerV1'>
            <form className='write_form' onSubmit={handleSubmitAdminNotice}>
                <div className='title_box'>
                    <h2>공지사항 수정</h2>
                </div>
                <div className='detail_form'>
                    <div className='item'>
                        <label htmlFor="title">제목</label>
                        <input id="title" className='inputBox' value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className='item'>
                        <label htmlFor="post">내용</label>
                        <textarea id="post" className='inputBox' value={post} onChange={(e) => setPost(e.target.value)} />
                    </div>
                    <div className='item'>
                        <label htmlFor="file">이미지 첨부</label>
                        <input id="imgurl" className='inputBox' type='file' onChange={(e) => setImgurl(e.target.files[0])} />
                    </div>
                    <div className='item submitBox'>
                        <button type="submit">수정하기</button>
                        <button type="button" onClick={gotoNotice}>목록으로</button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Notice_Update;
