import { get, writable } from 'svelte/store';

var userDataInterface: {
  "countCompleted": Number,
  "countFavorites": Number,
  "countMyPuzzles": Number,
  "countUncompleted": Number,
  "username": String,
  "anonymous": boolean
} = {
  "countCompleted": 0,
  "countFavorites": 0,
  "countMyPuzzles": 0,
  "countUncompleted": 0,
  "username": "",
  "anonymous": true
}

export function nullUser(): void {
  user.set({
    countCompleted: 0,
    countFavorites: 0,
    countMyPuzzles: 0,
    countUncompleted: 0,
    username: "",
    anonymous: true,
    token: ""
  })
  localStorage.removeItem("NPToken");
  localStorage.removeItem("NPUserData");
}

export const user = writable({ token: "", ...userDataInterface });
export const offlineMode = writable(false);