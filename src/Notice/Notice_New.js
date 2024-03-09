import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Notice_New.css'

const Notice_New = () => {
  const [title, setTitle] = useState('');
  const [post, setPost] = useState('');
  const [imgurl, setImgurl] = useState(null);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('post', post);
      formData.append('image', imgurl);

      // 공지사항 생성            
      await axios.post('http://34.64.96.111:8081/api/notice', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('공지사항이 성공적으로 작성되었습니다.');
      navigate('/notice');
    } catch (error) {
      console.error('공지사항 작성 실패', error);
      alert('공지사항 작성에 실패했습니다.');
    }
  };

  const gotoNotice = () => {
    navigate(`/notice`);
};

  return (
    <div className="sub_frame containerV1">
      <form className='write_form' onSubmit={handleSubmit}>
        <div className='title_box'>
          <h2>글쓰기</h2>
        </div>
        <div className='detail_form'>
          <div className='item'>
            <label htmlFor="title">제목</label>
            <input className='inputBox' type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력해주세요." />
          </div>
          <div className='item'>
            <label htmlFor="post">내용</label>
            <textarea className='inputBox' value={post} onChange={(e) => setPost(e.target.value)} placeholder="내용을 입력해주세요."></textarea>
          </div>
          <div className='item'>
            <label htmlFor="file">이미지 첨부</label>
            <input className='inputBox' type="file" onChange={(e) => setImgurl(e.target.files[0])} />
          </div>
          <div className='item submitBox'>
            <button className='submitbtn' type="submit">작성하기</button>
            <button type="button" onClick={gotoNotice}>취소하기</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Notice_New;
