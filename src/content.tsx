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
    areaScreenshot(message.base64)
    return true // 表示消息已被处理，不需要再分发
  }
})

const areaScreenshot = (base64) => {
  console.log("base64---进来啦")

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
  // 初始化裁剪器
  const cropper = new Cropper(imageDom, {
    autoCrop: true,
    autoCropArea: 0.8,
    zoomOnTouch: false,
    zoomOnWheel: false,
    movable: false,
    rotatable: false,
    zoomable: false,
    crop(event) {
      const { x, y, width, height } = event.detail
      console.log(x, y, width, height, "裁剪框")

      cropContext.x = x
      cropContext.y = y
      cropContext.w = width
      cropContext.h = height
    },
    async cropend() {
      cropImage = await crop(base64, cropContext)
      console.log(cropImage, "crop_image内容")
    }
  })

  // 添加操作按钮组
  imageContainer.append(
    createButton({
      cropper,
      cropImage,
      imageContainer
    })
  )
}

/**
 * 图片裁剪
 * @param image base64
 * @param opts {x,y,w,h}
 */
const crop = (image, opts) => {
  console.log(image, opts, "图片裁剪")

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
  console.log(image, "复制进粘贴板")

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
  buttonContainer.style.position = "absolute"
  buttonContainer.style.bottom = "10px"
  buttonContainer.style.left = "0"
  buttonContainer.style.width = "100%"
  buttonContainer.style.zIndex = "99999"
  const container = ReactDOM.createRoot(buttonContainer)
  container.render(
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
      <button onClick={() => confirmScreenshot(option)}>截图</button>
    </div>
  )
  return buttonContainer
}

/**
 * @function 确认截图
 */
const confirmScreenshot = (option) => {
  console.log(option, "确认截图")

  const { cropImage, cropper, imageContainer } = option
  if (!cropImage) return
  copy_img_to_clipboard(cropImage)
  cropper.destroy()
  imageContainer.remove()
}
