console.log(chrome.commands.onCommand.addListener);

chrome.commands.onCommand.addListener((command) => {
  console.log(`Command "${command}" triggered-bg`)
  // 区域截图
  if (command === "areaScreenshot") areaScreenshot();
  // 打开扩展
  if (command === "open") openExtension();
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
