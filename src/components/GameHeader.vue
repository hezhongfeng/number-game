<template>
  <div class="game-header-modern">
    <!-- 移动端顶部状态栏 -->
    <div class="header-top">
      <button @click="handleBack" class="back-btn-mobile">
        <span class="back-icon">←</span>
      </button>
      
      <div class="header-title">
        <span class="difficulty-badge" :class="`difficulty-${difficultyName.toLowerCase()}`">
          {{ difficultyName }}
        </span>
      </div>
      
      <button @click="toggleStats" class="stats-btn-mobile" :class="{ active: showStats }">
        <span class="stats-icon">📊</span>
      </button>
    </div>

    <!-- 游戏状态卡片 -->
    <div class="status-cards">
      <div class="status-card score-card">
        <div class="card-icon">🏆</div>
        <div class="card-content">
          <div class="card-label">得分</div>
          <div class="card-value" :class="{ 'score-increasing': scoreIncreasing }">
            {{ score }}
          </div>
        </div>
      </div>

      <div class="status-card combo-card" v-if="combo > 0">
        <div class="card-icon">{{ comboIcon }}</div>
        <div class="card-content">
          <div class="card-label">连击</div>
          <div class="card-value" :class="`combo-${comboLevel}`">
            {{ combo }}
          </div>
        </div>
      </div>

      <div class="status-card progress-card" v-if="totalQuestions > 0">
        <div class="card-icon">📈</div>
        <div class="card-content">
          <div class="card-label">进度</div>
          <div class="card-value">
            {{ correctAnswers }}/{{ totalQuestions }}
          </div>
        </div>
      </div>
    </div>

    <!-- 详细统计面板（可折叠） -->
    <div class="stats-panel" v-if="showStats">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <div class="stat-label">准确率</div>
            <div class="stat-value" :class="`accuracy-${accuracyLevel}`">
              {{ accuracy }}%
            </div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">⚡</div>
          <div class="stat-content">
            <div class="stat-label">平均用时</div>
            <div class="stat-value">{{ formattedResponseTime }}</div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <div class="stat-label">最佳连击</div>
            <div class="stat-value">{{ bestStreak }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAudio } from '../composables/useAudio.js'

// 简单验证函数
const isNonNegativeInteger = (value) => Number.isInteger(value) && value >= 0
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0
const isPercentage = (value) => typeof value === 'number' && value >= 0 && value <= 100

// Props 定义
const props = defineProps({
  score: {
    type: Number,
    required: true,
  },
  combo: {
    type: Number,
    required: true
  },
  difficultyName: {
    type: String,
    required: true,
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  avgResponseTime: {
    type: Number,
    default: 0
  },
  bestStreak: {
    type: Number,
    default: 0
  }
})

// Events 定义
const emit = defineEmits({
  back: null
})

// 使用音频功能
const audio = useAudio()

// 响应式状态
const scoreIncreasing = ref(false)
const previousScore = ref(props.score)
const showStats = ref(false)

// 计算属性
const accuracy = computed(() => {
  if (props.totalQuestions === 0) return 0
  const result = Math.round((props.correctAnswers / props.totalQuestions) * 100)
  return isPercentage(result) ? result : 0
})

const formattedResponseTime = computed(() => {
  if (props.avgResponseTime <= 0) return '0s'
  return Math.round(props.avgResponseTime / 1000) + 's'
})

const comboLevel = computed(() => {
  if (props.combo === 0) return 'none'
  if (props.combo < 3) return 'low'
  if (props.combo < 5) return 'medium'
  if (props.combo < 10) return 'high'
  return 'extreme'
})

const comboIcon = computed(() => {
  switch (comboLevel.value) {
    case 'none': return '🔥'
    case 'low': return '🔥'
    case 'medium': return '🔥🔥'
    case 'high': return '🔥🔥🔥'
    case 'extreme': return '🎆'
    default: return '🔥'
  }
})

const accuracyLevel = computed(() => {
  const acc = accuracy.value
  if (acc >= 95) return 'excellent'
  if (acc >= 85) return 'good'
  if (acc >= 70) return 'average'
  return 'poor'
})

// 监听器
watch(() => props.score, (newScore, oldScore) => {
  if (newScore > oldScore) {
    scoreIncreasing.value = true

    // 播放得分声音
    audio.playSound('success').catch(() => {})

    setTimeout(() => {
      scoreIncreasing.value = false
    }, 1000)
  }
  previousScore.value = newScore
}, { immediate: true })

watch(() => props.combo, (newCombo) => {
  // 连击数达到特定值时播放特效
  if (newCombo > 0 && newCombo % 5 === 0) {
    audio.playSound('combo').catch(() => {})
  }
})

// 事件处理
const handleBack = async () => {
  try {
    // 移除点击音效
  } catch (error) {
    console.warn('Failed to play sound:', error)
  }

  emit('back')
}

const toggleStats = () => {
  showStats.value = !showStats.value
}

const playHoverSound = async () => {
  try {
    // 移除悬停音效
  } catch (error) {
    // 静默失败
  }
}
</script>

<style scoped>
.game-header-modern {
  margin-bottom: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0 0 24px 24px;
  color: white;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  overflow: hidden;
}

/* 顶部状态栏 */
.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.back-btn-mobile {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.back-btn-mobile:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.back-btn-mobile:active {
  transform: scale(0.95);
}

.back-icon {
  font-size: 1.5em;
  font-weight: bold;
}

.header-title {
  flex: 1;
  display: flex;
  justify-content: center;
}

.difficulty-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: 600;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.difficulty-简单 {
  background: rgba(34, 197, 94, 0.3);
  border-color: rgba(34, 197, 94, 0.5);
}

.difficulty-中等 {
  background: rgba(245, 158, 11, 0.3);
  border-color: rgba(245, 158, 11, 0.5);
}

.difficulty-困难 {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
}

.stats-btn-mobile {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.stats-btn-mobile:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.stats-btn-mobile.active {
  background: rgba(16, 185, 129, 0.8);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
}

.stats-icon {
  font-size: 1.2em;
}

/* 状态卡片 */
.status-cards {
  display: flex;
  gap: 8px;
  padding: 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.status-card {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 12px;
  min-width: 100px;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.status-card:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.card-icon {
  font-size: 1.5em;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-label {
  font-size: 0.75em;
  opacity: 0.8;
  margin-bottom: 2px;
  font-weight: 500;
}

.card-value {
  font-size: 1.1em;
  font-weight: 700;
  transition: all 0.3s ease;
}

.score-increasing {
  animation: scoreGlow 0.8s ease-out;
  color: #FFD700 !important;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
}

/* 连击效果 */
.combo-low {
  color: #FCD34D;
}

.combo-medium {
  color: #FB923C;
  animation: comboPulse 0.5s ease-in-out;
}

.combo-high {
  color: #A78BFA;
  animation: comboPulse 0.5s ease-in-out;
}

.combo-extreme {
  color: #F472B6;
  animation: comboExtreme 1s ease-in-out infinite;
  text-shadow: 0 0 10px currentColor;
}

/* 统计面板 */
.stats-panel {
  background: rgba(255, 255, 255, 0.1);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px;
  animation: slideDown 0.3s ease-out;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(5px);
}

.stat-icon {
  font-size: 1.3em;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 0.7em;
  opacity: 0.8;
  margin-bottom: 2px;
  font-weight: 500;
}

.stat-value {
  font-size: 1em;
  font-weight: 700;
}

/* 准确率颜色 */
.accuracy-excellent {
  color: #34D399;
}

.accuracy-good {
  color: #60A5FA;
}

.accuracy-average {
  color: #FBBF24;
}

.accuracy-poor {
  color: #F87171;
}

/* 现代化动画效果 */
@keyframes scoreGlow {
  0% {
    transform: scale(1);
    text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
  }
  50% {
    transform: scale(1.15);
    text-shadow: 0 0 20px rgba(255, 215, 0, 1);
  }
  100% {
    transform: scale(1);
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
  }
}

@keyframes comboPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes comboExtreme {
  0%, 100% {
    transform: scale(1) rotate(0deg);
    text-shadow: 0 0 10px currentColor;
  }
  25% {
    transform: scale(1.1) rotate(2deg);
    text-shadow: 0 0 15px currentColor;
  }
  75% {
    transform: scale(1.1) rotate(-2deg);
    text-shadow: 0 0 15px currentColor;
  }
}

@keyframes slideDown {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .game-header-modern {
    margin-bottom: 12px;
    border-radius: 0 0 20px 20px;
  }

  .header-top {
    padding: 10px 12px;
  }

  .back-btn-mobile,
  .stats-btn-mobile {
    width: 36px;
    height: 36px;
  }

  .back-icon {
    font-size: 1.3em;
  }

  .stats-icon {
    font-size: 1.1em;
  }

  .difficulty-badge {
    padding: 4px 12px;
    font-size: 0.8em;
  }

  .status-cards {
    padding: 12px;
    gap: 6px;
  }

  .status-card {
    padding: 10px;
    min-width: 80px;
  }

  .card-icon {
    font-size: 1.3em;
  }

  .card-label {
    font-size: 0.7em;
  }

  .card-value {
    font-size: 1em;
  }

  .stats-panel {
    padding: 12px;
  }

  .stats-grid {
    gap: 8px;
  }

  .stat-item {
    padding: 10px;
  }

  .stat-icon {
    font-size: 1.2em;
  }

  .stat-label {
    font-size: 0.65em;
  }

  .stat-value {
    font-size: 0.9em;
  }
}

/* 超小屏幕优化 */
@media (max-width: 480px) {
  .status-cards {
    padding: 8px;
    gap: 4px;
  }

  .status-card {
    padding: 8px;
    min-width: 70px;
    flex-direction: column;
    text-align: center;
    gap: 4px;
  }

  .card-icon {
    font-size: 1.2em;
  }

  .card-label {
    font-size: 0.65em;
  }

  .card-value {
    font-size: 0.9em;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .stat-item {
    padding: 8px;
  }
}

/* 横屏适配 */
@media (orientation: landscape) and (max-height: 500px) {
  .game-header-modern {
    margin-bottom: 8px;
  }

  .header-top {
    padding: 8px 12px;
  }

  .status-cards {
    padding: 8px 12px;
  }

  .status-card {
    padding: 8px;
  }

  .stats-panel {
    padding: 8px 12px;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 触摸优化 */
@media (hover: none) and (pointer: coarse) {
  .back-btn-mobile:hover,
  .stats-btn-mobile:hover,
  .status-card:hover {
    transform: none;
    background: rgba(255, 255, 255, 0.2);
  }

  .back-btn-mobile:active,
  .stats-btn-mobile:active {
    transform: scale(0.95);
  }

  .status-card:active {
    transform: scale(0.98);
  }
}
</style>