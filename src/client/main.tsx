import { IntelligentChat } from './App';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// 创建示例配置
const demoConfig = {
  apiKey: 'YOUR_DEMO_KEY',
  socketUrl: 'http://localhost:3000'
};

ReactDOM.render(
  React.createElement(
    React.StrictMode,
    null,
    React.createElement(IntelligentChat, { config: demoConfig })
  ),
  document.getElementById('root')
);