import Cropper from "cropperjs"
import type { PlasmoCSConfig } from "plasmo"

import "cropperjs/dist/cropper.css"

import ReactDOM from "react-dom/client"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

// contentScript.ts
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("Received message in content script: ", message)
  if (message.type === "areaScreenshot") {
    areaScreenshot(message.base64)
    return true // 表示消息已被处理，不需要再分发
  }
})

const infos = {
  x: 0,
  y: 0,
  w: 0,
  h: 0
}

const areaScreenshot = (base64) => {
  // 查找已经存在的截图容器
  const existingContainer = document.querySelector(".image-container")
  if (existingContainer) {
    // 如果存在，先移除
    existingContainer.remove()
  }

  const imageContainer = document.createElement("div")
  document.body.appendChild(imageContainer)
  const root = ReactDOM.createRoot(imageContainer)
  // const cropper = new Cropper(image_dom, {
  //   autoCrop: true,
  //   autoCropArea: 0.8,
  //   zoomOnTouch: false,
  //   zoomOnWheel: false,
  //   movable: false,
  //   rotatable: false,
  //   zoomable: false,
  //   crop(event) {
  //     const { x, y, width, height } = event.detail
  //     infos.x = x
  //     infos.y = y
  //     infos.w = width
  //     infos.h = height
  //   },
  //   cropend() {
  //     const crop_image = crop(base64, infos)
  //     console.log(crop_image, "crop_image")
  //     // // copy_img_to_clipboard(crop_image);
  //     // cropper.destroy();
  //     // image_container.remove();
  //   }
  // })
  root.render(
    <div className="image-container w-[100vw] h-[100vh] fixed left-0 top-0 z-[9999999999999]">
      <img src={base64} className="image-box max-w-full" title="截图" />
    </div>
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
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    document.body.append(canvas)

    const img = new Image()
    img.onload = () => {
      const context = canvas.getContext("2d")
      context.drawImage(img, x, y, w, h, 0, 0, w, h)
      const cropped = canvas.toDataURL(`image/${format}`)
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
 * 创建一个dom遮罩层
 */
function createMask() {
  const mask = document.createElement("div")
  // 必须让鼠标指针能够穿透 mask 元素
  mask.style.pointerEvents = "none"
  mask.style.background = "rgb(3, 132, 253, 0.22)"
  mask.style.position = "fixed"
  mask.style.zIndex = "9999999999999"
  mask.style.display = "none"
  document.body.appendChild(mask)
  return mask
}
