import { AppError } from '@utils/AppError'
import axios, { AxiosInstance } from 'axios'
import { storageAuthTokenGet, storageAuthTokenSave } from '@storage/storageAuthToken'


type RegisterInterceptTokenManagerProps = {
  singOut: () => void;
  refreshTokenUpdated: (newToken: string) => void
}

type APIInstanceProps = AxiosInstance & {
  registerInterceptTokenManager: ({ }: RegisterInterceptTokenManagerProps) => () => void
}

type PromiseType = {
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}

type processQueueParams = {
  error: Error | null;
  token: string | null
}

const api = axios.create({
  baseURL: 'http://192.168.15.27:3333/'
}) as APIInstanceProps


api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

let isRefreshing = false
let faildQueue: Array<PromiseType> = []

const processQueue = ({ error, token = null }: processQueueParams): void => {
  faildQueue.forEach(request => {
    if (error) {
      request.reject(error);
    } else {
      request.resolve(token)
    }
  });
  faildQueue = []
}


api.registerInterceptTokenManager = ({ singOut, refreshTokenUpdated }) => {
  const interceptTokenManager = api.interceptors.response.use(
    (response) => {
      return response
    },
    async (requestError) => {
      if (requestError?.response?.status === 401) {
        if (requestError.response.data?.message === 'token.expired' || requestError.response.data?.message === 'token.invalid') {
          const oldToken = await storageAuthTokenGet()

          if (!oldToken) {
            singOut()
            return Promise.reject(requestError)
          }

          const originalRequest = requestError.config;

          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              faildQueue.push({ resolve, reject })
            })
              .then(token => {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                return axios(originalRequest)
              })
              .catch((error => {
                throw error
              }))
          }

          isRefreshing = true

          return new Promise(async (resolve, reject) => {
            try {
              const { data } = await api.post('sessions/refresh-token', { token: oldToken })
              await storageAuthTokenSave(data.token)
              api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
              originalRequest.headers['Authorization'] = `Bearer ${data.token}`

              refreshTokenUpdated(data.token)
              processQueue({ error: null, token: data.token })
              // resolve(originalRequest)
              resolve(axios(originalRequest))
            } catch (error: any) {
              processQueue({ error: null, token: '' })
              singOut()
              reject(error)
            } finally {
              isRefreshing = false
            }
          })
        }
        singOut()
      }
      if (requestError.response && requestError.response.data) {
        return Promise.reject(new AppError(requestError.response.data.message))
      } else {
        return Promise.reject(requestError)
      }
    }
  )

  return () => {
    api.interceptors.response.eject(interceptTokenManager)
  }
}


export { api }