/**
 * 应用程序配置
 */

export const APP_CONFIG = {
  // 应用信息
  name: '数字认读小游戏',
  version: '2.0.0',

  // 游戏设置
  game: {
    maxQuestions: 10,
    feedbackDisplayTime: 2000,
    autoNextDelay: 1500,
  },

  // 语音设置
  speech: {
    rate: 0.4,
    pitch: 1.0,
    volume: 1.0,
    lang: 'zh-CN',
  },

  // 本地存储键名
  storage: {
    userSettings: 'number_game_settings',
    stats: 'number_game_stats',
  },
}

// 难度配置
export const DIFFICULTY_SETTINGS = [
  { id: 1, name: '萌新上路', range: [0, 10], options: 3 },
  { id: 2, name: '初出茅庐', range: [0, 20], options: 4 },
  { id: 3, name: '渐入佳境', range: [0, 50], options: 5 },
  { id: 4, name: '炉火纯青', range: [0, 100], options: 6 },
  { id: 5, name: '登峰造极', range: [0, 200], options: 8 },
  { id: 6, name: '数学大师', range: [0, 1000], options: 10 }
]

// 游戏模式
export const GAME_MODES = {
  CHOICE: 'choice',
  SPEAK: 'speak',
}

// 屏幕类型
export const SCREENS = {
  START: 'start',
  GAME: 'game',
}

export default APP_CONFIG
