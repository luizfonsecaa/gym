import AsyncStorage from "@react-native-async-storage/async-storage";


import { userDTO } from "@dtos/UserDTO";
import { USER_STORAGE } from '@storage/storageConfig';
import { Use } from "react-native-svg";

export async function storageUserSave(user: userDTO) {
  await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user))
}

export async function storageUserGet() {
  const storage = await AsyncStorage.getItem(USER_STORAGE)
  const user: userDTO = storage ? JSON.parse(storage) : {}
  return user
}

export async function storageUserRemove() {
  await AsyncStorage.removeItem(USER_STORAGE)
}