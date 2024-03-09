import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Fire_Signup.css'; // CSS 파일을 Signup.css로 가정

function Fire_Signup() {
    const [fs, setFs] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // 입력 변경 핸들러
    const handleFireChange = (event) => {
        const { name, value } = event.target;
        switch (name) {
            case 'fs': setFs(value); break;
            case 'password': setPassword(value); break;
            default: break;
        }
    };

    // 로그인 처리
    const handleFireLogin = () => {
        axios.post('http://34.64.96.111:8081/api/firestation/login', { fs, password })
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
    const handleFireKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleFireLogin();
        }
    };

    return (
        <div className='fire-login-container'>
            <div className="fire-login-backbox">
                <div className={`fire-loginMsg`}>
                    <div className="fire-textcontent">
                        <p className="fire-title">소방팀 전용 로그인 페이지</p>
                    </div>
                </div>
            </div>
            <div className={`fire-login-frontbox`}>
                <div className={`fire-login`}>
                    <h2>LOG IN</h2>
                    <div className="fire-inputbox">
                        <input type="text" name="fs" placeholder="소방서 코드" value={fs} onChange={handleFireChange} />
                        <input type="password" name="password" placeholder="비밀번호" value={password} onChange={handleFireChange} onKeyDown={handleFireKeyDown} />
                    </div>
                    <button className='fire-login_button' onClick={handleFireLogin}>LOG IN</button>
                </div>
            </div >
        </div>
    );
}

export default Fire_Signup;
