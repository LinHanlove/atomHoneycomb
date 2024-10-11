import { Icon } from "@iconify/react"
import Cropper from "cropperjs"
import html2canvas from "html2canvas"
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
    responsive: true, // 响应式
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

    // 删除之前的按钮组
    const actionContainer = document.querySelector(
      ".action-container"
    ) as HTMLElement
    if (actionContainer) {
      actionContainer.remove()
    }
    // 添加操作按钮组
    cropBox.append(
      createButton({
        cropper,
        cropImage,
        imageContainer,
        cropBox,
        imageDom
      })
    )
    setBoundary(cropper)
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

  /**
   * @function 设置操作按钮组位置
   */
  const setBoundary = (crop) => {
    // 获取裁切框数据
    const cropBoxData = crop.getCropBoxData()
    // 获取操作按钮组
    const actionContainer = document.querySelector(
      ".action-container"
    ) as HTMLElement
    // 获取操作按钮组宽度
    const actionContainerInfo = actionContainer.getClientRects()[0]

    // 如果裁切框位于左侧 且宽度小于操作按钮组宽度，则将操作移动到右侧
    if (
      cropBoxData.left < 20 &&
      cropBoxData.width <= actionContainerInfo.width
    ) {
      actionContainer.style.right = `-${actionContainerInfo.width + 20}px`
      actionContainer.style.left = "auto"
    }
    // 如果裁切框位于底部 则将操作移动到顶部
    if (cropBoxData.top >= window.innerHeight - 50) {
      actionContainer.style.top = `-${actionContainerInfo.height + 10}px`
      actionContainer.style.bottom = "auto"
    }
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
    img.id = "crop-img"
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.id = "crop-canvas"
      const canvasOnce = document.getElementById("crop-canvas")
      canvas.width = w
      canvas.height = h
      canvas.style.position = "relative"
      const context = canvas.getContext("2d")
      context.drawImage(img, x, y, w, h, 0, 0, w, h)
      const cropped = canvas.toDataURL(`image/${format}`)
      if (canvasOnce) {
        canvasOnce.remove()
      }
      document.body.append(canvas)
      resolve(cropped)
    }

    img.src = image
    document.body.append(img)
    console.log("img.src--->", img)
  })
}

/**
 * 将图片复制进用户粘贴板
 * @param image base64
 */
const copyImgToClipboard = async (image) => {
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
  buttonContainer.className = "action-container"
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
        width: "auto",
        height: "100%"
      }}>
      {/* <Icon
        className="cancel"
        style={{ ...buttonStyle, color: "#36aef4" }}
        icon="mynaui:rectangle"
        onClick={() => draw(option)}
      /> */}
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
  copyImgToClipboard(cropImage)
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

/**
 * @function 点击绘制
 * 删除裁切区域内容，替换为canvas 方便绘制
 */
const draw = (option) => {
  const { cropper, imageDom } = option

  // 获取cropper的画布和上下文
  const canvas = cropper.cropBox
  console.log(canvas, "canvas")

  // 获取当前裁剪框的数据
  const rect = cropper.getCropBoxData()
  // 获取当前的截图
  const cropImage = cropper.getCroppedCanvas().toDataURL("image/png")

  // 创建一个新的canvas元素
  const newCanvas = document.createElement("canvas")
  newCanvas.id = "newCanvas"
  newCanvas.width = rect.width
  newCanvas.height = rect.height
  // 删除裁切区域内容
  canvas.remove()
  // 将新的canvas元素添加到页面中
  canvas.append(newCanvas)

  // const ctx = canvas.getContext("2d")

  // // 保存当前状态
  // ctx.save()

  // // 绘制一个矩形框
  // ctx.strokeStyle = "red" // 边框颜色
  // ctx.lineWidth = 2 // 边框线宽
  // const rect = cropper.getCropBoxData() // 获取裁剪框数据
  // ctx.strokeRect(0, 0, rect.width, rect.height) // 绘制矩形框

  // // 恢复之前的状态
  // ctx.restore()

  // // 将绘制的canvas转换为base64，并设置为图片元素的源
  // const dataUrl = canvas.toDataURL("image/png")

  // // 创建一个新的Image对象，用于替换裁剪区域的内容
  // const newImage = new Image()
  // newImage.onload = () => {
  //   // 替换裁剪区域的内容
  //   const imageData = ctx.getImageData(0, 0, rect.width, rect.height)
  //   const newCanvas = document.createElement("canvas")
  //   const newCtx = newCanvas.getContext("2d")
  //   newCanvas.width = rect.width
  //   newCanvas.height = rect.height
  //   newCtx.putImageData(imageData, 0, 0)
  //   cropper.replace(newCanvas.toDataURL("image/png"))
  // }
  // newImage.src = dataUrl
}
