import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FireStation.css';

function FireStation() {
  const [firestations, setFirestations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [firestationsPerPage] = useState(10); // 페이지당 산 목록 수
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFirestation = async () => {
      try {
        const response = await axios.get('http://34.64.96.111:8081/api/firestation');
        //console.log(response.data);
        setFirestations(response.data);
      } catch (error) {
        console.error('소방서 정보 데이터를 불러오는 데 실패했습니다.', error);
      }
    };

    fetchFirestation();
  }, []);

  const indexOfLastFireStation = currentPage * firestationsPerPage;
  const indexOfFirstFireStation = indexOfLastFireStation - firestationsPerPage;
  const currentFireStations = firestations.slice(indexOfFirstFireStation, indexOfLastFireStation);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(firestations.length / firestationsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="firestation-container">
      <div className="firestation-list">
        <table className="firestation-table">
          <thead>
            <tr>
              <th>소방서 이름</th>
              <th>주소</th>
              <th>소방서 연락처</th>
            </tr>
          </thead>
          <tbody>
            {currentFireStations.length > 0 ? (
              currentFireStations.map((firestation, index) => (
                // {firestations.map((firestation, index) => (
                <tr key={index}>
                  <td>{firestation.fsName}</td>
                  <td>{firestation.fsAdd}</td>
                  <td>{firestation.fph}</td>
                </tr>
             )
             )
            ):<p>검색 결과가 없습니다.</p>
            }
          </tbody>
        </table>
      </div>
      <div className="mountain-pagination">
        {pageNumbers.map(number => (
          <button key={number} onClick={() => paginate(number)} className={currentPage === number ? 'active' : ''}>
            {number}
          </button>
        ))}
      </div>
    </div>
  );
}

export default FireStation;
