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
  <React.StrictMode>
    <IntelligentChat config={demoConfig} />
  </React.StrictMode>,
  document.getElementById('root')
);