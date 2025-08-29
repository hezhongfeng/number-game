# 数字认读游戏 - 项目结构说明

## 📁 项目目录结构

```
countgame/
├── src/
│   ├── assets/                 # 静态资源
│   │   └── styles/            # 样式文件
│   │       ├── animations.css  # 动画样式
│   │       ├── base.css        # 基础样式
│   │       ├── components.css  # 组件样式
│   │       └── variables.css   # CSS变量
│   │
│   ├── components/            # Vue组件
│   │   ├── ChoiceMode.vue     # 选择模式组件
│   │   ├── GameHeader.vue     # 游戏头部组件
│   │   ├── GameStats.vue      # 游戏统计组件
│   │   ├── SpeakMode.vue      # 朗读模式组件
│   │   └── StartScreen.vue    # 开始页面组件
│   │
│   ├── composables/           # Vue组合式函数
│   │   ├── useAudio.js        # 音频管理
│   │   ├── useGameLogic.js    # 游戏逻辑
│   │   └── useGameState.js    # 游戏状态管理
│   │
│   ├── config/                # 配置文件
│   │   ├── app.config.js      # 应用配置
│   │   └── game.config.js     # 游戏配置
│   │
│   ├── constants/             # 常量定义
│   │   └── index.js           # 游戏常量
│   │
│   ├── services/              # 业务服务
│   │   ├── GameService.js     # 游戏业务逻辑
│   │   └── StorageService.js  # 数据持久化
│   │
│   ├── types/                 # 类型定义
│   │   └── props.js           # 组件Props类型
│   │
│   ├── utils/                 # 工具函数
│   │   └── index.js           # 通用工具
│   │
│   ├── App.vue                # 根组件
│   ├── main.js                # 应用入口
│   └── style.css              # 全局样式
│
├── index.html                 # HTML模板
├── package.json               # 项目配置
├── vite.config.js            # Vite配置
└── README.md                 # 项目说明
```

## 🏗️ 架构设计

### 1. 分层架构
- **表现层 (Components)**: Vue组件，负责UI展示和用户交互
- **业务层 (Services)**: 业务逻辑处理，数据操作
- **数据层 (Composables)**: 状态管理，响应式数据
- **工具层 (Utils)**: 通用工具函数，辅助功能

### 2. 组件设计原则
- **单一职责**: 每个组件只负责一个功能
- **可复用性**: 组件设计考虑复用场景
- **松耦合**: 组件间通过props和events通信
- **高内聚**: 相关功能集中在同一组件内

### 3. 状态管理
- **全局状态**: 使用Composables管理游戏核心状态
- **本地状态**: 组件内部状态使用ref/reactive
- **持久化**: 重要数据自动保存到localStorage

## 📦 核心模块说明

### Components (组件)
- `StartScreen.vue`: 游戏开始页面，难度和模式选择
- `GameHeader.vue`: 游戏头部，显示分数、连击等信息
- `ChoiceMode.vue`: 选择模式游戏界面
- `SpeakMode.vue`: 朗读模式游戏界面
- `GameStats.vue`: 游戏统计信息展示

### Composables (组合式函数)
- `useGameState.js`: 游戏状态管理，包括分数、连击、统计等
- `useGameLogic.js`: 游戏核心逻辑，题目生成、答案检查等
- `useAudio.js`: 音频功能，语音合成、语音识别等

### Services (服务)
- `GameService.js`: 游戏业务逻辑，题目生成、分数计算等
- `StorageService.js`: 数据持久化，本地存储管理

### Utils (工具)
- `NumberUtils`: 数字生成、数组操作等工具
- `TimeUtils`: 时间格式化、计算等工具
- `StorageUtils`: 本地存储安全操作
- `ScoreUtils`: 分数计算相关工具
- `ValidationUtils`: 数据验证工具

## 🔧 技术特性

### 1. 响应式设计
- 移动端优先设计
- 灵活的网格布局
- 自适应字体和间距

### 2. 无障碍支持
- 语音合成和识别
- 键盘导航支持
- 高对比度设计

### 3. 性能优化
- 组件懒加载
- 事件防抖处理
- 内存泄漏防护

### 4. 数据持久化
- 游戏进度自动保存
- 用户设置持久化
- 统计数据记录

## 🎯 开发规范

### 1. 命名规范
- 组件: PascalCase (如: `GameHeader.vue`)
- 文件: camelCase (如: `useGameState.js`)
- 常量: UPPER_SNAKE_CASE (如: `GAME_MODES`)
- 变量: camelCase (如: `currentScore`)

### 2. 代码组织
- 每个文件顶部包含功能说明注释
- 函数和方法添加JSDoc注释
- 复杂逻辑添加行内注释
- 导入语句按类型分组

### 3. 错误处理
- 所有异步操作包含错误处理
- 用户输入进行验证
- 优雅降级处理

### 4. 测试策略
- 核心业务逻辑单元测试
- 组件功能测试
- 用户交互流程测试

## 🚀 扩展指南

### 1. 添加新游戏模式
1. 在 `src/components/` 创建新模式组件
2. 在 `src/config/game.config.js` 添加模式配置
3. 在 `useGameLogic.js` 添加相应逻辑
4. 更新 `App.vue` 路由逻辑

### 2. 添加新难度等级
1. 在 `src/config/game.config.js` 更新 `DIFFICULTY_LEVELS`
2. 在 `GameService.js` 更新相关逻辑
3. 测试新难度的平衡性

### 3. 添加新功能
1. 评估功能复杂度，选择合适的架构层
2. 创建相应的服务或工具函数
3. 更新相关组件和状态管理
4. 添加必要的配置和常量

## 📈 性能监控

### 1. 关键指标
- 页面加载时间
- 组件渲染时间
- 内存使用情况
- 用户交互响应时间

### 2. 优化建议
- 定期清理无用代码
- 优化图片和资源大小
- 使用Web Workers处理复杂计算
- 实施代码分割策略

## 🔒 安全考虑

### 1. 数据安全
- 本地存储数据加密
- 用户输入验证和清理
- XSS攻击防护

### 2. 隐私保护
- 不收集敏感用户信息
- 本地数据处理
- 透明的数据使用政策

---

这个项目结构经过精心设计，旨在提供清晰的代码组织、良好的可维护性和扩展性。每个模块都有明确的职责，便于团队协作和后续维护。