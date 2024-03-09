import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Mountain.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faThumbsUp, faPersonHiking, faMaximize, faMinimize } from '@fortawesome/free-solid-svg-icons';




function Mountain() {
  const [filtermountain, setFilteredMountains] = useState([]);
  const [mountains, setMountains] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [mtTimes, setMtTimes] = useState([]);
  const [filter, setFilter] = useState({
    address: '',
    season: '',
    mttime: '',
    minHeight: '',
    maxHeight: '',
  });
  // 0303 수정
  const seasonOrder = [
    '봄', '봄/여름', '봄/가을', '봄/겨울',
    '여름', '여름/가을', '여름/겨울',
    '가을', '가을/겨울', '겨울'
  ];
  const timeOrder = ['2시간~2시간30분미만', '2시간30분~3시간미만', '3시간~3시간30분미만', '3시간30분~4시간미만', '4시간~4시간30분미만', '4시간30분~5시간미만', '5시간이상'];
  // 0303 수정
  const [animate, setAnimate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [mountainsPerPage] = useState(10); // 페이지당 산 목록 수

  useEffect(() => {
    const fetchMountains = async () => {
      try {
        const response = await axios.get('http://34.64.96.111:8081/api/mountain');
        setMountains(response.data);
        setFilteredMountains(response.data); // 초기에는 모든 데이터를 표시
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    const fetchDataLists = async () => {
      try {
        const addressesResponse = await axios.get('http://34.64.96.111:8081/api/mountain/addresses');
        setAddresses(addressesResponse.data);
        // 0303 수정
        const seasonsResponse = await axios.get('http://34.64.96.111:8081/api/mountain/seasons');
        const sortedSeasons = seasonsResponse.data.sort((a, b) => seasonOrder.indexOf(a) - seasonOrder.indexOf(b));
        setSeasons(sortedSeasons);

        const mtTimesResponse = await axios.get('http://34.64.96.111:8081/api/mountain/mttimes');
        const sortedTimes = mtTimesResponse.data.sort((a, b) => timeOrder.indexOf(a) - timeOrder.indexOf(b));
        setMtTimes(sortedTimes);
        // 0303 수정
      } catch (error) {
        console.error('Error fetching lists: ', error);
      }
    };

    fetchMountains();
    fetchDataLists();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchFilteredMountains = async () => {
      try {
        // 빈 문자열 필터 제거
        const activeFilters = Object.fromEntries(Object.entries(filter).filter(([_, value]) => value !== ''));
        const queryParams = new URLSearchParams(activeFilters).toString();
        const url = `http://34.64.96.111:8081/api/mountain/filter?${queryParams}`;
        // console.log('Requesting URL:', url); // 요청 URL 로그 출력
        const response = await axios.get(url);
        setMountains(response.data);
        setAnimate(true); // 필터링 후 애니메이션 상태를 true로 설정
        setTimeout(() => setAnimate(false), 500); // 애니메이션 지속시간 후 false로 설정
      } catch (error) {
        console.error('Error fetching filtered mountains:', error);
      }
    };

    fetchFilteredMountains();
  }, [filter]);

  const indexOfLastMountain = currentPage * mountainsPerPage;
  const indexOfFirstMountain = indexOfLastMountain - mountainsPerPage;
  const currentMountains = mountains.slice(indexOfFirstMountain, indexOfLastMountain);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(mountains.length / mountainsPerPage); i++) {
    pageNumbers.push(i);
  }


  // imgurl 변환 함수
  const convertImageUrl = (relativeUrl) => {
    const baseUrl = "http://34.64.96.111:8081";
    const imagePath = relativeUrl.split("static")[1].replace(/\\/g, "/");
    return `${baseUrl}${imagePath}`;
  };



  return (
    <div className='sub_frame containerV1'>
      <section className='search_select'>
        <div className='item location'>
          <label>
            <FontAwesomeIcon className="icon" icon={faLocationDot} />
            위치
          </label>
          <select className='select_item' name="address" onChange={handleChange} value={filter.address}>
            <option value="">전체</option>
            {addresses.map((address, index) => (
              <option key={index} value={address}>{address}</option>
            ))}
          </select>
        </div>
        <div className='item season'>
          <label>
            <FontAwesomeIcon className='icon' icon={faThumbsUp} />
            추천 계절
          </label>
          <select className='select_item' name="season" onChange={handleChange} value={filter.season}>
            <option value="">전체</option>
            {seasons.map((season, index) => (
              <option key={index} value={season}>{season}</option>
            ))}
          </select>
        </div>
        <div className='item mttime'>
          <label>
            <FontAwesomeIcon className='icon' icon={faPersonHiking} />
            등산 시간
          </label>
          <select className='select_item' name="mttime" onChange={handleChange} value={filter.mttime}>
            <option value="">전체</option>
            {mtTimes.map((mttime, index) => (
              <option key={index} value={mttime}>{mttime}</option>
            ))}
          </select>
        </div>
        <div className='item minHeight'>
          <label>
            <FontAwesomeIcon className='icon' icon={faMinimize} />
            최소 높이
          </label>
          <input placeholder='최소 높이를 입력하세요' className='select_item' type="number" name="minHeight" value={filter.minHeight} onChange={handleChange} />
        </div>
        <div className='item maxHeight'>
          <label>
            <FontAwesomeIcon className='icon' icon={faMaximize} />
            최대 높이
          </label>
          <input placeholder='최대 높이를 입력하세요' className='select_item' type="number" name="maxHeight" value={filter.maxHeight} onChange={handleChange} />
        </div>
      </section>

      <section className='mountain_gallery'>
        {currentMountains.length > 0 ? (
          currentMountains.map((mountain, index) => (
            <div className='item' key={index}>
              <figure className='img'><img src={convertImageUrl(mountain.imgurl)} alt={mountain.mt} /></figure>
              <div className='textBox'>
                <div className='inner1'>
                  <p className='season text1'>추천 계절: <span>{mountain.season}</span></p>
                  <p className='height1 text1'>{mountain.height}m</p>
                </div>
                <h2 className='title1 text1'>[{mountain.address}] {mountain.mt}</h2>
                <p className='mttime text1'>소요 시간: {mountain.mttime}</p>
                <p className='mtpost text1'>소개: {mountain.mtpost}</p>
              </div>
            </div>
          ))
        ) : (
          <p>검색 결과가 없습니다.</p>
        )}
      </section>
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

export default Mountain;
