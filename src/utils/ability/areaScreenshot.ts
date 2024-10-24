import Cropper from "cropperjs"

import { createButton } from "~components/createButton"
import type { TYPE } from "~types"
import { disableBrowserEvent, Log } from "~utils"

/**
 * @class 区域截图
 */
const areaScreenshot = (base64,chrome) => {
  // 截图内容
  const cropContext = {} as TYPE.IContent
  // 截图
  let cropImage: any
  // 网页截图容器
  const imageContainer = document.createElement("div")
  // 截图容器
  const imageDom = document.createElement("img")
  // 截图框
  let cropBox = null
  // 裁切器
  let cropper: any

  // 初始化
  const init = () => {
    // 查找已经存在的截图容器
    const existingContainer = document.querySelector(".image-container")
    if (existingContainer) {
      // 如果存在，先移除
      existingContainer.remove()
    }

    createContainer().then((container) => {
      window.document.body.appendChild(container)
      imageDom.src = base64
      imageContainer && imageContainer.appendChild(imageDom)
      initCrop(imageDom)
    })
  }

  /**
   * 创建截图容器
   * @returns
   */
  const createContainer = (): Promise<HTMLDivElement> => {
    return new Promise((resolve, reject) => {
      imageContainer.className = "image-container"
      imageContainer.style.position = "fixed"
      imageContainer.style.top = "0"
      imageContainer.style.left = "0"
      imageContainer.style.width = "100%"
      imageContainer.style.height = "100%"
      imageContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
      imageContainer.style.zIndex = "9999"
      resolve(imageContainer)
    })
  }

  /**
   * @function 初始化裁切器
   */
  const initCrop = (content: HTMLImageElement) => {
    return (cropper = new Cropper(content, {
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
    }))
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
   * @function 监听裁剪
   */
  const onCrop = (event) => {
    const { x, y, width, height } = event.detail
    Log("监听裁剪--->", x, y, width, height)
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
    Log("裁剪结束--->", cropImage)

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
        cropper: cropper,
        cropImage: cropImage,
        imageContainer: imageContainer,
        cropBox: cropBox,
        imageDom: imageDom,
        chrome
      })
    )
    setBoundary(cropper)
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
      Log("img.src--->", img)
    })
  }

  return {
    init
  }
}

export default areaScreenshot
