import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

client.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(new Error(
    error.response?.data?.message || error.message || 'The server could not be reached.'
  ))
)

function requireSuccess(data) {
  if (!data || data.success === false) {
    throw new Error(data?.message || 'The server could not complete the request.')
  }
  return data
}

export const api = {
  async getHealth() {
    const res = await client.get('/health')
    return res.data
  },

  async login(email, password) {
    const res = await client.post('/login', { email, password })
    return requireSuccess(res.data)
  },

  async checkAuth() {
    const res = await client.get('/me')
    return res.data?.authenticated ? res.data.user : null
  },

  async logout() {
    const res = await client.post('/logout')
    return requireSuccess(res.data)
  },

  async getArticles() {
    const res = await client.get('/articles')
    if (!Array.isArray(res.data?.articles)) {
      throw new Error('The server returned an invalid articles response.')
    }
    return res.data.articles
  },

  async saveArticle(article, isEdit = false) {
    const res = await client[isEdit ? 'put' : 'post']('/articles', article)
    const data = requireSuccess(res.data)
    if (!isEdit && (!Number.isInteger(Number(data.id)) || Number(data.id) < 1)) {
      throw new Error('The server did not return the saved article ID.')
    }
    return data
  },

  async deleteArticle(id) {
    const res = await client.delete(`/articles?id=${encodeURIComponent(id)}`)
    return requireSuccess(res.data)
  },

  async recordArticleView(id) {
    try {
      await client.post(`/articles?action=view&id=${encodeURIComponent(id)}`)
    } catch {
      // view tracking is non-blocking
    }
  },

  async getBreakingNews() {
    const res = await client.get('/breaking-news')
    if (!Array.isArray(res.data?.breakingNews)) {
      throw new Error('The server returned an invalid breaking-news response.')
    }
    return res.data.breakingNews
  },

  async saveBreakingNews(item) {
    const res = await client.post('/breaking-news', item)
    const data = requireSuccess(res.data)
    if (!data.item || !Number.isInteger(Number(data.item.id)) || Number(data.item.id) < 1) {
      throw new Error('The server did not return the saved breaking-news item.')
    }
    return data
  },

  async deleteBreakingNews(id) {
    const res = await client.delete(`/breaking-news?id=${encodeURIComponent(id)}`)
    return requireSuccess(res.data)
  },

  // --- Categories CRUD ---
  async getCategories() {
    try {
      const res = await client.get('/categories')
      if (Array.isArray(res.data?.categories)) {
        return res.data.categories
      }
    } catch {}
    return null
  },

  async saveCategory(category) {
    const res = await client.post('/categories', category)
    return requireSuccess(res.data)
  },

  async deleteCategory(idOrSlug) {
    const param = typeof idOrSlug === 'number' ? `id=${idOrSlug}` : `slug=${encodeURIComponent(idOrSlug)}`
    const res = await client.delete(`/categories?${param}`)
    return requireSuccess(res.data)
  },

  // --- Website Settings CRUD ---
  async getSettings() {
    try {
      const res = await client.get('/settings')
      if (res.data?.settings && typeof res.data.settings === 'object') {
        return res.data.settings
      }
    } catch (err) {
      console.warn('Unable to load settings from server, fallback to local:', err)
    }
    return null
  },

  async saveSettings(settings) {
    const res = await client.post('/settings', settings)
    return requireSuccess(res.data)
  },

  async getStats() {
    const res = await client.get('/stats')
    return res.data
  },
}
