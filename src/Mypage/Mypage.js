import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./Mypage.css";

function Mypage(props) {
  const [userInfo, setUserInfo] = useState({ name: '', hp: '' });
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get('http://34.64.96.111:8081/api/mypage/info', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUserInfo({
        name: response.data.name,
        hp: response.data.hp,
      });
    } catch (error) {
      console.error('회원 정보 조회 실패', error);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== passwordConfirm) {
      alert('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    if (newPassword == password) {
      alert('변경하려는 비밀번호가 기존 비밀번호와 일치합니다.');
      return;
    }

    try {
      const response = await axios.put('http://34.64.96.111:8081/api/mypage/update_pw', {
        currentPassword: password,
        newPassword: newPassword,
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        alert('비밀번호가 변경되었습니다. 변경된 비밀번호로 재로그인 해주세요.');
        localStorage.removeItem('token');

        localStorage.removeItem('isLoggedIn');
        setIsLoggedIn(false);

        props.onCloseModal();

        navigate('/login');
      }
      else {
        alert(response.data.message); // 서버에서 오는 에러 메시지 출력
      }
    } catch (error) {
      console.error('비밀번호 변경 실패', error);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm('계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (!confirmation) {
      return;
    }

    try {
      const response = await axios.delete('http://34.64.96.111:8081/api/mypage/delete_account', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      alert('계정이 성공적으로 삭제되었습니다. 로그아웃됩니다.');
      localStorage.removeItem('token');

      localStorage.removeItem('isLoggedIn');
      setIsLoggedIn(false);

      navigate('/login');
      
      props.onCloseModal();
    } catch (error) {
      console.error('계정 삭제 실패', error);
      alert('계정 삭제 중 문제가 발생했습니다.');
    }
  };

  return (
    <div className='mypage_wrap'>
      <section className='itemBox'>
        <p className='item'>
          <label>이름</label>
          <span className='textBox info'>
            {userInfo.name}
          </span>
        </p>
        <p className='item'>
          <label>전화번호</label>
          <span className='textBox info'>
            {userInfo.hp}
          </span>
        </p>
        <p className='item'>
          <label>현재 비밀번호</label>
          <span className='textBox inputBox'>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </span>
        </p>
        <p className='item'>
          <label>변경 비밀번호</label>
          <span className='textBox inputBox'>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </span>
        </p>
        <p className='item'>
          <label>비밀번호 확인</label>
          <span className='textBox inputBox'>
            <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
          </span>
        </p>
      </section>
      <section className='submit_box'>
        <button className='update' onClick={handleChangePassword}>정보수정</button>
        <button className='delete' onClick={handleDeleteAccount}>회원탈퇴</button>
      </section>

    </div>

  );
}
export default Mypage;