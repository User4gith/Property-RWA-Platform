// utils/errorHandler.js - 统一错误处理系统

// 错误类型定义
const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  API: 'API_ERROR',
  BUSINESS: 'BUSINESS_ERROR',
  SYSTEM: 'SYSTEM_ERROR',
  USER_INPUT: 'USER_INPUT_ERROR'
};

// 错误级别定义
const ERROR_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// 自定义错误类
class CustomError extends Error {
  constructor(message, type = ERROR_TYPES.SYSTEM, level = ERROR_LEVELS.MEDIUM, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.level = level;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.stack = (new Error()).stack;
  }
}

// 网络错误
class NetworkError extends CustomError {
  constructor(message, details = null) {
    super(message, ERROR_TYPES.NETWORK, ERROR_LEVELS.HIGH, details);
  }
}

// 验证错误
class ValidationError extends CustomError {
  constructor(message, field = null, value = null) {
    super(message, ERROR_TYPES.VALIDATION, ERROR_LEVELS.LOW, {
      field,
      value
    });
  }
}

// 权限错误
class PermissionError extends CustomError {
  constructor(message, requiredPermission = null) {
    super(message, ERROR_TYPES.PERMISSION, ERROR_LEVELS.MEDIUM, {
      requiredPermission
    });
  }
}

// 业务逻辑错误
class BusinessError extends CustomError {
  constructor(message, businessRule = null) {
    super(message, ERROR_TYPES.BUSINESS, ERROR_LEVELS.MEDIUM, {
      businessRule
    });
  }
}

// 错误日志记录器
class ErrorLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // 最大日志数量
    this.endpoint = '/api/errors'; // 错误上报接口
  }

  // 记录错误
  log(error, context = {}) {
    const logEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      message: error.message,
      type: error.type || ERROR_TYPES.SYSTEM,
      level: error.level || ERROR_LEVELS.MEDIUM,
      stack: error.stack,
      details: error.details,
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: this.getCurrentUserId(),
        sessionId: this.getSessionId(),
        ...context
      }
    };

    // 添加到本地日志
    this.logs.push(logEntry);
    
    // 清理过多的日志
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // 输出到控制台
    this.logToConsole(logEntry);

    // 上报到服务器（根据错误级别决定）
    if (this.shouldReport(error)) {
      this.reportToServer(logEntry);
    }

    return logEntry.id;
  }

  // 生成日志ID
  generateId() {
    return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // 获取当前用户ID
  getCurrentUserId() {
    return localStorage.getItem('userId') || 'anonymous';
  }

  // 获取会话ID
  getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  // 控制台输出
  logToConsole(logEntry) {
    const level = logEntry.level;
    const style = this.getConsoleStyle(level);
    
    console.group(`%c${level.toUpperCase()} - ${logEntry.type}`, style);
    console.error(logEntry.message);
    if (logEntry.details) {
      console.log('详细信息:', logEntry.details);
    }
    if (logEntry.context) {
      console.log('上下文:', logEntry.context);
    }
    if (logEntry.stack) {
      console.trace(logEntry.stack);
    }
    console.groupEnd();
  }

  // 获取控制台样式
  getConsoleStyle(level) {
    const styles = {
      [ERROR_LEVELS.LOW]: 'color: #FFA500; font-weight: bold;',
      [ERROR_LEVELS.MEDIUM]: 'color: #FF6347; font-weight: bold;',
      [ERROR_LEVELS.HIGH]: 'color: #DC143C; font-weight: bold;',
      [ERROR_LEVELS.CRITICAL]: 'color: #8B0000; font-weight: bold; background: #FFE4E1;'
    };
    return styles[level] || styles[ERROR_LEVELS.MEDIUM];
  }

  // 判断是否需要上报
  shouldReport(error) {
    // 高级别错误总是上报
    if (error.level === ERROR_LEVELS.HIGH || error.level === ERROR_LEVELS.CRITICAL) {
      return true;
    }

    // 网络错误和API错误上报
    if (error.type === ERROR_TYPES.NETWORK || error.type === ERROR_TYPES.API) {
      return true;
    }

    // 其他情况根据配置决定
    return this.getReportingConfig();
  }

  // 获取上报配置
  getReportingConfig() {
    return localStorage.getItem('errorReporting') !== 'disabled';
  }

  // 上报到服务器
  async reportToServer(logEntry) {
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(logEntry)
      });
    } catch (error) {
      console.warn('错误上报失败:', error);
    }
  }

  // 获取错误日志
  getLogs(filter = {}) {
    let filteredLogs = [...this.logs];

    if (filter.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filter.level);
    }

    if (filter.type) {
      filteredLogs = filteredLogs.filter(log => log.type === filter.type);
    }

    if (filter.startTime) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= new Date(filter.startTime)
      );
    }

    return filteredLogs.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }

  // 清理日志
  clearLogs() {
    this.logs = [];
  }
}

// 用户友好的错误消息管理器
class ErrorMessageManager {
  constructor() {
    this.messages = new Map();
    this.setupDefaultMessages();
  }

  // 设置默认错误消息
  setupDefaultMessages() {
    // 网络错误
    this.messages.set('NETWORK_CONNECTION_FAILED', '网络连接失败，请检查您的网络连接');
    this.messages.set('NETWORK_TIMEOUT', '请求超时，请稍后重试');
    this.messages.set('NETWORK_SERVER_ERROR', '服务器暂时无法处理请求，请稍后重试');

    // API错误
    this.messages.set('API_UNAUTHORIZED', '您的登录已过期，请重新登录');
    this.messages.set('API_FORBIDDEN', '您没有权限执行此操作');
    this.messages.set('API_NOT_FOUND', '请求的资源不存在');
    this.messages.set('API_RATE_LIMITED', '请求过于频繁，请稍后重试');

    // 验证错误
    this.messages.set('VALIDATION_REQUIRED_FIELD', '此字段为必填项');
    this.messages.set('VALIDATION_INVALID_EMAIL', '请输入有效的邮箱地址');
    this.messages.set('VALIDATION_INVALID_NUMBER', '请输入有效的数字');
    this.messages.set('VALIDATION_FILE_TOO_LARGE', '文件大小超出限制');
    this.messages.set('VALIDATION_INVALID_FILE_TYPE', '不支持的文件类型');

    // 业务错误
    this.messages.set('BUSINESS_ASSET_ALREADY_TOKENIZED', '该资产已经被代币化');
    this.messages.set('BUSINESS_INSUFFICIENT_BALANCE', '余额不足');
    this.messages.set('BUSINESS_ASSET_NOT_APPROVED', '资产尚未通过审核');
  }

  // 获取用户友好的错误消息
  getUserMessage(error) {
    // 如果是自定义错误并且有友好消息
    if (error.userMessage) {
      return error.userMessage;
    }

    // 根据错误代码获取消息
    if (error.code && this.messages.has(error.code)) {
      return this.messages.get(error.code);
    }

    // 根据HTTP状态码获取消息
    if (error.status) {
      return this.getMessageByStatus(error.status);
    }

    // 根据错误类型获取通用消息
    return this.getMessageByType(error.type);
  }

  // 根据HTTP状态码获取消息
  getMessageByStatus(status) {
    const statusMessages = {
      400: '请求参数有误，请检查输入信息',
      401: '您的登录已过期，请重新登录',
      403: '您没有权限执行此操作',
      404: '请求的资源不存在',
      409: '数据冲突，请刷新页面后重试',
      422: '提交的数据不符合要求',
      429: '请求过于频繁，请稍后重试',
      500: '服务器内部错误，请稍后重试',
      502: '服务器暂时无法访问，请稍后重试',
      503: '服务暂时不可用，请稍后重试'
    };

    return statusMessages[status] || '服务器错误，请稍后重试';
  }

  // 根据错误类型获取消息
  getMessageByType(type) {
    const typeMessages = {
      [ERROR_TYPES.NETWORK]: '网络连接出现问题，请检查网络设置',
      [ERROR_TYPES.VALIDATION]: '输入信息有误，请检查并重新填写',
      [ERROR_TYPES.PERMISSION]: '您没有权限执行此操作',
      [ERROR_TYPES.API]: '服务器响应异常，请稍后重试',
      [ERROR_TYPES.BUSINESS]: '操作失败，请检查业务规则',
      [ERROR_TYPES.SYSTEM]: '系统异常，请稍后重试'
    };

    return typeMessages[type] || '发生未知错误，请稍后重试';
  }

  // 添加自定义消息
  addMessage(key, message) {
    this.messages.set(key, message);
  }
}

// UI通知管理器
class UINotificationManager {
  constructor() {
    this.container = null;
    this.notifications = new Map();
    this.createContainer();
  }

  // 创建通知容器
  createContainer() {
    if (document.getElementById('notification-container')) {
      this.container = document.getElementById('notification-container');
      return;
    }

    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.className = 'fixed top-4 right-4 z-50 space-y-2';
    this.container.style.zIndex = '9999';
    document.body.appendChild(this.container);
  }

  // 显示错误通知
  showError(message, options = {}) {
    return this.showNotification(message, 'error', options);
  }

  // 显示警告通知
  showWarning(message, options = {}) {
    return this.showNotification(message, 'warning', options);
  }

  // 显示成功通知
  showSuccess(message, options = {}) {
    return this.showNotification(message, 'success', options);
  }

  // 显示信息通知
  showInfo(message, options = {}) {
    return this.showNotification(message, 'info', options);
  }

  // 显示通知
  showNotification(message, type = 'info', options = {}) {
    const id = 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const duration = options.duration || (type === 'error' ? 8000 : 5000);
    const closable = options.closable !== false;

    const notification = this.createNotificationElement(id, message, type, closable);
    this.container.appendChild(notification);
    this.notifications.set(id, notification);

    // 入场动画
    setTimeout(() => {
      notification.classList.add('opacity-100', 'translate-x-0');
      notification.classList.remove('opacity-0', 'translate-x-full');
    }, 10);

    // 自动关闭
    if (duration > 0) {
      setTimeout(() => {
        this.hideNotification(id);
      }, duration);
    }

    return id;
  }

  // 创建通知元素
  createNotificationElement(id, message, type, closable) {
    const notification = document.createElement('div');
    notification.className = `
      opacity-0 translate-x-full transform transition-all duration-300 ease-in-out
      max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5
    `;

    const colors = {
      error: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-800', icon: 'text-red-400' },
      warning: { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-800', icon: 'text-yellow-400' },
      success: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-800', icon: 'text-green-400' },
      info: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-800', icon: 'text-blue-400' }
    };

    const icons = {
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      success: 'fa-check-circle',
      info: 'fa-info-circle'
    };

    const color = colors[type] || colors.info;
    const icon = icons[type] || icons.info;

    notification.innerHTML = `
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <i class="fas ${icon} ${color.icon}"></i>
          </div>
          <div class="ml-3 w-0 flex-1">
            <p class="text-sm font-medium ${color.text}">${message}</p>
          </div>
          ${closable ? `
            <div class="ml-4 flex-shrink-0 flex">
              <button onclick="uiNotificationManager.hideNotification('${id}')" 
                      class="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none">
                <i class="fas fa-times"></i>
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    return notification;
  }

  // 隐藏通知
  hideNotification(id) {
    const notification = this.notifications.get(id);
    if (!notification) return;

    // 退场动画
    notification.classList.add('opacity-0', 'translate-x-full');
    notification.classList.remove('opacity-100', 'translate-x-0');

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      this.notifications.delete(id);
    }, 300);
  }

  // 清除所有通知
  clearAll() {
    this.notifications.forEach((notification, id) => {
      this.hideNotification(id);
    });
  }
}

// 全局错误处理器
class GlobalErrorHandler {
  constructor() {
    this.logger = new ErrorLogger();
    this.messageManager = new ErrorMessageManager();
    this.notificationManager = new UINotificationManager();
    this.setupGlobalHandlers();
  }

  // 设置全局错误处理
  setupGlobalHandlers() {
    // 捕获未处理的JavaScript错误
    window.addEventListener('error', (event) => {
      const error = new CustomError(
        event.message,
        ERROR_TYPES.SYSTEM,
        ERROR_LEVELS.HIGH,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      );
      this.handleError(error);
    });

    // 捕获未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      const error = new CustomError(
        event.reason?.message || '未处理的Promise拒绝',
        ERROR_TYPES.SYSTEM,
        ERROR_LEVELS.MEDIUM,
        event.reason
      );
      this.handleError(error);
      event.preventDefault(); // 阻止在控制台输出
    });

    // 捕获资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        const error = new CustomError(
          `资源加载失败: ${event.target.src || event.target.href}`,
          ERROR_TYPES.NETWORK,
          ERROR_LEVELS.LOW
        );
        this.handleError(error, { showNotification: false });
      }
    }, true);
  }

  // 处理错误
  handleError(error, options = {}) {
    // 记录错误
    const logId = this.logger.log(error, options.context);

    // 显示用户友好的通知
    if (options.showNotification !== false) {
      const userMessage = this.messageManager.getUserMessage(error);
      
      if (error.level === ERROR_LEVELS.CRITICAL || error.level === ERROR_LEVELS.HIGH) {
        this.notificationManager.showError(userMessage, { duration: 0 }); // 不自动关闭
      } else if (error.level === ERROR_LEVELS.MEDIUM) {
        this.notificationManager.showWarning(userMessage);
      } else {
        this.notificationManager.showInfo(userMessage);
      }
    }

    // 执行自定义错误处理回调
    if (options.onError && typeof options.onError === 'function') {
      options.onError(error, logId);
    }

    return logId;
  }

  // 处理API错误
  handleAPIError(error, options = {}) {
    let customError;

    if (error instanceof APIError) {
      customError = new CustomError(
        error.message,
        ERROR_TYPES.API,
        this.getErrorLevelByStatus(error.status),
        { status: error.status, details: error.details }
      );
    } else {
      customError = new CustomError(
        error.message || 'API请求失败',
        ERROR_TYPES.API,
        ERROR_LEVELS.MEDIUM
      );
    }

    return this.handleError(customError, options);
  }

  // 根据HTTP状态码获取错误级别
  getErrorLevelByStatus(status) {
    if (status >= 500) return ERROR_LEVELS.HIGH;
    if (status >= 400) return ERROR_LEVELS.MEDIUM;
    return ERROR_LEVELS.LOW;
  }

  // 处理验证错误
  handleValidationError(field, message, value = null) {
    const error = new ValidationError(message, field, value);
    return this.handleError(error);
  }

  // 处理权限错误
  handlePermissionError(message, requiredPermission = null) {
    const error = new PermissionError(message, requiredPermission);
    return this.handleError(error);
  }

  // 处理业务逻辑错误
  handleBusinessError(message, businessRule = null) {
    const error = new BusinessError(message, businessRule);
    return this.handleError(error);
  }
}

// 创建全局实例
const errorLogger = new ErrorLogger();
const errorMessageManager = new ErrorMessageManager();
const uiNotificationManager = new UINotificationManager();
const globalErrorHandler = new GlobalErrorHandler();

// 便捷函数
function handleError(error, options = {}) {
  return globalErrorHandler.handleError(error, options);
}

function handleAPIError(error, options = {}) {
  return globalErrorHandler.handleAPIError(error, options);
}

function showErrorMessage(message, options = {}) {
  return uiNotificationManager.showError(message, options);
}

function showSuccessMessage(message, options = {}) {
  return uiNotificationManager.showSuccess(message, options);
}

function showWarningMessage(message, options = {}) {
  return uiNotificationManager.showWarning(message, options);
}

function showInfoMessage(message, options = {}) {
  return uiNotificationManager.showInfo(message, options);
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ERROR_TYPES,
    ERROR_LEVELS,
    CustomError,
    NetworkError,
    ValidationError,
    PermissionError,
    BusinessError,
    ErrorLogger,
    ErrorMessageManager,
    UINotificationManager,
    GlobalErrorHandler,
    errorLogger,
    errorMessageManager,
    uiNotificationManager,
    globalErrorHandler,
    handleError,
    handleAPIError,
    showErrorMessage,
    showSuccessMessage,
    showWarningMessage,
    showInfoMessage
  };
} else {
  // 浏览器环境
  window.ERROR_TYPES = ERROR_TYPES;
  window.ERROR_LEVELS = ERROR_LEVELS;
  window.CustomError = CustomError;
  window.NetworkError = NetworkError;
  window.ValidationError = ValidationError;
  window.PermissionError = PermissionError;
  window.BusinessError = BusinessError;
  window.ErrorLogger = ErrorLogger;
  window.ErrorMessageManager = ErrorMessageManager;
  window.UINotificationManager = UINotificationManager;
  window.GlobalErrorHandler = GlobalErrorHandler;
  window.errorLogger = errorLogger;
  window.errorMessageManager = errorMessageManager;
  window.uiNotificationManager = uiNotificationManager;
  window.globalErrorHandler = globalErrorHandler;
  window.handleError = handleError;
  window.handleAPIError = handleAPIError;
  window.showErrorMessage = showErrorMessage;
  window.showSuccessMessage = showSuccessMessage;
  window.showWarningMessage = showWarningMessage;
  window.showInfoMessage = showInfoMessage;
}