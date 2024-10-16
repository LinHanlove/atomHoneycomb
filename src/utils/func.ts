import { clearAllCookie, log } from "atom-tools";
import { window } from '../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/window';
import { sendMessage, sendMessageToPopup } from "./common";

/**
 * @function 打开githubDev 线上查看github项目
 */
export const openGitHubDev = () => { 
  Log('openGitHubDev');
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    Log(tabs);
    
    const url = tabs[0].url
    const reg = /^(https?:\/\/)?(www\.)?github\.com\/(.*)\/(.*)/
    Log('github地址---->', url);
    
    if(!reg.test(url)) return

    // 在当前标签页后面打开新的标签页
    chrome.tabs.create({ url: url.replace('github.com', 'github.dev'),index: tabs[0].index + 1 })
  })
}

/**
 * @function 强制刷新
 */
export const windowRefresh = (window: Window,chrome: any) => {
  Log('windowRefresh',window,chrome);
  
  window.localStorage.clear()
  window.sessionStorage.clear()
  clearAllCookie()
  window.location.reload()
}

/**
 * 将图片复制进用户粘贴板
 * @param image base64
 */
export const copyImgToClipboard = async (image) => {
  Log('image');
  
  const storage_data = await chrome.storage.sync.get(["model"])
  const model = storage_data.model || "file"
  // 复制都用户粘贴板中
  if (model === "base64") {
    navigator.clipboard.writeText(image)
  } else if (model === "file") {
    const [header, base64] = image.split(",")
    const [_, type] = /data:(.*);base64/.exec(header)
    const binary = atob(base64)
    const array = Array.from({ length: binary.length }).map((_, index) =>
      binary.charCodeAt(index)
    )
    navigator.clipboard.write([
      new ClipboardItem({
        // 这里只能写入 png
        "image/png": new Blob([new Uint8Array(array)], { type: "image/png" })
      })
    ])
  }
}

/**
 * @function 截图时禁止浏览器的一些事件
 */
export const disableBrowserEvent = () => {
  document.body.style.overflow = "hidden"
}

/**
 * @function 启用浏览器的一些事件
 */
export const enableBrowserEvent = () => {
  // 启用滚动
  document.body.style.overflow = ""
}

/**
 * @function 打印日志
 * @param msg 日志信息
 * @param other 
 */
export const Log = (msg: any,...other) => {
  log.success(msg,...other)
}


/**
 * @function 跳转到介绍
 */
export const openIntroduce = (chrome) => {
  chrome.tabs.create({
    url: "https://linhan.atomnotion.com/posts/about-honeycomb"
  })
}


/**
 * @function 打开扩展
 */
export const openExtension = (chrome) => {
  chrome.action.openPopup()
}


/**
 * @function 快捷搜索
 */
export const quickSearch = (chrome) => {
  sendMessage({ type: "getSelectedText", origin: "background",chrome }).then((query: any) => {
    if(!query) return
    sendMessageToPopup({
      type: "quickSearch",
      origin: "background",
      chrome
    }).then((res: any)=>{
      console.log('res:', res);
      
      const settingList = JSON.parse(res.setting)
      const searchTargetList = parseInt(res.searchTarget)
      const querySetting = settingList[searchTargetList]
      console.log('settingList:', querySetting);
      openExtension(chrome)
      chrome.tabs.create({
        url: `${querySetting.prefix}${query}${querySetting.suffix}`
      })
    })
  })
}


/**
 * @function 获取页面选择的文字
 */
export const getSelectedText = (window) => {
  if(window.document.selection){
    return  window.document.selection.createRange().text;
  }else{
    return  window.getSelection().toString();
  }
}