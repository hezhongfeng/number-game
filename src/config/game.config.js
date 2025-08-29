// 游戏配置文件
export const GAME_CONFIG = {
  // 游戏类型
  GAME_TYPES: {
    MEMORY: 'memory',
    MATH: 'math',
    PUZZLE: 'puzzle',
    GUESS: 'guess'
  },

  // 难度等级
  DIFFICULTY: {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
  },

  // 游戏设置
  SETTINGS: {
    DEFAULT_LIVES: 3,
    DEFAULT_TIME_LIMIT: 60, // 秒
    SCORE_MULTIPLIER: {
      easy: 1,
      medium: 2,
      hard: 3
    }
  },

  // 本地存储键名
  STORAGE_KEYS: {
    HIGH_SCORE: 'number_game_high_score',
    USER_SETTINGS: 'number_game_settings',
    GAME_PROGRESS: 'number_game_progress'
  }
}
