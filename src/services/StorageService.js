/**
 * 数据持久化服务
 */
import { StorageUtils } from '../utils/index.js'
import { APP_CONFIG } from '../config/app.config.js'

export class StorageService {
  saveUserSettings(settings) {
    return StorageUtils.set(APP_CONFIG.storage.userSettings, {
      ...settings,
      lastUpdated: Date.now()
    })
  }

  getUserSettings() {
    return StorageUtils.get(APP_CONFIG.storage.userSettings, {
      soundEnabled: true,
      speechRate: APP_CONFIG.speech.rate,
      speechPitch: APP_CONFIG.speech.pitch,
      speechVolume: APP_CONFIG.speech.volume,
      difficulty: 1,
      preferredMode: 'choice',
      lastUpdated: Date.now()
    })
  }

  saveGameStats(stats) {
    return StorageUtils.set(APP_CONFIG.storage.stats, {
      ...stats,
      lastUpdated: Date.now()
    })
  }

  getGameStats() {
    return StorageUtils.get(APP_CONFIG.storage.stats, {
      totalQuestions: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      totalScore: 0,
      bestStreak: 0,
      sessionsPlayed: 0,
      lastUpdated: Date.now()
    })
  }

  updateGameStats(sessionStats) {
    const currentStats = this.getGameStats()
    
    const updatedStats = {
      totalQuestions: currentStats.totalQuestions + sessionStats.totalQuestions,
      correctAnswers: currentStats.correctAnswers + sessionStats.correctAnswers,
      wrongAnswers: currentStats.wrongAnswers + sessionStats.wrongAnswers,
      totalScore: currentStats.totalScore + sessionStats.totalScore,
      bestStreak: Math.max(currentStats.bestStreak, sessionStats.bestStreak),
      sessionsPlayed: currentStats.sessionsPlayed + 1,
      lastUpdated: Date.now()
    }

    return this.saveGameStats(updatedStats)
  }
}

export default new StorageService()
