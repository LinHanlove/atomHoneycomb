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
 * @function 通知内容脚本
 * type 类型
 * origin 来源
 * data 数据
 */
export const sendContentMessage = (type: string, origin: string, data?: any) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    Log("tabs", tabs);
    
    if (!tabs[0].windowId) return
    chrome.tabs
      .sendMessage(tabs[0].id, {
        type,
        origin,
        data,
      })
      .catch((error) => {
        Log("content-script消息发送失败：", error)
        })
  })
}