import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp } from '@fortawesome/free-solid-svg-icons';
import './ScrollToTopButton.css'; // 스타일을 위한 CSS 파일

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // 사용자가 페이지를 얼마나 스크롤 했는지 감지하는 함수
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // 페이지 최상단으로 부드럽게 스크롤하는 함수
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <button onClick={scrollToTop} className="scroll-to-top-btn">
          <FontAwesomeIcon icon={faAngleUp} />
        </button>
      )}
    </>
  );
};

export default ScrollToTopButton;
