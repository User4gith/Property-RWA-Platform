// services/api.js - 统一API服务层
class APIService {
  constructor() {
    this.baseURL = process.env.API_BASE_URL || 'https://api.propertychain.com/v1';
    this.token = localStorage.getItem('authToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  // 通用请求方法
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };

    // 添加认证token
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      method: 'GET',
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      
      // 处理认证过期
      if (response.status === 401) {
        const refreshed = await this.refreshAuthToken();
        if (refreshed) {
          // 重试原请求
          headers['Authorization'] = `Bearer ${this.token}`;
          const retryResponse = await fetch(url, { ...config, headers });
          return this.handleResponse(retryResponse);
        } else {
          throw new APIError('认证失败，请重新登录', 401);
        }
      }

      return this.handleResponse(response);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(`网络请求失败: ${error.message}`, 0);
    }
  }

  // 处理响应
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let errorMessage = '请求失败';
      
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      }
      
      throw new APIError(errorMessage, response.status);
    }

    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  }

  // 刷新认证token
  async refreshAuthToken() {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        this.token = data.accessToken;
        localStorage.setItem('authToken', data.accessToken);
        if (data.refreshToken) {
          this.refreshToken = data.refreshToken;
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        return true;
      }
    } catch (error) {
      console.error('Token刷新失败:', error);
    }

    // 刷新失败，清除本地存储
    this.clearAuth();
    return false;
  }

  // 清除认证信息
  clearAuth() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }

  // GET请求
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }

  // POST请求
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT请求
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE请求
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // 文件上传
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // 添加其他数据
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // 不设置Content-Type，让浏览器自动设置multipart/form-data
      }
    });
  }
}

// 自定义错误类
class APIError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
  }
}

// 资产服务
class AssetService extends APIService {
  // 获取资产列表
  async getAssets(filters = {}) {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 20,
      status: filters.status,
      type: filters.type,
      city: filters.city,
      search: filters.search
    };
    
    // 移除空值
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });

    return this.get('/assets', params);
  }

  // 获取单个资产
  async getAsset(id) {
    if (!id) throw new APIError('资产ID不能为空', 400);
    return this.get(`/assets/${id}`);
  }

  // 创建资产
  async createAsset(assetData) {
    this.validateAssetData(assetData);
    return this.post('/assets', assetData);
  }

  // 更新资产
  async updateAsset(id, assetData) {
    if (!id) throw new APIError('资产ID不能为空', 400);
    this.validateAssetData(assetData, false); // 更新时允许部分字段
    return this.put(`/assets/${id}`, assetData);
  }

  // 删除资产
  async deleteAsset(id) {
    if (!id) throw new APIError('资产ID不能为空', 400);
    return this.delete(`/assets/${id}`);
  }

  // 上传资产文档
  async uploadDocument(assetId, file, documentType) {
    if (!assetId) throw new APIError('资产ID不能为空', 400);
    if (!file) throw new APIError('文件不能为空', 400);
    if (!documentType) throw new APIError('文档类型不能为空', 400);

    return this.uploadFile(`/assets/${assetId}/documents`, file, {
      documentType,
      fileName: file.name
    });
  }

  // 获取资产文档
  async getDocuments(assetId) {
    if (!assetId) throw new APIError('资产ID不能为空', 400);
    return this.get(`/assets/${assetId}/documents`);
  }

  // 验证资产数据
  validateAssetData(data, isCreate = true) {
    const required = ['name', 'type', 'address', 'area', 'value'];
    const optional = ['description', 'photos', 'buildingYear', 'floors'];

    if (isCreate) {
      required.forEach(field => {
        if (!data[field]) {
          throw new APIError(`${field}字段不能为空`, 400);
        }
      });
    }

    // 数据类型验证
    if (data.area && (typeof data.area !== 'number' || data.area <= 0)) {
      throw new APIError('面积必须是正数', 400);
    }

    if (data.value && (typeof data.value !== 'number' || data.value <= 0)) {
      throw new APIError('资产价值必须是正数', 400);
    }

    if (data.buildingYear && (data.buildingYear < 1900 || data.buildingYear > new Date().getFullYear())) {
      throw new APIError('建筑年份不合法', 400);
    }

    return true;
  }
}

// 代币化服务
class TokenizationService extends APIService {
  // 获取代币化列表
  async getTokenizations(filters = {}) {
    return this.get('/tokenizations', filters);
  }

  // 创建代币化申请
  async createTokenization(data) {
    this.validateTokenizationData(data);
    return this.post('/tokenizations', data);
  }

  // 获取代币化进度
  async getTokenizationProgress(id) {
    if (!id) throw new APIError('代币化ID不能为空', 400);
    return this.get(`/tokenizations/${id}/progress`);
  }

  // 更新代币化状态
  async updateTokenizationStatus(id, status, comments = '') {
    if (!id) throw new APIError('代币化ID不能为空', 400);
    if (!status) throw new APIError('状态不能为空', 400);

    return this.put(`/tokenizations/${id}/status`, {
      status,
      comments
    });
  }

  // 验证代币化数据
  validateTokenizationData(data) {
    const required = ['assetId', 'tokenName', 'tokenSymbol', 'totalSupply', 'tokenPrice'];
    
    required.forEach(field => {
      if (!data[field]) {
        throw new APIError(`${field}字段不能为空`, 400);
      }
    });

    if (data.totalSupply <= 0) {
      throw new APIError('代币总量必须大于0', 400);
    }

    if (data.tokenPrice <= 0) {
      throw new APIError('代币价格必须大于0', 400);
    }

    if (data.tokenSymbol.length > 10) {
      throw new APIError('代币符号不能超过10个字符', 400);
    }

    return true;
  }
}

// 认证服务
class AuthService extends APIService {
  // 登录
  async login(email, password) {
    if (!email || !password) {
      throw new APIError('邮箱和密码不能为空', 400);
    }

    const response = await this.post('/auth/login', { email, password });
    
    if (response.accessToken) {
      this.token = response.accessToken;
      localStorage.setItem('authToken', response.accessToken);
    }
    
    if (response.refreshToken) {
      this.refreshToken = response.refreshToken;
      localStorage.setItem('refreshToken', response.refreshToken);
    }

    return response;
  }

  // 登出
  async logout() {
    try {
      await this.post('/auth/logout', {
        refreshToken: this.refreshToken
      });
    } catch (error) {
      console.warn('登出请求失败:', error);
    } finally {
      this.clearAuth();
    }
  }

  // 获取当前用户信息
  async getCurrentUser() {
    return this.get('/auth/me');
  }

  // 重置密码
  async resetPassword(email) {
    if (!email) throw new APIError('邮箱不能为空', 400);
    return this.post('/auth/reset-password', { email });
  }
}

// 创建服务实例
const assetService = new AssetService();
const tokenizationService = new TokenizationService();
const authService = new AuthService();

// 导出服务
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    APIService,
    APIError,
    AssetService,
    TokenizationService,
    AuthService,
    assetService,
    tokenizationService,
    authService
  };
} else {
  // 浏览器环境
  window.APIService = APIService;
  window.APIError = APIError;
  window.AssetService = AssetService;
  window.TokenizationService = TokenizationService;
  window.AuthService = AuthService;
  window.assetService = assetService;
  window.tokenizationService = tokenizationService;
  window.authService = authService;
}