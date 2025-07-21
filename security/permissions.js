// security/permissions.js - 权限控制系统

// 用户角色定义
const USER_ROLES = {
  ADMIN: 'admin',
  ASSET_MANAGER: 'asset_manager',
  INVESTOR: 'investor',
  AUDITOR: 'auditor',
  GUEST: 'guest'
};

// 资产状态定义
const ASSET_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  TOKENIZING: 'tokenizing',
  TOKENIZED: 'tokenized',
  SUSPENDED: 'suspended'
};

// 操作权限定义
const PERMISSIONS = {
  // 资产管理权限
  ASSET_CREATE: 'asset:create',
  ASSET_READ: 'asset:read',
  ASSET_UPDATE: 'asset:update',
  ASSET_DELETE: 'asset:delete',
  ASSET_APPROVE: 'asset:approve',
  ASSET_REJECT: 'asset:reject',
  
  // 文档权限
  DOCUMENT_UPLOAD: 'document:upload',
  DOCUMENT_VIEW: 'document:view',
  DOCUMENT_DOWNLOAD: 'document:download',
  DOCUMENT_DELETE: 'document:delete',
  
  // 代币化权限
  TOKEN_CREATE: 'token:create',
  TOKEN_MANAGE: 'token:manage',
  TOKEN_TRADE: 'token:trade',
  TOKEN_PAUSE: 'token:pause',
  
  // 财务权限
  FINANCE_VIEW: 'finance:view',
  FINANCE_EDIT: 'finance:edit',
  FINANCE_APPROVE: 'finance:approve',
  
  // 系统权限
  SYSTEM_ADMIN: 'system:admin',
  USER_MANAGE: 'user:manage',
  AUDIT_VIEW: 'audit:view'
};

// 权限矩阵 - 定义每个角色的权限
const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.ASSET_CREATE,
    PERMISSIONS.ASSET_READ,
    PERMISSIONS.ASSET_UPDATE,
    PERMISSIONS.ASSET_DELETE,
    PERMISSIONS.ASSET_APPROVE,
    PERMISSIONS.ASSET_REJECT,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_DOWNLOAD,
    PERMISSIONS.DOCUMENT_DELETE,
    PERMISSIONS.TOKEN_CREATE,
    PERMISSIONS.TOKEN_MANAGE,
    PERMISSIONS.TOKEN_PAUSE,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.FINANCE_EDIT,
    PERMISSIONS.FINANCE_APPROVE,
    PERMISSIONS.SYSTEM_ADMIN,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.AUDIT_VIEW
  ],
  
  [USER_ROLES.ASSET_MANAGER]: [
    PERMISSIONS.ASSET_CREATE,
    PERMISSIONS.ASSET_READ,
    PERMISSIONS.ASSET_UPDATE,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_DOWNLOAD,
    PERMISSIONS.TOKEN_CREATE,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.FINANCE_EDIT
  ],
  
  [USER_ROLES.INVESTOR]: [
    PERMISSIONS.ASSET_READ,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.TOKEN_TRADE,
    PERMISSIONS.FINANCE_VIEW
  ],
  
  [USER_ROLES.AUDITOR]: [
    PERMISSIONS.ASSET_READ,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_DOWNLOAD,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.AUDIT_VIEW
  ],
  
  [USER_ROLES.GUEST]: [
    PERMISSIONS.ASSET_READ
  ]
};

// 基于资产状态的操作限制
const ASSET_STATUS_RESTRICTIONS = {
  [ASSET_STATUS.DRAFT]: {
    allowedOperations: [
      PERMISSIONS.ASSET_UPDATE,
      PERMISSIONS.ASSET_DELETE,
      PERMISSIONS.DOCUMENT_UPLOAD,
      PERMISSIONS.DOCUMENT_DELETE
    ],
    editableFields: ['all'] // 所有字段都可编辑
  },
  
  [ASSET_STATUS.PENDING_REVIEW]: {
    allowedOperations: [
      PERMISSIONS.ASSET_READ,
      PERMISSIONS.ASSET_APPROVE,
      PERMISSIONS.ASSET_REJECT,
      PERMISSIONS.DOCUMENT_VIEW
    ],
    editableFields: ['description', 'photos'] // 仅描述和图片可编辑
  },
  
  [ASSET_STATUS.APPROVED]: {
    allowedOperations: [
      PERMISSIONS.ASSET_READ,
      PERMISSIONS.TOKEN_CREATE,
      PERMISSIONS.DOCUMENT_VIEW,
      PERMISSIONS.DOCUMENT_UPLOAD
    ],
    editableFields: ['description', 'photos', 'contact_info']
  },
  
  [ASSET_STATUS.TOKENIZING]: {
    allowedOperations: [
      PERMISSIONS.ASSET_READ,
      PERMISSIONS.DOCUMENT_VIEW,
      PERMISSIONS.TOKEN_MANAGE
    ],
    editableFields: ['description'] // 代币化过程中只能编辑描述
  },
  
  [ASSET_STATUS.TOKENIZED]: {
    allowedOperations: [
      PERMISSIONS.ASSET_READ,
      PERMISSIONS.DOCUMENT_VIEW,
      PERMISSIONS.TOKEN_TRADE,
      PERMISSIONS.TOKEN_MANAGE
    ],
    editableFields: ['description'] // 已代币化，数据基本锁定
  },
  
  [ASSET_STATUS.REJECTED]: {
    allowedOperations: [
      PERMISSIONS.ASSET_READ,
      PERMISSIONS.ASSET_UPDATE,
      PERMISSIONS.DOCUMENT_UPLOAD,
      PERMISSIONS.DOCUMENT_DELETE
    ],
    editableFields: ['all'] // 被拒绝的资产可以重新编辑
  },
  
  [ASSET_STATUS.SUSPENDED]: {
    allowedOperations: [
      PERMISSIONS.ASSET_READ,
      PERMISSIONS.DOCUMENT_VIEW
    ],
    editableFields: [] // 暂停状态不允许编辑
  }
};

// 权限管理器类
class PermissionManager {
  constructor() {
    this.currentUser = null;
    this.userPermissions = new Set();
  }

  // 设置当前用户
  setCurrentUser(user) {
    this.currentUser = user;
    this.loadUserPermissions();
  }

  // 加载用户权限
  loadUserPermissions() {
    if (!this.currentUser || !this.currentUser.role) {
      this.userPermissions = new Set();
      return;
    }

    const rolePermissions = ROLE_PERMISSIONS[this.currentUser.role] || [];
    this.userPermissions = new Set(rolePermissions);

    // 如果用户有自定义权限，合并进来
    if (this.currentUser.customPermissions) {
      this.currentUser.customPermissions.forEach(permission => {
        this.userPermissions.add(permission);
      });
    }

    // 如果用户被禁用某些权限，移除
    if (this.currentUser.revokedPermissions) {
      this.currentUser.revokedPermissions.forEach(permission => {
        this.userPermissions.delete(permission);
      });
    }
  }

  // 检查是否有权限
  hasPermission(permission) {
    if (!this.currentUser) return false;
    
    // 超级管理员拥有所有权限
    if (this.currentUser.role === USER_ROLES.ADMIN && this.currentUser.isSuperAdmin) {
      return true;
    }

    return this.userPermissions.has(permission);
  }

  // 检查多个权限（需要全部满足）
  hasAllPermissions(permissions) {
    return permissions.every(permission => this.hasPermission(permission));
  }

  // 检查多个权限（满足任一即可）
  hasAnyPermission(permissions) {
    return permissions.some(permission => this.hasPermission(permission));
  }

  // 检查对特定资产的操作权限
  canOperateAsset(assetId, operation, assetStatus = null, assetOwnerId = null) {
    // 首先检查基础权限
    if (!this.hasPermission(operation)) {
      return {
        allowed: false,
        reason: '用户角色权限不足'
      };
    }

    // 检查资产所有权（非管理员只能操作自己的资产）
    if (assetOwnerId && this.currentUser.role !== USER_ROLES.ADMIN) {
      if (this.currentUser.id !== assetOwnerId) {
        return {
          allowed: false,
          reason: '只能操作自己创建的资产'
        };
      }
    }

    // 检查资产状态限制
    if (assetStatus) {
      const statusRestrictions = ASSET_STATUS_RESTRICTIONS[assetStatus];
      if (statusRestrictions && !statusRestrictions.allowedOperations.includes(operation)) {
        return {
          allowed: false,
          reason: `资产当前状态(${assetStatus})不允许此操作`
        };
      }
    }

    return {
      allowed: true,
      reason: null
    };
  }

  // 检查字段编辑权限
  canEditField(fieldName, assetStatus) {
    const statusRestrictions = ASSET_STATUS_RESTRICTIONS[assetStatus];
    if (!statusRestrictions) return true;

    const editableFields = statusRestrictions.editableFields;
    
    // 如果允许编辑所有字段
    if (editableFields.includes('all')) return true;
    
    // 检查特定字段
    return editableFields.includes(fieldName);
  }

  // 获取用户可编辑的字段列表
  getEditableFields(assetStatus) {
    const statusRestrictions = ASSET_STATUS_RESTRICTIONS[assetStatus];
    if (!statusRestrictions) return [];

    return statusRestrictions.editableFields;
  }

  // 检查是否为资产所有者
  isAssetOwner(assetOwnerId) {
    return this.currentUser && this.currentUser.id === assetOwnerId;
  }

  // 获取权限错误信息
  getPermissionError(permission) {
    const errorMessages = {
      [PERMISSIONS.ASSET_CREATE]: '您没有权限创建资产',
      [PERMISSIONS.ASSET_UPDATE]: '您没有权限编辑资产',
      [PERMISSIONS.ASSET_DELETE]: '您没有权限删除资产',
      [PERMISSIONS.ASSET_APPROVE]: '您没有权限审核资产',
      [PERMISSIONS.TOKEN_CREATE]: '您没有权限创建代币',
      [PERMISSIONS.TOKEN_MANAGE]: '您没有权限管理代币',
      [PERMISSIONS.FINANCE_EDIT]: '您没有权限编辑财务信息'
    };

    return errorMessages[permission] || '权限不足';
  }
}

// 权限装饰器函数
function requirePermission(permission) {
  return function(target, propertyName, descriptor) {
    const method = descriptor.value;

    descriptor.value = function(...args) {
      if (!permissionManager.hasPermission(permission)) {
        throw new Error(permissionManager.getPermissionError(permission));
      }
      return method.apply(this, args);
    };

    return descriptor;
  };
}

// 资产权限装饰器
function requireAssetPermission(operation) {
  return function(target, propertyName, descriptor) {
    const method = descriptor.value;

    descriptor.value = function(assetId, ...args) {
      // 假设第一个参数是资产ID，需要从中获取资产信息
      const asset = this.getAssetFromId ? this.getAssetFromId(assetId) : null;
      const result = permissionManager.canOperateAsset(
        assetId, 
        operation, 
        asset?.status, 
        asset?.ownerId
      );

      if (!result.allowed) {
        throw new Error(result.reason);
      }

      return method.apply(this, [assetId, ...args]);
    };

    return descriptor;
  };
}

// 权限验证中间件（用于页面级别）
class PermissionMiddleware {
  static checkPageAccess(requiredPermissions = []) {
    const hasAccess = requiredPermissions.length === 0 || 
                     permissionManager.hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      this.redirectToUnauthorized();
      return false;
    }

    return true;
  }

  static redirectToUnauthorized() {
    window.location.href = '/unauthorized.html';
  }

  static hideElementsByPermission() {
    // 隐藏没有权限的UI元素
    document.querySelectorAll('[data-permission]').forEach(element => {
      const requiredPermission = element.getAttribute('data-permission');
      if (!permissionManager.hasPermission(requiredPermission)) {
        element.style.display = 'none';
      }
    });
  }

  static disableButtonsByPermission() {
    // 禁用没有权限的按钮
    document.querySelectorAll('[data-permission]').forEach(element => {
      const requiredPermission = element.getAttribute('data-permission');
      if (!permissionManager.hasPermission(requiredPermission)) {
        element.disabled = true;
        element.title = '您没有权限执行此操作';
        element.classList.add('opacity-50', 'cursor-not-allowed');
      }
    });
  }
}

// 创建全局权限管理器实例
const permissionManager = new PermissionManager();

// 页面权限检查函数
function checkPagePermissions(requiredPermissions) {
  return PermissionMiddleware.checkPageAccess(requiredPermissions);
}

// UI权限更新函数
function updateUIPermissions() {
  PermissionMiddleware.hideElementsByPermission();
  PermissionMiddleware.disableButtonsByPermission();
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    USER_ROLES,
    ASSET_STATUS,
    PERMISSIONS,
    ROLE_PERMISSIONS,
    ASSET_STATUS_RESTRICTIONS,
    PermissionManager,
    PermissionMiddleware,
    permissionManager,
    requirePermission,
    requireAssetPermission,
    checkPagePermissions,
    updateUIPermissions
  };
} else {
  // 浏览器环境
  window.USER_ROLES = USER_ROLES;
  window.ASSET_STATUS = ASSET_STATUS;
  window.PERMISSIONS = PERMISSIONS;
  window.ROLE_PERMISSIONS = ROLE_PERMISSIONS;
  window.ASSET_STATUS_RESTRICTIONS = ASSET_STATUS_RESTRICTIONS;
  window.PermissionManager = PermissionManager;
  window.PermissionMiddleware = PermissionMiddleware;
  window.permissionManager = permissionManager;
  window.requirePermission = requirePermission;
  window.requireAssetPermission = requireAssetPermission;
  window.checkPagePermissions = checkPagePermissions;
  window.updateUIPermissions = updateUIPermissions;
}