import axios from 'axios'
import { nullUser } from "../stores"

const core = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
})

async function loginAnon(): Promise<boolean> {
  const api = await core.get("/account/login", {});
  if (!api.data.token) {
    return false;
  }

  localStorage.setItem("NPToken", api.data.token);
  return true;
}

export async function validateToken(): Promise<boolean> {
  if (!localStorage.getItem("NPToken")) {
    return false;
  }

  let res: any;
  try {
    res = await core.get("/account/login/refresh", {
      headers: {
          "Authorization" : "Bearer " + localStorage.getItem("NPToken")
        }   
    });
  } catch (error) {
    return false;
  }
  
  localStorage.setItem("NPToken", res.data.token);
  return true;
}

export default async function CallAPI(method: string, url: string, body: any, option: any) {
  let res: any;
  
  if (!localStorage.getItem("NPToken")) {
    if (!await loginAnon()) {
      return Promise.reject("UNABLE TO REACH SERVER");
    } else {
      option.headers.Authorization = "Bearer " + localStorage.getItem("NPToken");
    }
  }

  try {
    if (method == "GET") {
      res = await core.get(url, option);
    } else if (method == "POST") {
      res = await core.post(url, body, option);
    } else if (method == "PUT") {
      res = await core.put(url, body, option);
    } else if (method == "DELETE") {
      res = await core.delete(url, option);
    } else {
      return null;
    }
  } catch (error: any) {
    if (error.response) {
      if ((error.response.data == "TOKEN EXPIRED") && (error.response.status == 400)) {
        if (!(await validateToken())) {
          nullUser();
          return Promise.reject("INVALID TOKEN");
        } else {
          option.headers.Authorization = "Bearer " + localStorage.getItem("NPToken");
          res = await CallAPI(method, url, body, option);
        }
      } else {
        return Promise.reject(error);
      }
    } else {
      return Promise.reject(error);
    }
  }

  return res;  
}