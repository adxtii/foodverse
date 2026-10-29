// One function per backend feature. Pages call these, never fetch directly.
import { postForm, postJson } from './client.js'

function formWith(files, fields) {
  const form = new FormData()
  files.forEach((file) => form.append('files', file))
  Object.entries(fields).forEach(([key, value]) => form.append(key, value))
  return form
}

export const recognizeFood = (files, note) => postForm('/recognize', formWith(files, { note }))
export const analyzeNutrition = (files, description) => postForm('/nutrition', formWith(files, { description }))
export const checkFreshness = (files, note) => postForm('/freshness', formWith(files, { note }))
export const checkHygiene = (files, note) => postForm('/hygiene', formWith(files, { note }))

export const getCookingGuide = (body) => postJson('/cook', body)
export const buildMealPlan = (body) => postJson('/mealplan', body)

export const getStats = (history) => postJson('/insights/stats', { history })
export const getReport = (history) => postJson('/insights/report', { history })
