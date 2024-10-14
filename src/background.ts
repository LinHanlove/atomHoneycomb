import { openGitHubDev } from "~utils";

console.log(chrome.commands.onCommand.addListener);

chrome.commands.onCommand.addListener((command) => {
  console.log(`Command "${command}" triggered-bg`)
  // 区域截图
  if (command === "areaScreenshot") areaScreenshot();
  // 打开扩展
  if (command === "open") openExtension();
  // 打开githubDev
  if (command === "openGitHubDev") openGitHubDev();
  // 强制刷新
  if (command === "refresh") sendContentMessage("refresh", "background");
  
})

/**
 * @function 区域截图
 */
const areaScreenshot = () =>{
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0].windowId) return
    chrome.tabs.captureVisibleTab(
      tabs[0].windowId,
      { format: "png", quality: 100 },
      (image) => {
        if (chrome.runtime.lastError) {
          console.log("截图失败:", chrome.runtime.lastError)
        } else {
          chrome.tabs
            .sendMessage(tabs[0].id, {
              base64: image,
              type: "areaScreenshot",
              origin: "background",
            })
            .catch((error) => {
              console.log("content-script消息发送失败：", error)
            })
        }
      }
    )
  })
}

/**
 * @function 打开扩展
 */
const openExtension = () => {
  chrome.action.openPopup()
}


/**
 * @function 通知内容脚本
 * type 类型
 * origin 来源
 * data 数据
 */
const sendContentMessage = (type: string, origin: string, data?: any) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log("tabs", tabs);
    
    if (!tabs[0].windowId) return
    chrome.tabs
      .sendMessage(tabs[0].id, {
        type,
        origin,
        data,
      })
      .catch((error) => {
        console.log("content-script消息发送失败：", error)
        })
  })
}