import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin_user.css';

function Admin_user() {
  const [members, setMembers] = useState([]);
  const navigate = useNavigate();
  //권한 확인------------------------------------------------------------------------------------------------------------------------------------------------------
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
    const fetchMember = async () => {
      try {
        const response = await axios.get('http://34.64.96.111:8081/api/allmembers');
        //console.log(response.data);
        setMembers(response.data);
      } catch (error) {
        console.error('회원 정보 데이터를 불러오는 데 실패했습니다.', error);
      }
    };

    fetchMember();
  }, []);

  const handleDeleteAccount = async (hp) => {
    const confirmation = window.confirm('계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (!confirmation) {
      return;
    }

    try {
      const response = await axios.delete(`http://34.64.96.111:8081/api/delete/${hp}`);
      alert('계정이 성공적으로 삭제되었습니다.');
      const updatedMembers = members.filter(member => member.hp !== hp);
      setMembers(updatedMembers);
    } catch (error) {
      console.error('계정 삭제 실패', error);
      alert('계정 삭제 중 문제가 발생했습니다.');
    }
  };

  return (
    <div className="admin-container sub_frame">
      <div className="admin-list">
        <table className="admin-table">
          <thead>
            <tr>
              <th>사용자 이름</th>
              <th>연락처</th>
              <th>가입 일자</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => (
              <tr key={index}>
                <td>{member.userName}</td>
                <td>{member.hp}</td>
                <td>{new Date(member.createDate).toLocaleDateString()}</td>
                <td><button onClick={() => handleDeleteAccount(member.hp)}>회원 삭제</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin_user;
