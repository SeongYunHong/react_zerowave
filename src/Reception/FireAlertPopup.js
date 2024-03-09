import React, { useState, useEffect } from "react";
import * as StompJs from "@stomp/stompjs";
import { useNavigate, useParams } from "react-router-dom";

export default function FireAlertPopup() {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [fireAlertData, setFireAlertData] = useState(null);
  const [showPopUp, setShowPopUp] = useState(null);

  // WebSocket 연결 설정
  const connect = () => {
    const brokerURL = "ws://34.64.96.111:9092/ws"; // 실제 웹소켓 서버 주소로 변경해야 합니다.
    const newClient = new StompJs.Client({
      brokerURL,
      reconnectDelay: 5000,
      debug: (str) => {
        console.log(str);
      },
      onConnect: () => {
        subscribeToFireAlert();
      },
    });

    newClient.activate();
    setClient(newClient);
  };

  // 화재 경보 메시지 구독
  const subscribeToFireAlert = () => {
    client.subscribe("/topic/fireAlert", (message) => {
      const alertData = JSON.parse(message.body);
      setFireAlertData(alertData);
      setShowPopUp(true);
      // 메시지 수신 시 팝업창 표시 로직을 여기에 구현     
    });
  };

  // 웹소켓 연결 해제
  const disconnect = () => {
    if (client) {
      client.deactivate();
    }
  };

  useEffect(() => {
    connect();
    return () => disconnect(); // 컴포넌트 언마운트 시 연결 해제
  }, []);

  // 팝업창 렌더링 로직
  const renderPopup = () => {
    if (!fireAlertData) return null;

    return (
      <div style={{ position: "absolute", top: "20%", left: "20%", backgroundColor: "#fff", padding: "20px", zIndex: 1000 }}>
        <h2>Fire Alert!</h2>
        <p>Date: {fireAlertData.adate}</p>
        <p>Location: {fireAlertData.gps}</p>
        <p>Image: <img src={fireAlertData.imgurl} alt="Fire" style={{ width: "100%" }}/></p>
        <p>User HP: {fireAlertData.userHp}</p>
      </div>
    );
  };

  return (
    <>
      {renderPopup()}
    </>
  );
}
