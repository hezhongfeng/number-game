# 开发指南

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 开发模式
```bash
npm run dev
# 或
yarn dev
```

### 构建生产版本
```bash
npm run build
# 或
yarn build
```

### 预览生产版本
```bash
npm run preview
# 或
yarn preview
```

## 📝 代码规范

### 1. Vue组件规范

#### 组件结构
```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup>
// 导入语句
import { ref, computed } from 'vue'

// Props定义
const props = defineProps({
  // props定义
})

// Events定义
const emit = defineEmits({
  // events定义
})

// 响应式数据
const state = ref()

// 计算属性
const computed = computed(() => {
  // 计算逻辑
})

// 方法
const method = () => {
  // 方法实现
}
</script>

<style scoped>
/* 组件样式 */
</style>
```

#### Props验证
```javascript
const props = defineProps({
  score: {
    type: Number,
    required: true,
    validator: (value) => value >= 0
  },
  mode: {
    type: String,
    default: 'choice',
    validator: (value) => ['choice', 'speak'].includes(value)
  }
})
```

### 2. Composables规范

#### 文件结构
```javascript
/**
 * 功能描述
 */
import { ref, computed } from 'vue'

export function useFeature() {
  // 状态定义
  const state = ref()
  
  // 计算属性
  const computed = computed(() => {
    // 计算逻辑
  })
  
  // 方法
  const method = () => {
    // 方法实现
  }
  
  // 返回API
  return {
    state,
    computed,
    method
  }
}
```

### 3. 服务类规范

#### 类结构
```javascript
/**
 * 服务描述
 */
export class Service {
  constructor() {
    // 初始化
  }
  
  /**
   * 方法描述
   * @param {type} param - 参数描述
   * @returns {type} 返回值描述
   */
  method(param) {
    // 方法实现
  }
}

export default new Service()
```

## 🎨 样式规范

### 1. CSS变量使用
```css
/* 使用CSS变量 */
.component {
  color: var(--primary-color);
  font-size: var(--font-size-base);
  padding: var(--spacing-md);
}
```

### 2. 响应式设计
```css
/* 移动端优先 */
.component {
  /* 基础样式 */
}

@media (min-width: 768px) {
  .component {
    /* 平板样式 */
  }
}

@media (min-width: 1024px) {
  .component {
    /* 桌面样式 */
  }
}
```

### 3. 动画规范
```css
/* 使用CSS变量定义动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-duration) var(--transition-easing);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
```

## 🔧 工具函数

### 1. 创建新工具函数
```javascript
// src/utils/newUtils.js
export const NewUtils = {
  /**
   * 函数描述
   * @param {type} param - 参数描述
   * @returns {type} 返回值描述
   */
  method(param) {
    // 实现逻辑
    return result
  }
}
```

### 2. 使用工具函数
```javascript
import { NewUtils } from '../utils/newUtils.js'

const result = NewUtils.method(param)
```

## 📊 状态管理

### 1. 全局状态
```javascript
// 在composables中定义全局状态
const globalState = {
  data: ref(initialValue),
  computed: computed(() => {
    // 计算逻辑
  })
}

export function useGlobalState() {
  return globalState
}
```

### 2. 本地状态
```javascript
// 在组件中定义本地状态
const localState = ref(initialValue)
const localComputed = computed(() => {
  // 基于本地状态的计算
})
```

## 🎯 业务逻辑

### 1. 游戏逻辑扩展
```javascript
// 在GameService中添加新功能
export class GameService {
  /**
   * 新功能描述
   */
  newFeature() {
    // 实现新功能
  }
}
```

### 2. 数据持久化
```javascript
// 使用StorageService保存数据
StorageService.saveData('key', data)
const data = StorageService.getData('key', defaultValue)
```

## 🧪 测试指南

### 1. 组件测试
```javascript
// 测试组件功能
import { mount } from '@vue/test-utils'
import Component from '../Component.vue'

describe('Component', () => {
  it('should render correctly', () => {
    const wrapper = mount(Component, {
      props: {
        // 测试props
      }
    })
    
    expect(wrapper.text()).toContain('expected text')
  })
})
```

### 2. 工具函数测试
```javascript
// 测试工具函数
import { Utils } from '../utils/index.js'

describe('Utils', () => {
  it('should calculate correctly', () => {
    const result = Utils.calculate(input)
    expect(result).toBe(expectedOutput)
  })
})
```

## 🐛 调试技巧

### 1. Vue DevTools
- 安装Vue DevTools浏览器扩展
- 查看组件状态和props
- 监控事件触发

### 2. 控制台调试
```javascript
// 使用console.log调试
console.log('Debug info:', data)

// 使用console.table显示表格数据
console.table(arrayData)

// 使用console.group分组显示
console.group('Group Name')
console.log('Item 1')
console.log('Item 2')
console.groupEnd()
```

### 3. 断点调试
```javascript
// 在代码中设置断点
debugger

// 或使用条件断点
if (condition) {
  debugger
}
```

## 📦 构建优化

### 1. 代码分割
```javascript
// 动态导入组件
const LazyComponent = defineAsyncComponent(() => 
  import('./LazyComponent.vue')
)
```

### 2. 资源优化
```javascript
// 优化图片加载
const imageUrl = new URL('../assets/image.png', import.meta.url).href
```

## 🔄 版本控制

### 1. Git提交规范
```bash
# 功能添加
git commit -m "feat: 添加新功能描述"

# 问题修复
git commit -m "fix: 修复问题描述"

# 文档更新
git commit -m "docs: 更新文档描述"

# 样式调整
git commit -m "style: 样式调整描述"

# 重构代码
git commit -m "refactor: 重构描述"
```

### 2. 分支管理
```bash
# 创建功能分支
git checkout -b feature/new-feature

# 创建修复分支
git checkout -b fix/bug-fix

# 合并到主分支
git checkout main
git merge feature/new-feature
```

## 📈 性能优化

### 1. 组件优化
```javascript
// 使用v-memo缓存渲染结果
<template>
  <div v-memo="[item.id, item.name]">
    {{ item.name }}
  </div>
</template>

// 使用v-once渲染一次
<template>
  <div v-once>
    {{ expensiveCalculation }}
  </div>
</template>
```

### 2. 计算属性优化
```javascript
// 避免在计算属性中进行复杂操作
const optimizedComputed = computed(() => {
  // 简单的计算逻辑
  return simpleCalculation(data.value)
})
```

## 🚨 错误处理

### 1. 全局错误处理
```javascript
// 在main.js中设置全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Global error:', err, info)
}
```

### 2. 组件错误处理
```javascript
// 在组件中处理错误
const handleError = (error) => {
  console.error('Component error:', error)
  // 显示用户友好的错误信息
}
```

## 📚 学习资源

### 1. Vue.js官方文档
- [Vue 3官方文档](https://vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [Pinia状态管理](https://pinia.vuejs.org/)

### 2. 开发工具
- [Vite构建工具](https://vitejs.dev/)
- [Vue DevTools](https://devtools.vuejs.org/)
- [ESLint代码检查](https://eslint.org/)

---

遵循这些开发指南将帮助你更好地维护和扩展项目。如有疑问，请参考相关文档或寻求团队帮助。