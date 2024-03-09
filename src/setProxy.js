const { createProxyMiddleware } = require("http-proxy-middleware");

// src/setupProxy.js
module.exports = function (app) {
  app.use(
    createProxyMiddleware("/api", {
      target: "{http://34.64.96.111:8081}", // 비즈니스 서버 URL 설정
      changeOrigin: true,
    })
  );
};