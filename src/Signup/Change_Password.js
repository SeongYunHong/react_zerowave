import React, { useState } from 'react';
import axios from 'axios';
import './Change_Password.css';

function Change_Password(props) {
  const [hp, setHp] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const handleChangPw = async (e) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지

    if (password !== passwordConfirm) {
      alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    if (password.length < 6 || password.length > 15) {
      alert('비밀번호는 6자리 이상 15자리 이하로 설정해주세요.');
      return;
    }

    try {
      const response = await axios.put('http://34.64.96.111:8081/api/find-password', {
        hp,
        username,
        password
      });
      alert('비밀번호 변경이 완료되었습니다.');
      props.onCloseModal();
    } catch (error) {
      alert('비밀번호 변경 중 오류가 발생했습니다.');
    }
  };

  const ClosePage = () => {
    props.onCloseModal();
  }

  return (
    <div className='findpw_wrap'>
      <section className='itemBox'>
        <p className='item'>
          <label>이름</label>
          <span className='textBox inputBox'>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </span>
        </p>
        <p className='item'>
          <label>전화번호</label>
          <span className='textBox inputBox'>
            <input type="text" value={hp} onChange={(e) => setHp(e.target.value)} />
          </span>
        </p>
        <p className='item'>
          <label>새 비밀번호</label>
          <span className='textBox inputBox'>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
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
        <button className='update' onClick={handleChangPw}>비밀번호 변경</button>
        <button className='delete' onClick={ClosePage}>닫기</button>
      </section>

    </div>
  );
}

export default Change_Password;
