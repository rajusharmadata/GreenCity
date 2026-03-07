import instance from './axios'

interface LoginResult {
  token: string
  // You can replace `any` with a proper user type later
  // once the shape is finalized across the app.
  user: any
}

export const login = async (
  email: string,
  password: string,
): Promise<LoginResult> => {
  try {
    const response = await instance.post('/auth/login', { email, password })
    const { token, user } = response.data

    if (token) {
      // Persist auth for future requests on the client
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('greencity_token', token)
        window.localStorage.setItem(
          'greencity_user',
          JSON.stringify(user ?? {}),
        )
      }
      instance.defaults.headers.common.Authorization = `Bearer ${token}`
    }

    return { token, user }
  } catch (error: any) {
    const message =
      error?.response?.data?.error ||
      error?.message ||
      'Failed to login. Please try again.'

    const normalizedError: any = new Error(message)
    normalizedError.response = error?.response
    throw normalizedError
  }
}

export const register = async (
  name: string,
  email: string,
  password: string,
) => {
  // Implementation for registration would go here
  console.log('Attempting registration with name:', name, 'email:', email)
}
