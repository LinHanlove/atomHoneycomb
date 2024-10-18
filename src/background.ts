import { menuList } from "~common"
import {
  areaScreenshot,
  Log,
  notify,
  openExtension,
  openGitHubDev,
  openIntroduce,
  quickSearch,
  sendMessage
} from "~utils"

/**
 * @function 监听快捷键命令
 */
chrome.commands.onCommand.addListener((command) => {
  Log(`Command "${command}" triggered-bg`)
  // 区域截图
  if (command === "areaScreenshot") areaScreenshot(chrome)
  // 打开扩展
  if (command === "open") openExtension(chrome)
  // 打开githubDev
  if (command === "openGitHubDev") openGitHubDev()
  // 强制刷新
  if (command === "refresh")
    sendMessage({
      type: "refresh",
      origin: "background",
      chrome
    })
})

/**
 * @function 监听消息
 */
/**
 * @function 监听来自popup的消息
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  Log("background收到的消息：", message, sender, sendResponse)
  const { origin, type, data } = message
})

/**
 * @function 创建右键菜单
 */
menuList.forEach((item) => {
  chrome.contextMenus.create({
    id: item.id,
    title: item.title,
    contexts: ["all"]
  })
})

/**
 * @function 右键菜单点击事件
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const active = menuList.find((item) => item.id === info.menuItemId)
  if (active) active.onclick()
})
