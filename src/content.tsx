import { Icon } from "@iconify/react"
import Cropper from "cropperjs"
import type { PlasmoCSConfig } from "plasmo"
import ReactDOM from "react-dom/client"

import "cropperjs/dist/cropper.css"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

/**
 * @function 监听来自popup的消息
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "areaScreenshot") {
    window.close()
    window.focus()
    areaScreenshot(message.base64)

    return true // 表示消息已被处理，不需要再分发
  }
})

const areaScreenshot = (base64) => {
  // 查找已经存在的截图容器
  const existingContainer = document.querySelector(".image-container")
  if (existingContainer) {
    // 如果存在，先移除
    existingContainer.remove()
  }

  // 截图的内容
  const cropContext = {
    x: 0,
    y: 0,
    w: 0,
    h: 0
  }

  let cropImage = {}

  // 创建截图容器
  const imageContainer = document.createElement("div")
  imageContainer.className = "image-container"
  imageContainer.style.position = "fixed"
  imageContainer.style.top = "0"
  imageContainer.style.left = "0"
  imageContainer.style.width = "100%"
  imageContainer.style.height = "100%"
  imageContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
  imageContainer.style.zIndex = "9999"

  document.body.appendChild(imageContainer)
  // 创建截图图片
  const imageDom = document.createElement("img")
  imageDom.src = base64
  imageContainer.appendChild(imageDom)
  // 裁切框
  let cropBox = null

  // 初始化裁剪器
  const cropper = new Cropper(imageDom, {
    autoCrop: false, // 关闭自动裁剪
    autoCropArea: 0.8,
    zoomOnTouch: false,
    zoomOnWheel: false,
    movable: true, // 允许移动图片
    rotatable: false,
    zoomable: true, // 允许缩放图片
    crop: (event) => onCrop(event),
    cropend: () => onCropend(),
    ready: (event) => onReady(event)
  })

  /**
   * @function 监听裁剪
   */
  const onCrop = (event) => {
    const { x, y, width, height } = event.detail
    console.log("监听裁剪--->", x, y, width, height)
    cropContext.x = x
    cropContext.y = y
    cropContext.w = width
    cropContext.h = height
  }

  /**
   * @function 监听裁剪结束
   */
  const onCropend = async () => {
    cropImage = await crop(base64, cropContext)
    console.log("裁剪结束--->", cropImage)

    // 添加操作按钮组
    cropBox.append(
      createButton({
        cropper,
        cropImage,
        imageContainer
      })
    )
  }

  /**
   * @function 裁剪框加载完成
   */
  const onReady = (event) => {
    // 裁切框
    cropBox = (cropper as any).cropBox as HTMLElement
    cropBox.style.position = "relative"
    disableBrowserEvent()
  }
}

/**
 * 图片裁剪
 * @param image base64
 * @param opts {x,y,w,h}
 */
const crop = (image, opts) => {
  return new Promise((resolve, reject) => {
    const x = opts.x
    const y = opts.y
    const w = opts.w
    const h = opts.h
    const format = opts.format || "png"
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = w
      canvas.height = h
      canvas.style.position = "relative"
      const context = canvas.getContext("2d")
      context.drawImage(img, x, y, w, h, 0, 0, w, h)
      const cropped = canvas.toDataURL(`image/${format}`)
      document.body.append(canvas)
      canvas.remove()
      resolve(cropped)
    }

    img.src = image
  })
}

/**
 * 将图片复制进用户粘贴板
 * @param image base64
 */
const copy_img_to_clipboard = async (image) => {
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
 * @function 创建位于截图框下面的功能按钮区域
 */
const createButton = (option) => {
  const buttonContainer = document.createElement("div")
  buttonContainer.className = "button-container"
  buttonContainer.style.position = "absolute"
  buttonContainer.style.bottom = "-50px"
  buttonContainer.style.right = "0"
  buttonContainer.style.width = "auto"
  buttonContainer.style.height = "32px"
  buttonContainer.style.backgroundColor = "rgba(0, 0, 0,0.5)"
  buttonContainer.style.borderRadius = "5px"
  buttonContainer.style.padding = "5px 10px"

  // 按钮容器
  const container = ReactDOM.createRoot(buttonContainer)

  // 按钮样式
  const buttonStyle = {
    width: "28px",
    height: "28px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "12px"
  }
  container.render(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        height: "100%"
      }}>
      <Icon
        className="cancel"
        style={{ ...buttonStyle, color: "#f44336" }}
        icon="iconoir:cancel"
        onClick={() => cancelScreenshot(option)}
      />
      <Icon
        className="confirm"
        style={{ ...buttonStyle, color: "#4caf50" }}
        icon="line-md:confirm"
        onClick={() => confirmScreenshot(option)}
      />
    </div>
  )
  return buttonContainer
}

/**
 * @function 确认截图
 */
const confirmScreenshot = (option) => {
  console.log(option, "确认截图")
  const { cropImage } = option
  if (!cropImage) return
  copy_img_to_clipboard(cropImage)
  cancelScreenshot(option)
}

/**
 * @function 取消截图
 */
const cancelScreenshot = (option) => {
  const { cropper, imageContainer } = option
  cropper.destroy()
  imageContainer.remove()
  enableBrowserEvent()
}

/**
 * @function 截图时禁止浏览器的一些事件
 */
const disableBrowserEvent = () => {
  document.body.style.overflow = "hidden"
}

/**
 * @function 启用浏览器的一些事件
 */
const enableBrowserEvent = () => {
  // 启用滚动
  document.body.style.overflow = ""
}
