import { create } from 'zustand'
import api from '../services/api'

const useAuthStore = create((set) => ({
  user:  JSON.parse(localStorage.getItem('ua_user') || 'null'),
  token: localStorage.getItem('ua_token') || null,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('ua_token', data.token)
    localStorage.setItem('ua_user',  JSON.stringify(data.user))
    set({ token: data.token, user: data.user })
  },

  logout: () => {
    localStorage.removeItem('ua_token')
    localStorage.removeItem('ua_user')
    set({ token: null, user: null })
  },
}))

export default useAuthStore
