import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Mainpage from './Mainpage/Mainpage';
import Mountain from './Mountain/Mountain';

import Notice from './Notice/Notice';
import Notice_Detail from './Notice/Notice_Detail';

import Subtitle from './Subtitle/Subtitle';

import Notice_New from './Notice/Notice_New';
import Notice_Update from './Notice/Notice_Update';

import Reception from './Reception/Reception';

import Mypage from './Mypage/Mypage';
import Signup from './Signup/Signup';

import Admin_Signup from './Signup/Admin_Signup';

import Fire_Signup from './Signup/Fire_Signup';

import Result from './Result/Result';
import Result_Detail from './Result/Result_Detail';
import Result_New from './Result/Result_New';
import Result_Update from './Result/Result_Update';

import Admin_FireReception from './Admin/Admin_FireReception';
import Admin_Result_Detail from './Admin/Admin_Result_Detail';
import Admin_user from './Admin/Admin_user';
import FireStation from './Admin/FireStation';

import Modal from './Modal/Modal';
import Modal_ff from './Modal/Modal_ff';

import ScrollToTopButton from "./ScrollToTopButton";

import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faAngleRight, faFire } from '@fortawesome/free-solid-svg-icons';
import './style.css';
import './HYUN.css';

import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { jwtDecode } from 'jwt-decode';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const Navigation = ({ onOpenModal, onOpenFireModal  }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [navActive, setNavActive] = useState(false);
  const [userRole, setUserRole] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  // 여기에 추가: 각 li의 on_sub 클래스 토글 상태를 관리하기 위한 상태
  const [activeSub, setActiveSub] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // 사용자 권한 불러오기
    if (isLoggedIn) {
      axios.get('http://34.64.96.111:8081/api/auth/role', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(response => {
        const roles = response.data.roles;
        // 간단한 예시로, 첫 번째 권한만 사용합니다.
        setUserRole(roles[0]);
        setIsLoggedIn(true);
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          // 토큰 만료 등 인증 오류 시 로그아웃 처리
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          setUserRole('');
          navigate('/login'); // 로그인 페이지로 이동
        } else {
          console.error('권한 불러오기 실패:', error);
        }
      });
    }
    else {
      setIsLoggedIn(false);
      setUserRole('');
    }
  }, [navigate]);

  const handleLogout = (event) => {
    event.preventDefault();
    localStorage.removeItem('token');
    localStorage.setItem('isLoggedIn', 'false');
    setIsLoggedIn(false);
    setUserRole('');
    setNavActive(!navActive);
    navigate('/');
  };

  const toggleNav = () => {
    setNavActive(!navActive); // navActive 상태 토글
  };

  // li 클릭 이벤트 핸들러
  const toggleSub = (index) => {
    setActiveSub((prevActiveSub) => prevActiveSub === index ? null : index);
  };

  // 회원 정보 수정 버튼 클릭 이벤트 핸들러
  const handleOpenModalAndToggleNav = (event) => {
    toggleNav(); // navActive 상태 토글
    onOpenModal(); // 모달 열기 함수 호출
  };

  const showSubtitle = location.pathname !== "/";

  // 240302 수정
  const menuConfig = [
    { label: "추천 등산로", path: "/mountain", visibleFor: ["LOGGED_OUT", "ROLE_USER", "ROLE_ADMIN"] },
    { label: "공지사항", path: "/notice", visibleFor: ["LOGGED_OUT", "ROLE_USER", "ROLE_FIRETEAM", "ROLE_ADMIN"] },
    { label: "로그인 & 회원가입", path: "/login", visibleFor: ["LOGGED_OUT"], action: toggleNav },
    { label: "접수현황", path: "/reception", visibleFor: ["ROLE_USER"] },
    { label: "나의 정보", visibleFor: ["ROLE_USER"], action: handleOpenModalAndToggleNav },
    { label: "상황일지", path: "/fire/result", visibleFor: ["ROLE_FIRETEAM"] },
    { label: "통합 접수현황", path: "/admin/result", visibleFor: ["ROLE_ADMIN"] },
    { label: "회원 조회", path: "/admin/member", visibleFor: ["ROLE_ADMIN"] },
    { label: "로그아웃", visibleFor: ["ROLE_USER", "ROLE_FIRETEAM", "ROLE_ADMIN"], action: handleLogout },
  ];
  // 240302 수정

  const renderMenuItems = () => {
    return menuConfig.filter(item =>
      (item.visibleFor.includes("LOGGED_OUT") && !isLoggedIn) ||
      (item.visibleFor.includes(userRole))
    ).map((item, index) => (
      <li key={index}>
        {item.path ? (
          <Link to={item.path} className="item" onClick={item.action || toggleNav}>
            <span>{item.label}</span>
            <FontAwesomeIcon className='icon1' icon={faAngleRight} />
          </Link>
        ) : (
          <button className='item' onClick={item.action}>
            <span>{item.label}</span>
            <FontAwesomeIcon className='icon1' icon={faAngleRight} />
          </button>
        )}
      </li>
    ));
  };

  // 240303 수정
  const [messages, setMessages] = useState([]);
  const [animate, setAnimate] = useState(false);
  const [showQuickAlertBox, setShowQuickAlertBox] = useState(false);

  // 240303 수정
  useEffect(() => {
    const token = localStorage.getItem('token');
    // 권한을 확인하기 전에 토큰이 유효한지 확인합니다.
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // 권한을 확인하여 ROLE_FIRETEAM이면 WebSocket을 설정합니다.
        if (decoded.roles && decoded.roles.includes('ROLE_FIRETEAM')) {
          const userFs = decoded.fs; // fs 값이 토큰에 포함되어 있어야 합니다.

          const socket = new SockJS('http://34.64.96.111:8081/kafka'); // 스프링부트 서버의 WebSocket 엔드포인트 URL
          const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
              console.log('Connected to the WebSocket server');
              client.subscribe(`/topic/firestation/${userFs}`, (message) => {
                console.log('Received message:', message.body);
                try {
                  const newMessage = JSON.parse(message.body);
                  setMessages(prevMessages => [newMessage, ...prevMessages]);
                  setAnimate(true); // 필터링 후 애니메이션 상태를 true로 설정
                  setTimeout(() => setAnimate(false), 500); // 애니메이션 지속시간 후 false로 설정
                  setShowQuickAlertBox(true);

                } catch (error) {
                  console.error('Error parsing message:', error);
                }
              });
            },
            onDisconnect: () => {
              console.log('Disconnected from the WebSocket server');
              setShowQuickAlertBox(false);
            },
            // 연결 에러 핸들링
            onStompError: (frame) => {
              console.error('Broker reported error: ' + frame.headers['message']);
              console.error('Additional details: ' + frame.body);
            },
          });

          client.activate();

          return () => {
            client.deactivate();
          };
        }
      } catch (error) {
        console.error('Token decoding failed:', error);
        // 여기에서 추가적인 에러 처리 로직을 구현할 수 있습니다.
      }
    }
  }, []);
  // 240303 수정

  const handlecontact = () => {
    navigate('/fire/fire');
  }


  return (
    <>
      {userRole.includes('ROLE_FIRETEAM') && showQuickAlertBox && (
        <section className={`quick_alert_box pulse ${animate ? 'fade-in' : ''}`}>
          <Link to="/fire/result" className='link'>
            <FontAwesomeIcon className='icon' icon={faFire} />
            <h2>상황 발생</h2>
          </Link>
        </section>
      )}
      <header id="header">
        <section className="containerV1">
          <div className="itemBox">
            <div className={`menuBox_bg ${navActive ? '' : 'hidden'}`} onClick={toggleNav}></div> {/* 조건부 클래스 적용 */}
            <h1 id="logo" className={`${navActive ? 'logo_hide' : ''}`}> {/* 조건부 클래스 적용 */}
              <Link to="/" className='logo'>
                <img src="/images/logo.png" />
              </Link>
            </h1>
            {/* 모바일 열기 버튼 */}
            <div className="open_btn visible-sm visible-xs" onClick={toggleNav}> {/* 이벤트 핸들러 추가 */}
              <FontAwesomeIcon className='icon1' icon={faBars} />
            </div>
            <nav id="nav" className={`${navActive ? 'inactive' : ''}`}> {/* 조건부 클래스 적용 */}
              <div className="nav_inner">
                <div className="nav_topBox">
                  <Link to="/" className="nav_logo">zero wave tech</Link>
                  {/* 모바일 닫기 버튼 */}
                  <div className="close_btn visible-sm visible-xs" onClick={toggleNav}>
                    <span><FontAwesomeIcon className='icon1' icon={faTimes} /></span>
                  </div>
                </div>
                <ul className="outer">
                  {renderMenuItems()}
                </ul>
                <ul className='other_box'>
                  <li><button type='button' className='item contact' onClick={onOpenFireModal}>contact</button></li>
                  <li>
                    <Link to="https://play.google.com/store/games?hl=ko" className="item" target='_blank'>
                      <img src="https://cdn.sktapollo.com/developers/poc/app.apollo.agent/static/home2/a.store.aos.png" />
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </section>
      </header>
      {showSubtitle && <Subtitle />}
    </>
  );
  // 240303 수정
};



// 240301 수정
function App() {
  return (
    <BrowserRouter>
      <Main />
    </BrowserRouter>
  );
}
// 240301 수정

// 240303 수정
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
// 240303 수정

// 240301 수정
// 0304 수정
function Main() {
  const [showMypageModal, setShowMypageModal] = useState(false);
  const handleOpenMypageModal = () => setShowMypageModal(true);
  const handleCloseMypageModal = () => setShowMypageModal(false);  

  const location = useLocation(); // 여기서 useLocation을 호출

  const [showFireStationModal, setShowFireStationModal] = useState(false);

  const toggleFireStationModal = () => setShowFireStationModal(!showFireStationModal);

  return (
    <>
      <ScrollToTop />
      <Navigation onOpenModal={handleOpenMypageModal} onOpenFireModal={toggleFireStationModal} />
      {
        showMypageModal && (
          <Modal onClose={handleCloseMypageModal}>
            <Mypage onCloseModal={handleCloseMypageModal} />
          </Modal>
        )
      }
      {
        showFireStationModal && (
          <Modal_ff onClose={toggleFireStationModal}>
            <FireStation />
          </Modal_ff>
        )
      }
      {/* 0304 수정 */}
      {/* 240303 수정 */}
      <TransitionGroup>
        <CSSTransition
          key={location.key}
          classNames="fade"
          timeout={300}
        >
          <>
            <div className="App">
              <Routes location={location}>
                <Route path="/" element={<Mainpage />} />
                <Route path="/mountain" element={<Mountain />} />
                <Route path="/notice" element={<Notice />} />
                <Route path="/notice/:noticeId" element={<Notice_Detail />} />
                <Route path="/notice/new" element={<Notice_New />} />
                <Route path="/notice/update/:noticeId" element={<Notice_Update />} />
                <Route path="/reception" element={<Reception />} />
                <Route path="/login" element={<Signup />} />
                <Route path="/admin/login" element={<Admin_Signup />} />
                <Route path="/fire/login" element={<Fire_Signup />} />
                <Route path="/fire/result" element={<Result />} />
                <Route path="/fire/result/:command" element={<Result_Detail />} />
                <Route path="/fire/result/new/:command" element={<Result_New />} />
                <Route path="/fire/result/update/:command" element={<Result_Update />} />              
                <Route path="/admin/member" element={<Admin_user />} />               
                <Route path="/admin/result" element={<Admin_FireReception />} />
                <Route path="/admin/result/:command" element={<Admin_Result_Detail />} />                
              </Routes>
              <footer>
                COPYRIGHT © 2024 ZEROWAVE ALL RIGHTS RESERVED.
              </footer>
              <ScrollToTopButton />
            </div>
          </>
        </CSSTransition>
      </TransitionGroup>
      {/* 240303 수정 */}
    </>
  );
}
// 240301 수정

export default App;