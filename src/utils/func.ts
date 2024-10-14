/**
 * @function 打开githubDev 线上查看github项目
 */
export const openGitHubDev = () => { 
  console.log('openGitHubDev');
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log(tabs);
    
    const url = tabs[0].url
    const reg = /^(https?:\/\/)?(www\.)?github\.com\/(.*)\/(.*)/
    console.log('github地址---->', url);
    
    if(!reg.test(url)) return

    // 在当前标签页后面打开新的标签页
    chrome.tabs.create({ url: url.replace('github.com', 'github.dev'),index: tabs[0].index + 1 })
  })
}

/**
 * @function 强制刷新
 */
export const windowRefresh = (window: Window) => {
  window.localStorage.clear()
  window.sessionStorage.clear()
  clearAllCookie()
  window.location.reload()
}

/**
 * 清除指定的 cookie 或所有 cookie。
 * @param name 可选。如果提供，将清除指定名称的 cookie。
 */
export const clearAllCookie = (name?: string) => {
  if (name) {
    // 清除指定名称的 cookie
    document.cookie = name + '=0; path=/; expires=' + new Date(0).toUTCString()
    document.cookie =
      name + '=0; path=/; domain=' + document.domain + '; expires=' + new Date(0).toUTCString()
  } else {
    // 清除所有 cookie
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim()
      const eqPos = cookie.indexOf('=')
      let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
      document.cookie = name + '=0; path=/; expires=' + new Date(0).toUTCString()
      document.cookie =
        name + '=0; path=/; domain=' + document.domain + '; expires=' + new Date(0).toUTCString()
    }
  }
}

/**
 * 将图片复制进用户粘贴板
 * @param image base64
 */
export const copyImgToClipboard = async (image) => {
  console.log('image');
  
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