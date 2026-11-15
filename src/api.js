import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach Bearer token and X-Admin-Token to all requests if present
client.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
      config.headers['X-Admin-Token'] = token
    }
  } catch {}
  return config
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
    try {
      const res = await client.get('/health')
      return res.data
    } catch {
      return { status: 'offline', database: 'unavailable' }
    }
  },

  async login(email, password) {
    try {
      const res = await client.post('/login', { email, password })
      const data = requireSuccess(res.data)
      if (data?.token) {
        localStorage.setItem('admin_token', data.token)
      }
      if (data?.user) {
        localStorage.setItem('admin_user', JSON.stringify(data.user))
      }
      return data
    } catch (err) {
      // Offline fallback login for local testing or disconnected server
      const cleanEmail = (email || '').toLowerCase().trim()
      if ((cleanEmail === 'admin@prothomalo.com' || cleanEmail === 'admin' || cleanEmail === 'admin@mknews.com') && password === 'admin123') {
        const mockUser = {
          id: 1,
          email: 'admin@prothomalo.com',
          name: 'Administrator',
          role: 'superadmin',
        }
        localStorage.setItem('admin_token', 'local_offline_token_' + Date.now())
        localStorage.setItem('admin_user', JSON.stringify(mockUser))
        return {
          success: true,
          message: 'Offline login successful',
          user: mockUser,
          token: 'local_offline_token',
        }
      }
      throw err
    }
  },

  async checkAuth() {
    try {
      const res = await client.get('/me')
      if (res.data?.authenticated) {
        if (res.data.user) {
          localStorage.setItem('admin_user', JSON.stringify(res.data.user))
        }
        return res.data.user
      }
    } catch {
      // Backend offline or unreachable: fall back to cached session
    }

    try {
      const cached = localStorage.getItem('admin_user')
      const token = localStorage.getItem('admin_token')
      if (cached && token) {
        return JSON.parse(cached)
      }
    } catch {}

    return null
  },

  async logout() {
    try {
      await client.post('/logout')
    } catch {}
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    return { success: true, message: 'Logged out successfully' }
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

  async getBreakingNews(all = false) {
    const res = await client.get(`/breaking-news${all ? '?all=1' : ''}`)
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

  async toggleBreakingNews(id) {
    const res = await client.post(`/breaking-news?action=toggle&id=${encodeURIComponent(id)}`)
    return requireSuccess(res.data)
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

  // --- Opinions CRUD ---
  async getOpinions() {
    try {
      const res = await client.get('/opinions')
      if (Array.isArray(res.data?.opinions)) {
        return res.data.opinions
      }
    } catch (err) {
      console.warn('Unable to load opinions from server, using local:', err)
    }
    return null
  },

  async saveOpinion(opinion) {
    const res = await client.post('/opinions', opinion)
    return requireSuccess(res.data)
  },

  async deleteOpinion(idOrSlug) {
    const param = typeof idOrSlug === 'number' ? `id=${idOrSlug}` : `slug=${encodeURIComponent(idOrSlug)}`
    const res = await client.delete(`/opinions?${param}`)
    return requireSuccess(res.data)
  },

  // --- Photos Gallery CRUD ---
  async getPhotos() {
    try {
      const res = await client.get('/photos')
      if (Array.isArray(res.data?.photos)) {
        return res.data.photos
      }
    } catch (err) {
      console.warn('Unable to load photos from server, using local:', err)
    }
    return null
  },

  async savePhoto(photo) {
    const res = await client.post('/photos', photo)
    return requireSuccess(res.data)
  },

  async deletePhoto(idOrSlug) {
    const param = typeof idOrSlug === 'number' ? `id=${idOrSlug}` : `slug=${encodeURIComponent(idOrSlug)}`
    const res = await client.delete(`/photos?${param}`)
    return requireSuccess(res.data)
  },

  // --- Videos CRUD ---
  async getVideos() {
    try {
      const res = await client.get('/videos')
      if (Array.isArray(res.data?.videos)) {
        return res.data.videos
      }
    } catch (err) {
      console.warn('Unable to load videos from server, using local:', err)
    }
    return null
  },

  async saveVideo(video) {
    const res = await client.post('/videos', video)
    return requireSuccess(res.data)
  },

  async deleteVideo(idOrSlug) {
    const param = typeof idOrSlug === 'number' ? `id=${idOrSlug}` : `slug=${encodeURIComponent(idOrSlug)}`
    const res = await client.delete(`/videos?${param}`)
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

  // --- Roles & Permissions CRUD ---
  async getRoles() {
    try {
      const res = await client.get('/roles')
      if (Array.isArray(res.data)) {
        return res.data
      }
    } catch (err) {
      console.warn('Unable to load roles from server, fallback to local:', err)
    }
    return null
  },

  async saveRole(role) {
    const isEdit = Boolean(role.id)
    const res = await client[isEdit ? 'put' : 'post']('/roles', role)
    return requireSuccess(res.data)
  },

  async deleteRole(idOrRoleKey) {
    const param = typeof idOrRoleKey === 'number' ? `id=${idOrRoleKey}` : `role_key=${encodeURIComponent(idOrRoleKey)}`
    const res = await client.delete(`/roles?${param}`)
    return requireSuccess(res.data)
  },

  // --- Staff & Team Members CRUD ---
  async getStaff() {
    try {
      const res = await client.get('/staff')
      if (Array.isArray(res.data)) {
        return res.data
      }
    } catch (err) {
      console.warn('Unable to load staff from server, fallback to local:', err)
    }
    return null
  },

  async saveStaff(staffMember) {
    const isEdit = Boolean(staffMember.id)
    const res = await client[isEdit ? 'put' : 'post']('/staff', staffMember)
    return requireSuccess(res.data)
  },

  async deleteStaff(id) {
    const res = await client.delete(`/staff?id=${encodeURIComponent(id)}`)
    return requireSuccess(res.data)
  },

  // --- Currency & Market Rates API ---
  async getCurrencyRates() {
    try {
      const res = await client.get('/currency')
      if (res.data?.success && Array.isArray(res.data?.rates)) {
        return res.data.rates
      }
    } catch (err) {
      // Backend offline or unreachable, will fall back to local market basket
    }
    return null
  },

  async saveCurrencyRates(rates) {
    const res = await client.post('/currency', { rates })
    return requireSuccess(res.data)
  },

  // --- Image Upload API ---
  async uploadImage(file) {
    if (!file) throw new Error('No file selected')

    // First try server upload via /api/upload
    try {
      const formData = new FormData()
      formData.append('image', file)

      const token = localStorage.getItem('admin_token')
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
        headers['X-Admin-Token'] = token
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers,
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success && data.url) {
          return data.url
        }
      }
    } catch (err) {
      console.warn('Server upload failed, converting to optimized Data URL:', err)
    }

    // Fallback to Data URL for instant offline / client preview
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = (err) => reject(err)
      reader.readAsDataURL(file)
    })
  },

  async getStats() {
    const res = await client.get('/stats')
    return res.data
  },
}
