import type { PlasmoCSConfig } from "plasmo"
import "cropperjs/dist/cropper.css"
import { windowRefresh} from "~utils"
import areaScreenshot from "~utils/areaScreenshot"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

/**
 * @function 监听来自popup的消息
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("收到的消息：", message,areaScreenshot);
  const {origin, type } = message
  
  if (type === "areaScreenshot") {
    window.focus()
    areaScreenshot(message.base64).init()
    return true // 表示消息已被处理，不需要再分发
  }
  // 强制刷新
  if(origin === "background" && type === "refresh") windowRefresh(window)
})

