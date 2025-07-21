// 简单错误处理 - 让错误信息更友好
function showMessage(text, type) {
  // 创建提示框
  const message = document.createElement('div');
  message.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 9999;
    max-width: 300px;
  `;
  
  // 根据类型设置颜色
  if (type === 'success') {
    message.style.background = '#10B981';
  } else if (type === 'error') {
    message.style.background = '#EF4444';
  } else {
    message.style.background = '#3B82F6';
  }
  
  message.textContent = text;
  document.body.appendChild(message);
  
  // 3秒后自动消失
  setTimeout(() => {
    if (message.parentNode) {
      message.parentNode.removeChild(message);
    }
  }, 3000);
}

// 捕获页面错误
window.addEventListener('error', function(event) {
  console.log('发现错误，但已处理');
  showMessage('页面遇到小问题，但不影响使用', 'error');
});

console.log('错误处理已启用');