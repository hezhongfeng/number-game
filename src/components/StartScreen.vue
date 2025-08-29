<template>
  <div class="start-screen-container">
    <!-- 顶部标题区域 -->
    <div class="header-section">
      <h1 class="game-title">数字认读游戏</h1>
      <div class="welcome-message">
        <p>选择难度和模式开始学习</p>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-section">
      <div class="difficulty-selector">
        <h2 class="section-title">选择难度</h2>
        <div class="difficulty-buttons">
          <button
            v-for="level in sortedDifficultySettings"
            :key="level.id"
            @click="selectDifficulty(level.id)"
            :class="[
              'difficulty-btn',
              { active: currentDifficulty === level.id && isValidDifficulty }
            ]"
            :disabled="!isValidDifficulty"
          >
            <span class="difficulty-text">{{ level.name }}</span>
            <span class="difficulty-range">({{ level.range[0] }}-{{ level.range[1] }})</span>
          </button>
        </div>
      </div>

      <div class="mode-selector">
        <div class="mode-header">
          <h2 class="section-title">选择模式</h2>
          <button @click="showTutorial" class="tutorial-btn">
            ❓ 新手教程
          </button>
        </div>
        <div class="mode-buttons">
          <button @click="selectMode('choice')" class="mode-btn choice-mode">
            <div class="mode-icon">🎯</div>
            <span class="mode-text">选择模式</span>
            <span class="mode-description">听声音选数字</span>
          </button>
          <button @click="selectMode('speak')" class="mode-btn speak-mode">
            <div class="mode-icon">🗣️</div>
            <span class="mode-text">朗读模式</span>
            <span class="mode-description">看数字念出来</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAudio } from '../composables/useAudio.js'

// 简单验证函数
const isValidDifficultyRange = (value) => value >= 1 && value <= 6
const isValidGameMode = (value) => ['choice', 'speak'].includes(value)

// Props 定义
const props = defineProps({
  difficultySettings: {
    type: Array,
    required: true
  },
  currentDifficulty: {
    type: Number,
    default: 1,
  }
})

// Events 定义
const emit = defineEmits({
  'select-difficulty': null,
  'select-mode': null,
  'show-tutorial': null
})

// 使用音频功能
const audio = useAudio()

// 获取难度图标
const getDifficultyIcon = (level) => {
  const icons = ['🌱', '🚀', '⭐', '🎯', '🏆', '🧠']
  return icons[level - 1] || '🎯'
}

// 获取难度进度
const getDifficultyProgress = (level) => {
  // TODO: 从本地存储或状态管理中获取真实进度
  const mockProgress = [75, 60, 45, 30, 15, 0]
  return mockProgress[level - 1] || 0
}

// 事件处理
const selectDifficulty = async (level) => {
  if (!isValidDifficultyRange(level)) {
    console.warn('Invalid difficulty level:', level)
    return
  }

  emit('select-difficulty', level)

  try {
    // 移除点击音效
  } catch (error) {
    console.warn('Failed to play sound:', error)
  }
}

const selectMode = async (mode) => {
  if (!isValidGameMode(mode)) {
    console.warn('Invalid game mode:', mode)
    return
  }

  emit('select-mode', mode)

  try {
    // 移除点击音效
  } catch (error) {
    console.warn('Failed to play sound:', error)
  }
}

const showTutorial = () => {
  emit('show-tutorial')
}

// 悬停音效（已移除）
const playHoverSound = async () => {
  try {
    // 移除悬停音效，避免干扰
  } catch (error) {
    // 静默失败
  }
}

// 计算属性
const isValidDifficulty = computed(() => {
  return isValidDifficultyRange(props.currentDifficulty)
})

const sortedDifficultySettings = computed(() => {
  return [...props.difficultySettings].sort((a, b) => a.id - b.id)
})
</script>

<style scoped>
/* 无边框全屏设计 */
.start-screen-container {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
  margin: 0;
}

/* 顶部标题区域 */
.header-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 40px 20px 30px 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.game-title {
  color: #2563EB;
  margin-bottom: 16px;
  font-size: 2.8em;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(37, 99, 235, 0.1);
  animation: titleGlow 2s ease-in-out infinite alternate;
}

.welcome-message {
  color: #64748B;
  font-size: 1.2em;
  font-weight: 500;
}

/* 主要内容区域 */
.content-section {
  flex: 1;
  padding: 30px 20px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.section-title {
  color: #FFFFFF;
  margin-bottom: 24px;
  font-size: 1.6em;
  font-weight: 600;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.difficulty-selector,
.mode-selector {
  margin-bottom: 40px;
}

.mode-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.tutorial-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.9);
  color: #6B7280;
  font-size: 0.9em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.tutorial-btn:hover {
  background: rgba(255, 255, 255, 1);
  color: #3B82F6;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.2);
}

.difficulty-buttons,
.mode-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.difficulty-btn,
.mode-btn {
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.difficulty-btn::before,
.mode-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.difficulty-btn:hover::before,
.mode-btn:hover::before {
  left: 100%;
}

.difficulty-btn:hover,
.mode-btn:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 1);
}

.difficulty-btn.active {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  border: 3px solid #1D4ED8;
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 15px 40px rgba(59, 130, 246, 0.5);
  position: relative;
  animation: selectedPulse 2s ease-in-out infinite;
}

.difficulty-btn.active::after {
  content: '✓';
  position: absolute;
  top: 8px;
  right: 8px;
  background: #10B981;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
}

.mode-icon {
  font-size: 2.5em;
  margin-bottom: 8px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.choice-mode:hover .mode-icon {
  animation: bounce 0.6s ease-in-out;
}

.speak-mode:hover .mode-icon {
  animation: pulse 0.6s ease-in-out;
}

.difficulty-text,
.mode-text {
  font-size: 1.2em;
  font-weight: 700;
  color: #374151;
}

.difficulty-range,
.mode-description {
  font-size: 1em;
  color: #6B7280;
  font-weight: 500;
}

.difficulty-btn.active .difficulty-text,
.difficulty-btn.active .difficulty-range {
  color: #FFFFFF;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.difficulty-btn.active .difficulty-text {
  font-weight: 800;
}

/* 动画效果 */
@keyframes titleGlow {
  0% {
    text-shadow: 0 2px 4px rgba(37, 99, 235, 0.1);
  }
  100% {
    text-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes selectedPulse {
  0%, 100% {
    box-shadow: 0 15px 40px rgba(59, 130, 246, 0.5);
    border-color: #1D4ED8;
  }
  50% {
    box-shadow: 0 20px 50px rgba(59, 130, 246, 0.7);
    border-color: #3B82F6;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .header-section {
    padding: 30px 16px 24px 16px;
  }

  .game-title {
    font-size: 2.2em;
  }

  .welcome-message {
    font-size: 1.1em;
  }

  .content-section {
    padding: 20px 16px;
  }

  .section-title {
    font-size: 1.4em;
  }

  .mode-header {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .tutorial-btn {
    font-size: 0.85em;
    padding: 10px 16px;
  }

  .difficulty-buttons,
  .mode-buttons {
    grid-template-columns: 1fr;
    max-width: 100%;
    gap: 16px;
  }

  .difficulty-btn,
  .mode-btn {
    padding: 20px;
  }

  .mode-icon {
    font-size: 2.2em;
  }

  .difficulty-text,
  .mode-text {
    font-size: 1.1em;
  }

  .difficulty-range,
  .mode-description {
    font-size: 0.9em;
  }
}

/* 超小屏幕适配 */
@media (max-width: 480px) {
  .header-section {
    padding: 20px 12px 20px 12px;
  }

  .game-title {
    font-size: 1.8em;
  }

  .content-section {
    padding: 16px 12px;
  }

  .difficulty-btn,
  .mode-btn {
    padding: 16px;
  }

  .mode-icon {
    font-size: 2em;
  }
}

/* 横屏适配 */
@media (orientation: landscape) and (max-height: 500px) {
  .header-section {
    padding: 20px 16px 16px 16px;
  }

  .game-title {
    font-size: 2em;
    margin-bottom: 8px;
  }

  .content-section {
    padding: 16px;
  }

  .difficulty-buttons,
  .mode-buttons {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }

  .difficulty-btn,
  .mode-btn {
    padding: 16px;
  }
}
</style>
