import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import Modal_pw from '../Modal/Modal_pw';
import Change_Password from './Change_Password';

function Signup() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isMoving, setIsMoving] = useState(false);
  const [hp, setHp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [userName, setUserName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const navigate = useNavigate();

  // View 전환 함수
  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setIsMoving(!isMoving);
    setHp('');
    setPassword('');
    setPasswordConfirm('');
    setUserName('');
    setErrorMessage('');
  };

  // 입력 변경 핸들러
  const handleChange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case 'hp': setHp(value); break;
      case 'password': setPassword(value); break;
      case 'passwordConfirm': setPasswordConfirm(value); break;
      case 'userName': setUserName(value); break;
      default: break;
    }
  };

  // 연락처 중복 확인
  const handleHpcheck = () => {
    axios.post('http://34.64.96.111:8081/api/check_hp', { hp: hp })
      .then(response => {
        if (response.data.exists) {
          alert('이미 존재하는 사용자 연락처입니다.');
        } else {
          alert('사용 가능한 연락처입니다.');
        }
      })
      .catch(error => {
        console.error('checkhp error:', error);
        alert('중복 확인 과정에서 오류가 발생했습니다.');
      });
  };

  // 회원 가입 처리
  const handleSignUp = async () => {
    if (password !== passwordConfirm) {
      alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    if (password.length < 6 || password.length > 15) {
      alert('비밀번호는 6자리 이상 15자리 이하로 설정해주세요.');
      return;
    }
    try {
      const response = await axios.post('http://34.64.96.111:8081/api/register', { hp, password, userName });
      alert('회원가입에 성공하였습니다!');
      return true; // 성공 시 true 반환
    } catch (error) {
      console.error('Signup error:', error);
      if (error.response && error.response.status === 409) {
        alert('이미 존재하는 사용자 연락처입니다.');
      } else {
        alert('회원가입 과정에서 오류가 발생했습니다.');
      }
      return false; // 실패 시 false 반환
    }
  };

  // 회원가입 성공 후 로그인 뷰로 전환
  const combinedOnChange = async (event) => {
    const signUpSuccess = await handleSignUp(event);
    if (signUpSuccess) {
      toggleView(); // 회원가입 성공 후 뷰 전환
    }
  };

  // 로그인 처리
  const handleLogin = () => {
    axios.post('http://34.64.96.111:8081/api/login', { hp, password })
      .then(response => {
        const { token } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = '/';
        alert('로그인에 성공하였습니다!');
      })
      .catch(error => {
        console.error('Login error:', error);
        if (error.response && error.response.status === 403) {
          alert('아이디 또는 비밀번호가 잘못되었습니다.');
        } else {
          alert('로그인 과정에서 오류가 발생했습니다.');
        }
      });
  };

  // Enter 키로 로그인 처리
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  // 모달 열기 함수
  const handleOpenChangePasswordModal = () => {
    setShowChangePasswordModal(true);
  };

  // 모달 닫기 함수
  const handleCloseChangePasswordModal = () => {
    setShowChangePasswordModal(false);
  };

  // 0303 수정
  return (
    <div className='login-container'>
      <div className="login-backbox">
        <div className={`loginMsg ${isLoginView ? '' : 'visibility'}`}>
          <div className="textcontent">
            <p className="title">계정이 없으신가요?</p>
            <p className='sub'>회원가입을 통해 산림을 보호하세요!</p>
            <button id="switch1" onClick={toggleView}>SIGN UP</button>
          </div>
        </div>
        <div className={`signupMsg ${isLoginView ? 'visibility' : ''}`}>
          <div className="textcontent">
            <p className="title">이미 계정이 있으신가요?</p>
            <p className='sub'>산림을 지켜주세요!</p>
            <button id="switch2" onClick={toggleView}>LOG IN</button>
          </div>
        </div>
      </div>
      <div className={`login-frontbox ${isMoving ? 'moving' : ''}`}>
        {isLoginView ? (
          <div className={`login ${isLoginView ? '' : 'hide'}`}>
            <h2>LOG IN</h2>
            <div className="inputbox">
              <div className='inner1'>
                <input type="text" name="hp" placeholder="연락처" value={hp} onChange={handleChange} />
              </div>
              <div className='inner1'>
                <input type="password" name="password" placeholder="비밀번호" value={password} onChange={handleChange} onKeyDown={handleKeyDown} />
              </div>
            </div>
            <p onClick={handleOpenChangePasswordModal}>FORGET PASSWORD?</p>
            {
              showChangePasswordModal && (
                <Modal_pw onClose={handleCloseChangePasswordModal}>
                  <Change_Password onCloseModal={handleCloseChangePasswordModal} />
                </Modal_pw>
              )
            }
            <button className='login_button' onClick={handleLogin}>LOG IN</button>
          </div>
        ) : (
          <div className={`signup ${isLoginView ? 'hide' : ''}`}>
            <h2>SIGN UP</h2>
            <div className="inputbox">
              <div className='inner1'>
                <input type="text" name="hp" placeholder="연락처" value={hp} onChange={handleChange} />
                <button onClick={handleHpcheck} className="signup-hp-check-button">중복 확인</button>
              </div>
              <div className='inner1'>
                <input type="password" name="password" placeholder="비밀번호(6자리 이상 15자리 이하)" value={password} onChange={handleChange} />
              </div>
              <div className='inner1'>
                <input type="password" name="passwordConfirm" placeholder="비밀번호 재입력" value={passwordConfirm} onChange={handleChange} />
              </div>
              <div className='inner1'>
                <input type="text" name="userName" placeholder="이름" value={userName} onChange={handleChange} onKeyDown={handleKeyDown} />
              </div>
            </div>
            <button className='signup_button' onClick={combinedOnChange}>SIGN UP</button>
          </div>
        )}
      </div>
    </div>
  );
}
// 0303 수정
export default Signup;
