// 简单权限系统
const UserPermissions = {
  // 默认用户权限
  currentUser: {
    name: 'XX地产',
    role: '项目方',
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canView: true
  },
  
  // 检查是否有权限
  hasPermission: function(action) {
    switch(action) {
      case 'create': return this.currentUser.canCreate;
      case 'edit': return this.currentUser.canEdit;
      case 'delete': return this.currentUser.canDelete;
      case 'view': return this.currentUser.canView;
      default: return false;
    }
  },
  
  // 检查按钮权限
  checkButtonPermissions: function() {
    // 隐藏没有权限的按钮
    const deleteButtons = document.querySelectorAll('[data-action="delete"]');
    deleteButtons.forEach(button => {
      if (!this.hasPermission('delete')) {
        button.style.display = 'none';
      }
    });
  }
};

// 页面加载完成后检查权限
document.addEventListener('DOMContentLoaded', function() {
  UserPermissions.checkButtonPermissions();
  console.log('权限检查完成');
});

console.log('权限系统已加载');