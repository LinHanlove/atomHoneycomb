import type { TYPE } from "~types"
import { Log } from "./func"




/**
 * @function 将类转换为单例类
 */
export const sington = (className) =>{
  let ins = null
  const proxy = new Proxy(className,{
    construct(target,args){
      if(!ins){
        ins = Reflect.construct(target,args)
      }
      return ins
    }
  })
  return proxy
}

/**
 * @function 通知信息
 * type 类型
 * origin 来源
 * data 数据
 */
export const sendMessage = (option:TYPE.ISendMessage) => {
  const {type, origin, data,chrome} = option 
  return new Promise((resolve,reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      Log("tabs", tabs);
      if (!tabs.length) return
      chrome.tabs
        .sendMessage(tabs[0].id, {
          type,
          origin,
          data,
        },(res) => {
          resolve(res)
        })
    })
  })
  
}


/**
 * @function 通知popup信息
 */
export const sendMessageToPopup = (option:TYPE.ISendMessage) => {
  const {type, origin, data,chrome} = option 
  return new Promise((resolve,reject) => {
    chrome.runtime.sendMessage({
      type,
      origin,
      data,
    },(res:any) => {
      resolve(res)
    })
  })
}