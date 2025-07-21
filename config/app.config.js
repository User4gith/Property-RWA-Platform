// config/app.config.js - 应用配置文件

// 环境检测
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('dev');

const isProduction = window.location.hostname.includes('propertychain.com');

// 基础配置
const BASE_CONFIG = {
  // API配置
  API: {
    TIMEOUT: 30000, // 30秒超时
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1秒重试间隔
    
    // 请求头配置
    HEADERS: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Version': '1.0.0',
      'X-Platform': 'web'
    }
  },

  // 认证配置
  AUTH: {
    TOKEN_KEY: 'authToken',
    REFRESH_TOKEN_KEY: 'refreshToken',
    USER_KEY: 'currentUser',
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24小时
    REFRESH_THRESHOLD: 5 * 60 * 1000, // token过期前5分钟刷新
    AUTO_LOGOUT_WARNING: 5 * 60 * 1000, // 自动登出前5分钟警告
  },

  // 文件上传配置
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    CHUNK_SIZE: 1024 * 1024, // 1MB chunks for large files
    ALLOWED_TYPES: {
      DOCUMENTS: ['pdf', 'doc', 'docx', 'txt'],
      IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      VIDEOS: ['mp4', 'avi', 'mov'],
      SPREADSHEETS: ['xls', 'xlsx', 'csv']
    },
    
    // MIME类型映射
    MIME_TYPES: {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp'
    }
  },

  // UI配置
  UI: {
    // 通知配置
    NOTIFICATIONS: {
      DEFAULT_DURATION: 5000, // 5秒
      ERROR_DURATION: 8000, // 错误通知8秒
      SUCCESS_DURATION: 3000, // 成功通知3秒
      MAX_NOTIFICATIONS: 5, // 最多同时显示5个通知
      POSITION: 'top-right'
    },

    // 分页配置
    PAGINATION: {
      DEFAULT_PAGE_SIZE: 20,
      PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
      MAX_PAGE_SIZE: 100
    },

    // 表格配置
    TABLE: {
      DEFAULT_SORT: 'created_at',
      DEFAULT_ORDER: 'desc',
      VIRTUAL_SCROLL_THRESHOLD: 100 // 超过100行启用虚拟滚动
    },

    // 图表配置
    CHARTS: {
      DEFAULT_THEME: 'light',
      ANIMATION_DURATION: 1000,
      RESPONSIVE: true
    }
  },

  // 缓存配置
  CACHE: {
    ENABLE: true,
    TTL: 5 * 60 * 1000, // 5分钟缓存
    MAX_SIZE: 50, // 最多缓存50个项目
    STORAGE_TYPE: 'sessionStorage', // localStorage 或 sessionStorage
    
    // 缓存策略
    STRATEGIES: {
      ASSETS: { ttl: 10 * 60 * 1000 }, // 资产数据缓存10分钟
      USER_PROFILE: { ttl: 30 * 60 * 1000 }, // 用户资料缓存30分钟
      STATIC_DATA: { ttl: 60 * 60 * 1000 } // 静态数据缓存1小时
    }
  },

  // 错误处理配置
  ERROR_HANDLING: {
    ENABLE_REPORTING: true,
    REPORTING_URL: '/api/errors',
    LOG_LEVEL: 'error', // debug, info, warn, error
    MAX_LOGS: 1000,
    REPORT_THRESHOLD: 'medium', // low, medium, high, critical
    
    // 错误重试配置
    RETRY_CONFIG: {
      NETWORK_ERRORS: { attempts: 3, delay: 1000 },
      API_ERRORS: { attempts: 2, delay: 2000 },
      TIMEOUT_ERRORS: { attempts: 2, delay: 5000 }
    }
  },

  // 权限配置
  PERMISSIONS: {
    CACHE_PERMISSIONS: true,
    CHECK_INTERVAL: 30 * 60 * 1000, // 30分钟检查一次权限
    STRICT_MODE: true, // 严格模式下，无权限直接隐藏元素
    
    // 默认权限策略
    DEFAULT_POLICY: 'deny', // allow 或 deny
    
    // 权限继承
    ROLE_INHERITANCE: {
      [USER_ROLES.ADMIN]: [], // 管理员不继承任何角色
      [USER_ROLES.ASSET_MANAGER]: [USER_ROLES.INVESTOR], // 资产管理员继承投资者权限
      [USER_ROLES.AUDITOR]: [USER_ROLES.GUEST] // 审计员继承访客权限
    }
  },

  // 数据验证配置
  VALIDATION: {
    REAL_TIME: true, // 实时验证
    DEBOUNCE_DELAY: 300, // 防抖延迟300ms
    
    // 字段验证规则
    RULES: {
      ASSET_NAME: {
        required: true,
        minLength: 2,
        maxLength: 100,
        pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s-_()（）]+$/
      },
      ASSET_VALUE: {
        required: true,
        min: 1000, // 最小1000元
        max: 10000000000 // 最大100亿
      },
      EMAIL: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      PHONE: {
        required: false,
        pattern: /^1[3-9]\d{9}$/
      }
    }
  },

  // 性能监控配置
  PERFORMANCE: {
    ENABLE_MONITORING: true,
    SAMPLE_RATE: 0.1, // 10%采样率
    REPORT_THRESHOLD: 2000, // 超过2秒的请求上报
    
    // 性能指标
    METRICS: {
      API_RESPONSE_TIME: true,
      PAGE_LOAD_TIME: true,
      COMPONENT_RENDER_TIME: false,
      MEMORY_USAGE: false
    }
  },

  // 国际化配置
  I18N: {
    DEFAULT_LOCALE: 'zh-CN',
    SUPPORTED_LOCALES: ['zh-CN', 'en-US'],
    FALLBACK_LOCALE: 'zh-CN',
    LOAD_PATH: '/locales/{{lng}}/{{ns}}.json'
  }
};

// 开发环境配置
const DEVELOPMENT_CONFIG = {
  API: {
    BASE_URL: 'http://localhost:3000/api/v1',
    MOCK_ENABLED: true, // 启用Mock数据
    MOCK_DELAY: 500 // Mock延迟500ms模拟网络请求
  },
  
  ERROR_HANDLING: {
    ENABLE_REPORTING: false, // 开发环境不上报错误
    LOG_LEVEL: 'debug',
    CONSOLE_OUTPUT: true
  },
  
  CACHE: {
    ENABLE: false // 开发环境禁用缓存
  },
  
  PERFORMANCE: {
    ENABLE_MONITORING: true,
    SAMPLE_RATE: 1.0, // 开发环境100%采样
    CONSOLE_OUTPUT: true
  },
  
  // 开发者工具
  DEV_TOOLS: {
    ENABLE_REDUX_DEVTOOLS: true,
    ENABLE_REACT_DEVTOOLS: true,
    SHOW_PERFORMANCE_OVERLAY: true,
    LOG_API_REQUESTS: true,
    LOG_PERMISSION_CHECKS: true
  }
};

// 生产环境配置
const PRODUCTION_CONFIG = {
  API: {
    BASE_URL: 'https://api.propertychain.com/v1',
    MOCK_ENABLED: false
  },
  
  ERROR_HANDLING: {
    ENABLE_REPORTING: true,
    LOG_LEVEL: 'error',
    CONSOLE_OUTPUT: false // 生产环境不输出到控制台
  },
  
  CACHE: {
    ENABLE: true,
    TTL: 10 * 60 * 1000 // 生产环境缓存时间更长
  },
  
  PERFORMANCE: {
    ENABLE_MONITORING: true,
    SAMPLE_RATE: 0.05, // 生产环境5%采样率
    CONSOLE_OUTPUT: false
  },
  
  // 安全配置
  SECURITY: {
    ENABLE_CSP: true, // 启用内容安全策略
    SECURE_COOKIES: true,
    HTTPS_ONLY: true,
    LOG_SECURITY_EVENTS: true
  }
};

// 测试环境配置
const TESTING_CONFIG = {
  API: {
    BASE_URL: 'https://test-api.propertychain.com/v1',
    TIMEOUT: 10000 // 测试环境超时时间短一些
  },
  
  ERROR_HANDLING: {
    ENABLE_REPORTING: false,
    LOG_LEVEL: 'warn'
  },
  
  // 测试专用配置
  TESTING: {
    AUTO_LOGIN: true,
    MOCK_USER: {
      id: 'test-user-001',
      name: '测试用户',
      role: USER_ROLES.ASSET_MANAGER,
      email: 'test@propertychain.com'
    },
    SKIP_ANIMATIONS: true,
    FAST_TRANSITIONS: true
  }
};

// 配置合并函数
function mergeConfigs(base, environment) {
  function deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }
  
  return deepMerge(base, environment);
}

// 根据环境选择配置
function getEnvironmentConfig() {
  if (isDevelopment) {
    return mergeConfigs(BASE_CONFIG, DEVELOPMENT_CONFIG);
  } else if (isProduction) {
    return mergeConfigs(BASE_CONFIG, PRODUCTION_CONFIG);
  } else {
    // 测试环境或其他环境
    return mergeConfigs(BASE_CONFIG, TESTING_CONFIG);
  }
}

// 导出最终配置
const APP_CONFIG = getEnvironmentConfig();

// 配置验证函数
function validateConfig(config) {
  const requiredFields = [
    'API.BASE_URL',
    'AUTH.TOKEN_KEY',
    'ERROR_HANDLING.ENABLE_REPORTING'
  ];
  
  for (const field of requiredFields) {
    const value = field.split('.').reduce((obj, key) => obj?.[key], config);
    if (value === undefined || value === null) {
      throw new Error(`配置字段 ${field} 是必需的`);
    }
  }
  
  // 验证API基础URL格式
  try {
    new URL(config.API.BASE_URL);
  } catch (error) {
    throw new Error(`API基础URL格式无效: ${config.API.BASE_URL}`);
  }
  
  console.log('配置验证通过');
}

// 配置工具函数
const ConfigUtils = {
  // 获取配置值
  get(path, defaultValue = null) {
    return path.split('.').reduce((obj, key) => obj?.[key], APP_CONFIG) ?? defaultValue;
  },
  
  // 检查功能是否启用
  isEnabled(feature) {
    return this.get(feature, false) === true;
  },
  
  // 获取环境信息
  getEnvironment() {
    if (isDevelopment) return 'development';
    if (isProduction) return 'production';
    return 'testing';
  },
  
  // 是否为开发环境
  isDevelopment() {
    return isDevelopment;
  },
  
  // 是否为生产环境
  isProduction() {
    return isProduction;
  },
  
  // 获取完整配置
  getConfig() {
    return APP_CONFIG;
  },
  
  // 更新配置（仅开发环境允许）
  updateConfig(path, value) {
    if (!isDevelopment) {
      console.warn('配置更新仅在开发环境中允许');
      return false;
    }
    
    const keys = path.split('.');
    let current = APP_CONFIG;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    console.log(`配置已更新: ${path} = ${value}`);
    return true;
  }
};

// 初始化配置
try {
  validateConfig(APP_CONFIG);
  
  // 在开发环境中显示配置信息
  if (isDevelopment) {
    console.log('当前环境:', ConfigUtils.getEnvironment());
    console.log('应用配置:', APP_CONFIG);
  }
  
} catch (error) {
  console.error('配置初始化失败:', error);
  throw error;
}

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
  // Node.js环境
  module.exports = {
    APP_CONFIG,
    ConfigUtils,
    USER_ROLES,
    BASE_CONFIG,
    DEVELOPMENT_CONFIG,
    PRODUCTION_CONFIG,
    TESTING_CONFIG
  };
} else {
  // 浏览器环境
  window.APP_CONFIG = APP_CONFIG;
  window.ConfigUtils = ConfigUtils;
  
  // 为向后兼容保留的全局变量
  window.API_BASE_URL = APP_CONFIG.API.BASE_URL;
  window.IS_DEVELOPMENT = isDevelopment;
  window.IS_PRODUCTION = isProduction;
}