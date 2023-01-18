import { userDTO } from "@dtos/UserDTO";
import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "@services/api";


import { storageUserSave, storageUserGet, storageUserRemove } from "@storage/storageUser";
import { storageAuthTokenRemove, storageAuthTokenGet, storageAuthTokenSave } from "@storage/storageAuthToken";

export type AuthContextDataPorps = {
  user: userDTO
  signIn: (email: string, password: string) => Promise<void>
  isLoadingUserStorageData: boolean,
  signOut: () => Promise<void>
}

type AuthContenxtProviderProps = {
  children: ReactNode
}

export const AuthContext = createContext<AuthContextDataPorps>({} as AuthContextDataPorps);

export function AuthContextProvider({ children }: AuthContenxtProviderProps) {

  const [user, setUser] = useState({} as userDTO)
  const [isLoadingUserStorageData, setIsLoadingUserStorageData] = useState(true)

  function UserAndTokenUpdate(userData: userDTO, token: string) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
  }

  async function storageUserAndTokenSave(userData: userDTO, token: string) {
    try {
      setIsLoadingUserStorageData(true)
      await storageUserSave(userData);
      await storageAuthTokenSave(token)
    } catch (error) {
      throw error
    } finally {
      setIsLoadingUserStorageData(false)
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { data } = await api.post('sessions', { email, password })
      if (data.user && data.token) {
        await storageUserAndTokenSave(data.user, data.token)
        UserAndTokenUpdate(data.user, data.token)
      }
    } catch (error) {
      throw error
    }
  }

  async function signOut() {
    try {
      setIsLoadingUserStorageData(true)
      setUser({} as userDTO)
      await storageUserRemove()
      await storageAuthTokenRemove()
    } catch (error) {
      throw error
    }
    finally {
      setIsLoadingUserStorageData(false)
    }
  }

  async function loadUserData() {
    try {
      setIsLoadingUserStorageData(true)
      const userLogged = await storageUserGet();
      const token = await storageAuthTokenGet();
      console.log(token)

      if (token && userLogged) {
        UserAndTokenUpdate(userLogged, token)
      }
    } catch (error) {
      console.log('erro no loadUserData', error)
    } finally {
      setIsLoadingUserStorageData(false)
    }
  }

  useEffect(() => {
    loadUserData()
  }, [])

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isLoadingUserStorageData, }}>
      {children}
    </AuthContext.Provider>
  )
}