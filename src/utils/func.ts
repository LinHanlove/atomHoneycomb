import { clearAllCookie, log } from "atom-tools";
import { sendMessage } from "./common";

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
 * @function 区域截图
 */
export const areaScreenshot = (chrome) =>{
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
  return new Promise((resolve, reject) => {
    chrome.action.openPopup().then(()=>{
      resolve(null)
    })
  })
}


/**
 * @function 快捷搜索
 */
export const quickSearch =  (chrome) => {
  sendMessage({ type: "getSelectedText", origin: "background",chrome }).then(async (query: any) => {
    if(!query) return
    const settingLocal = await getLocal({
      key: 'setting',
      chrome
    }) as any
    const searchTargetLocal = await getLocal({
      key: 'searchTarget',
      chrome
    }) as {
      searchTarget: string
    }
    console.log('settingList:', settingLocal.setting, 'searchTarget:', searchTargetLocal);

    if(!settingLocal.setting || !searchTargetLocal) return
    const querySetting = JSON.parse(settingLocal.setting)[parseInt(searchTargetLocal.searchTarget)]
    console.log('querySetting:', querySetting);
    
    chrome.tabs.create({
      url: `${querySetting.prefix}${query}${querySetting.suffix}`
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

/**
 * @function 存储数据
 */
export const setLocal = (option) => {
  const {chrome, key, value} = option
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, (res) => {
      resolve(res)
    })
  })
}


/**
 * @function 读取数据
 */
export const getLocal = (option) => {
  const {chrome, key} = option
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (res) => {
      resolve(res)
    })
  })
}

/**
 * @function 清空数据
 */
export const clearLocal = (option) => {
  const {chrome, key} = option
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(key, (res) => {
      resolve(res)
    })
  })
}