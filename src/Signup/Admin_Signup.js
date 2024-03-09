import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Admin_Signup.css'; // CSS 파일을 Signup.css로 가정

function Admin_Signup() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // 입력 변경 핸들러
    const handleAdminChange = (event) => {
        const { name, value } = event.target;
        switch (name) {
            case 'id': setId(value); break;
            case 'password': setPassword(value); break;
            default: break;
        }
    };

    // 로그인 처리
    const handleAdminLogin = () => {
        axios.post('http://34.64.96.111:8081/api/admin/login', { id, password })
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
    const handleAdminKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleAdminLogin();
        }
    };

    return (
        <div className='admin-login-container'>
            <div className="admin-login-backbox">
                <div className={`admin-loginMsg`}>
                    <div className="admin-textcontent">
                        <p className="admin-title">관리자 전용 로그인 페이지</p>
                    </div>
                </div>
            </div>
            <div className={`admin-login-frontbox`}>
                <div className={`admin-login`}>
                    <h2>LOG IN</h2>
                    <div className="admin-inputbox">
                        <input type="text" name="id" placeholder="아이디" value={id} onChange={handleAdminChange} />
                        <input type="password" name="password" placeholder="비밀번호" value={password} onChange={handleAdminChange} onKeyDown={handleAdminKeyDown} />
                    </div>
                    <button className='admin-login_button' onClick={handleAdminLogin}>LOG IN</button>
                </div>
            </div >
        </div>
    );
}

export default Admin_Signup;
