import { Log, openExtension, openGitHubDev, openIntroduce, quickSearch, sendMessage } from "~utils";

// 右键菜单列表
const menuList = [
  {
    id: "open",
    title: "open",
    onclick: function (){
      return openExtension(chrome)
    }
  },
  {
    id: "search",
    title: "search",
    onclick: function (){
      return quickSearch(chrome)
    }
  },
  {
    id: "githubDev",
    title: "githubDev",
    onclick: function (){
      return openGitHubDev()
    }
  },
  {
    id: "refresh",
    title: "refresh",
    onclick: function(){
      return sendMessage({
        type: "refresh",
        origin: "background",
      })
    }
  },
  {
    id: "aboutHoneycomb",
    title: "about honeycomb",
    onclick: function () {
      return openIntroduce(chrome)
    }
  }
]

chrome.commands.onCommand.addListener((command) => {
  Log(`Command "${command}" triggered-bg`)
  // 区域截图
  if (command === "areaScreenshot") areaScreenshot();
  // 打开扩展
  if (command === "open") openExtension(chrome);
  // 打开githubDev
  if (command === "openGitHubDev") openGitHubDev();
  // 强制刷新
  if (command === "refresh") sendMessage({
    type: "refresh",
    origin: "background",
  });
  
})


/**
 * @function 创建右键菜单
 */
menuList.forEach(item => {
  chrome.contextMenus.create({
    id: item.id,
    title: item.title,
    contexts: ["all"],
  });
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const active = menuList.find(item => item.id === info.menuItemId)
  if(active) active.onclick()
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
          Log("截图失败:", chrome.runtime.lastError)
        } else {
          chrome.tabs
            .sendMessage(tabs[0].id, {
              base64: image,
              type: "areaScreenshot",
              origin: "background",
            })
            .catch((error) => {
              Log("content-script消息发送失败：", error)
            })
        }
      }
    )
  })
}

