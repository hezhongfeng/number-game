# 组件开发指南

## 🎯 概述

本项目已经完成了全面的架构优化，建立了现代化的 Vue 3 组件体系。本文档将指导开发者如何使用和扩展项目中的组件。

## 📋 项目结构总结

```
src/
├── composables/          # 状态管理和业务逻辑
│   ├── useGameState.js   # 游戏状态管理
│   ├── useGameLogic.js   # 游戏逻辑管理
│   └── useAudio.js       # 音频管理
├── components/
│   ├── common/           # 通用UI组件
│   │   ├── BaseButton.vue
│   │   ├── BaseCard.vue
│   │   └── BaseModal.vue
│   ├── game/             # 游戏特定组件
│   └── ui/               # 界面组件
├── types/                # 类型定义
│   └── props.js          # Props 验证器
├── utils/                # 工具函数
│   ├── helpers.js        # 通用工具
│   └── storage.js        # 存储管理
├── config/               # 配置文件
│   └── app.config.js     # 应用配置
├── constants/            # 常量定义
│   └── index.js          # 全局常量
└── assets/styles/        # 样式文件
    ├── variables.css     # CSS 变量
    ├── base.css          # 基础样式
    ├── animations.css    # 动画效果
    └── components.css    # 组件样式
```

## 🧩 通用组件使用指南

### 1. BaseButton 组件

功能强大的按钮组件，支持多种样式和状态。

```vue
<template>
  <!-- 基本使用 -->
  <BaseButton @click="handleClick">点击我</BaseButton>

  <!-- 不同变体 -->
  <BaseButton variant="primary">主按钮</BaseButton>
  <BaseButton variant="secondary">次按钮</BaseButton>
  <BaseButton variant="success">成功按钮</BaseButton>
  <BaseButton variant="error">错误按钮</BaseButton>

  <!-- 不同大小 -->
  <BaseButton size="sm">小按钮</BaseButton>
  <BaseButton size="lg">大按钮</BaseButton>

  <!-- 带图标 -->
  <BaseButton icon="🎮" icon-position="left">开始游戏</BaseButton>

  <!-- 加载状态 -->
  <BaseButton :loading="isLoading">保存中...</BaseButton>

  <!-- 禁用状态 -->
  <BaseButton :disabled="true">已禁用</BaseButton>

  <!-- 全宽按钮 -->
  <BaseButton full-width>全宽按钮</BaseButton>
</template>

<script setup>
import BaseButton from '@/components/common/BaseButton.vue'

const handleClick = () => {
  console.log('按钮被点击')
}
</script>
```

#### Props 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | String | 'primary' | 按钮变体: primary, secondary, success, error, warning, info, outline |
| `size` | String | 'md' | 按钮大小: sm, md, lg, xl |
| `icon` | String | '' | 图标字符 |
| `iconPosition` | String | 'left' | 图标位置: left, right |
| `disabled` | Boolean | false | 是否禁用 |
| `loading` | Boolean | false | 是否显示加载状态 |
| `fullWidth` | Boolean | false | 是否全宽 |
| `rounded` | Boolean | false | 是否圆角 |
| `ripple` | Boolean | true | 是否启用水波纹效果 |
| `soundEnabled` | Boolean | true | 是否启用音效 |

### 2. BaseCard 组件

通用卡片组件，适用于各种内容展示。

```vue
<template>
  <!-- 基本卡片 -->
  <BaseCard title="卡片标题" subtitle="卡片副标题">
    <p>这是卡片的内容</p>
  </BaseCard>

  <!-- 自定义头部和底部 -->
  <BaseCard>
    <template #header>
      <div class="custom-header">
        <h3>自定义头部</h3>
        <button>操作</button>
      </div>
    </template>

    <p>卡片内容</p>

    <template #footer>
      <BaseButton>确认</BaseButton>
      <BaseButton variant="secondary">取消</BaseButton>
    </template>
  </BaseCard>

  <!-- 不同变体和大小 -->
  <BaseCard variant="primary" size="lg" :animated="true">
    <p>主要卡片</p>
  </BaseCard>

  <!-- 加载状态 -->
  <BaseCard :loading="true" loading-text="正在加载...">
    <p>内容</p>
  </BaseCard>
</template>
```

#### Props 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | String | '' | 卡片标题 |
| `subtitle` | String | '' | 卡片副标题 |
| `variant` | String | 'default' | 卡片变体: default, primary, success, error, warning, info |
| `size` | String | 'md' | 卡片大小: sm, md, lg, xl |
| `loading` | Boolean | false | 是否显示加载状态 |
| `shadow` | String | 'md' | 阴影大小: none, sm, md, lg, xl |
| `rounded` | String | 'lg' | 圆角大小: none, sm, md, lg, xl, full |
| `animated` | Boolean | false | 是否启用进入动画 |
| `hoverable` | Boolean | false | 是否启用悬停效果 |

### 3. BaseModal 组件

功能完整的模态框组件。

```vue
<template>
  <!-- 基本模态框 -->
  <BaseModal v-model="showModal" title="模态框标题">
    <p>这是模态框的内容</p>

    <template #footer>
      <BaseButton @click="showModal = false">关闭</BaseButton>
    </template>
  </BaseModal>

  <!-- 不同大小 -->
  <BaseModal v-model="showLargeModal" size="lg" title="大模态框">
    <p>更大的模态框内容</p>
  </BaseModal>

  <!-- 全屏模态框 -->
  <BaseModal v-model="showFullModal" size="full" title="全屏模态框">
    <p>全屏模态框内容</p>
  </BaseModal>

  <!-- 自定义头部 -->
  <BaseModal v-model="showCustomModal">
    <template #header>
      <div class="custom-modal-header">
        <h2>自定义头部</h2>
        <span>额外信息</span>
      </div>
    </template>

    <p>模态框内容</p>
  </BaseModal>
</template>

<script setup>
import { ref } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'

const showModal = ref(false)
const showLargeModal = ref(false)
const showFullModal = ref(false)
const showCustomModal = ref(false)
</script>
```

#### Props 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | Boolean | - | 显示状态 (v-model) |
| `title` | String | '' | 模态框标题 |
| `closable` | Boolean | true | 是否显示关闭按钮 |
| `closeOnOverlay` | Boolean | true | 点击遮罩是否关闭 |
| `closeOnEscape` | Boolean | true | 按ESC是否关闭 |
| `size` | String | 'md' | 模态框大小: sm, md, lg, xl, full |
| `centered` | Boolean | true | 是否垂直居中 |
| `soundEnabled` | Boolean | true | 是否启用音效 |

## 🎮 Composables 使用指南

### 1. useGameState

游戏状态管理 Composable。

```javascript
import { useGameState } from '@/composables/useGameState'

export default {
  setup() {
    const gameState = useGameState()

    // 获取状态
    const {
      score,
      combo,
      currentScreen,
      currentDifficulty,
      isPlaying,
      accuracy
    } = gameState

    // 使用方法
    const startGame = () => {
      gameState.setScreen('game')
      gameState.startGame()
    }

    const updateScore = (points) => {
      gameState.updateScore(points)
    }

    return {
      score,
      combo,
      startGame,
      updateScore
    }
  }
}
```

### 2. useGameLogic

游戏逻辑管理 Composable。

```javascript
import { useGameLogic } from '@/composables/useGameLogic'

export default {
  setup() {
    const gameLogic = useGameLogic()

    const {
      difficultySettings,
      currentDifficultySettings,
      selectDifficulty,
      selectMode,
      startNewQuestion,
      checkAnswer
    } = gameLogic

    // 开始新游戏
    const startNewGame = () => {
      selectMode('choice')
    }

    // 检查答案
    const handleAnswer = (answer) => {
      const isCorrect = checkAnswer(answer)
      if (isCorrect) {
        // 答对了的处理
      }
    }

    return {
      difficultySettings,
      startNewGame,
      handleAnswer
    }
  }
}
```

### 3. useAudio

音频管理 Composable。

```javascript
import { useAudio } from '@/composables/useAudio'

export default {
  setup() {
    const audio = useAudio()

    const {
      isSupported,
      isListening,
      playNumber,
      playSound,
      startRecognition,
      verifyNumberSpeech
    } = audio

    // 播放数字
    const playNumberSound = async (number) => {
      try {
        await playNumber(number)
      } catch (error) {
        console.warn('播放失败:', error)
      }
    }

    // 语音识别
    const startVoiceRecognition = async () => {
      try {
        const result = await startRecognition()
        console.log('识别结果:', result)
      } catch (error) {
        console.warn('识别失败:', error)
      }
    }

    return {
      isSupported,
      playNumberSound,
      startVoiceRecognition
    }
  }
}
```

## 🎨 样式系统使用

### CSS 变量使用

```css
/* 在组件中使用预定义的CSS变量 */
.custom-component {
  background: var(--gradient-primary);
  color: var(--white);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
}

.custom-component:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

### 工具类使用

```html
<!-- 使用预定义的工具类 -->
<div class="flex items-center justify-between p-4 mb-6">
  <h1 class="text-2xl font-bold text-primary">标题</h1>
  <button class="btn btn-primary rounded-full">按钮</button>
</div>

<!-- 响应式设计 -->
<div class="grid grid-auto gap-4">
  <div class="card shadow-lg">卡片1</div>
  <div class="card shadow-lg">卡片2</div>
</div>
```

### 动画类使用

```html
<!-- 使用预定义的动画效果 -->
<div class="animate-fadeIn">淡入效果</div>
<div class="animate-slideInUp">上滑进入</div>
<div class="animate-bounce">弹跳效果</div>
<div class="animate-pulse">脉冲效果</div>

<!-- 延迟动画 -->
<div class="animate-fadeIn animate-delay-200">延迟淡入</div>

<!-- 悬停动画 -->
<button class="hover-bounce">悬停弹跳</button>
```

## 🛠️ 开发最佳实践

### 1. 组件开发规范

- **单一职责**：每个组件只负责一个功能
- **Props 验证**：使用 `types/props.js` 中的验证器
- **事件命名**：使用 kebab-case 命名事件
- **样式作用域**：使用 `scoped` 样式避免样式冲突

### 2. 状态管理规范

- **本地状态**：使用 `ref` 和 `reactive` 管理组件内部状态
- **跨组件状态**：使用 Composables 共享状态
- **持久化**：使用 `utils/storage.js` 管理本地存储

### 3. 性能优化建议

- **按需导入**：只导入需要的 Composables 和组件
- **计算属性**：使用 `computed` 缓存计算结果
- **事件清理**：在 `onUnmounted` 中清理事件监听器
- **异步处理**：使用 `try-catch` 处理异步错误

## 📚 扩展开发

### 添加新的 Composable

```javascript
// src/composables/useNewFeature.js
import { ref, computed } from 'vue'
import { APP_CONFIG } from '../config/app.config.js'

export function useNewFeature() {
  const state = ref(null)

  const computedValue = computed(() => {
    // 计算逻辑
  })

  const method = () => {
    // 方法逻辑
  }

  return {
    state,
    computedValue,
    method
  }
}
```

### 添加新的通用组件

```vue
<!-- src/components/common/NewComponent.vue -->
<template>
  <div :class="componentClasses">
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { validators } from '@/types/props.js'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: validators.oneOf(['default', 'primary', 'secondary'])
  }
})

const componentClasses = computed(() => {
  return [
    'new-component',
    `new-component-${props.variant}`
  ]
})
</script>

<style scoped>
.new-component {
  /* 样式定义 */
}
</style>
```

## 🎉 总结

经过全面的架构优化，项目现在具备了：

✅ **清晰的代码组织**：功能模块化，职责分离
✅ **强类型验证**：Props 和事件的严格验证
✅ **可复用组件**：通用 UI 组件库
✅ **现代化状态管理**：Composables 模式
✅ **统一的样式系统**：CSS 变量 + 工具类
✅ **良好的开发体验**：清晰的 API 和文档

这个架构为项目的长期维护和功能扩展奠定了坚实的基础！🚀
