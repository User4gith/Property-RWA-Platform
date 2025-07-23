# 地产RWA平台UI演示项目目录结构

```
rwa-platform-demo/
├── 📄 index.html                      # 仪表盘主页面
├── 📄 README.md                       # 项目说明文档
│
├── 📁 pages/                          # 页面文件
│   ├── 📄 asset-list.html            # 资产列表管理
│   ├── 📄 asset-create.html          # 新增资产向导
│   ├── 📄 asset-detail.html          # 资产详情查看
│   ├── 📄 asset-tokenization.html    # 代币化管理
│   ├── 📄 compliance-center.html     # 合规管理中心
│   ├── 📄 document-center.html       # 文档管理中心
│   ├── 📄 revenue-reports.html       # 收益报告中心
│   ├── 📄 investor-dashboard.html    # 投资者概览
│   ├── 📄 smart-contracts.html       # 智能合约管理
│   ├── 📄 iot-monitoring.html        # IoT设备监控
│   └── 📄 profile-settings.html      # 账户设置
│
├── 📁 css/                           # 样式文件
│   ├── 📄 main.css                   # 主样式文件
│   ├── 📄 components.css             # 通用组件样式
│   ├── 📄 dashboard.css              # 仪表盘专用样式
│   ├── 📄 forms.css                  # 表单样式
│   ├── 📄 charts.css                 # 图表样式
│   └── 📄 responsive.css             # 响应式样式
│
├── 📁 js/                            # JavaScript文件
│   ├── 📁 core/                      # 核心功能
│   │   ├── 📄 app.js                 # 应用初始化
│   │   ├── 📄 navigation.js          # 页面导航
│   │   ├── 📄 mock-api.js            # 模拟API响应
│   │   └── 📄 local-storage.js       # 本地数据存储
│   │
│   ├── 📁 components/                # UI组件
│   │   ├── 📄 modal.js               # 模态框
│   │   ├── 📄 notification.js        # 消息通知
│   │   ├── 📄 data-table.js          # 数据表格
│   │   ├── 📄 file-upload.js         # 文件上传
│   │   ├── 📄 progress-tracker.js    # 进度追踪
│   │   ├── 📄 chart-renderer.js      # 图表渲染
│   │   └── 📄 form-wizard.js         # 表单向导
│   │
│   ├── 📁 modules/                   # 业务模块
│   │   ├── 📄 dashboard.js           # 仪表盘逻辑
│   │   ├── 📄 asset-manager.js       # 资产管理
│   │   ├── 📄 tokenization.js        # 代币化流程
│   │   ├── 📄 compliance.js          # 合规管理
│   │   ├── 📄 document-manager.js    # 文档管理
│   │   ├── 📄 revenue-tracker.js     # 收益追踪
│   │   ├── 📄 investor-portal.js     # 投资者门户
│   │   ├── 📄 contract-manager.js    # 合约管理
│   │   └── 📄 iot-monitor.js         # IoT监控
│   │
│   ├── 📁 data/                      # 数据文件
│   │   ├── 📄 mock-assets.js         # 模拟资产数据
│   │   ├── 📄 mock-transactions.js   # 模拟交易数据
│   │   ├── 📄 mock-investors.js      # 模拟投资者数据
│   │   ├── 📄 mock-documents.js      # 模拟文档数据
│   │   ├── 📄 mock-revenue.js        # 模拟收益数据
│   │   ├── 📄 mock-iot.js            # 模拟IoT数据
│   │   └── 📄 constants.js           # 常量定义
│   │
│   └── 📁 utils/                     # 工具函数
│       ├── 📄 formatters.js          # 数据格式化
│       ├── 📄 validators.js          # 表单验证
│       ├── 📄 date-helpers.js        # 日期处理
│       ├── 📄 currency-helpers.js    # 货币格式化
│       ├── 📄 chart-configs.js       # 图表配置
│       └── 📄 demo-helpers.js        # 演示辅助函数
│
└── 📁 docs/                          # 项目文档
    ├── 📄 DEMO-GUIDE.md              # 演示操作指南
    ├── 📄 UI-COMPONENTS.md           # UI组件说明
    ├── 📄 DATA-STRUCTURE.md          # 数据结构说明
    └── 📄 CUSTOMIZATION.md           # 定制化指南
```

## 📋 使用的在线资源

### 🎨 CSS框架
```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Font Awesome 图标 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<!-- 动画库 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
```

### 📊 JavaScript库
```html
<!-- Chart.js 图表库 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.min.js"></script>

<!-- Date处理 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.11.10/dayjs.min.js"></script>

<!-- 工具库 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>
```

### 🖼️ 图片资源
```javascript
// 在mock-assets.js中使用Unsplash等在线图片服务
const propertyImages = {
    office: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=400&fit=crop',
    retail: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=400&fit=crop',
    warehouse: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=400&fit=crop',
    residential: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=400&fit=crop'
};

// 头像图片
const avatarImages = {
    company: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop',
    placeholder: 'https://via.placeholder.com/40x40/6B7280/FFFFFF?text=CO'
};
```

### 🔤 字体资源
```css
/* 在main.css中引入Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

## 🚀 项目特点

### ✅ 优势
- **轻量化部署**：无需下载大量资源文件
- **始终最新**：自动使用最新版本的在线资源
- **快速启动**：直接打开HTML文件即可运行
- **网络优化**：利用CDN加速和缓存

### ⚠️ 注意事项
- **网络依赖**：需要稳定的互联网连接
- **资源可用性**：依赖第三方服务的稳定性
- **加载速度**：首次访问可能较慢

## 📝 文件组织原则

1. **页面分离**：每个功能模块独立HTML文件
2. **样式模块化**：按功能划分CSS文件
3. **脚本组件化**：可复用的JavaScript模块
4. **数据驱动**：丰富的mock数据支持演示
