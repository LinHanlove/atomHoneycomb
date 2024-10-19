import { log, sleep } from "atom-tools"

import type { TYPE } from "~types"

import { Log } from "./func"

export const icon = require("assets/icon.png")

/**
 * @function 将类转换为单例类
 */
export const sington = (className) => {
  let ins = null
  const proxy = new Proxy(className, {
    construct(target, args) {
      if (!ins) {
        ins = Reflect.construct(target, args)
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
export const sendMessage = (option: TYPE.ISendMessage) => {
  const { type, origin, data, chrome } = option
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      Log("tabs", tabs)
      if (!tabs.length) return
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          type,
          origin,
          data
        },
        (res) => {
          resolve(res)
        }
      )
    })
  })
}

/**
 * @function 通知{popup,background}信息
 */
export const sendMessageRuntime = (option: TYPE.ISendMessage) => {
  const { type, origin, data, chrome } = option
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type,
        origin,
        data
      },
      (res: any) => {
        resolve(res)
      }
    )
  })
}

/**
 * @function 通知信息
 * @param option {message,type,iconUrl}
 * @returns
 */
export const notify = (option: TYPE.IChromeMessage) => {
  const { message, type, iconUrl, chrome, timeout } = option
  console.log(option)

  return new Promise((resolve, reject) => {
    try {
      chrome.notifications.create(
        {
          type: type || "basic",
          title: "Atom Honeycomb",
          message: message || "Atom Honeycomb",
          iconUrl: iconUrl || icon
        },
        (notificationId) => {
          sleep(timeout || 3000).then(() => {
            chrome.notifications.clear(notificationId)
            resolve(notificationId)
          })
        }
      )
    } catch (error) {
      log.error(error)
      reject(error)
    }
  })
}

/**
 * @function 创建一个新的标签页
 */
export const createTab = (option: any) => {
  const { chrome, url } = option
  chrome.tabs.create({ url: `../tabs/${url}.html` })
}
