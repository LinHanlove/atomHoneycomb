
import ReactDOM from "react-dom/client"
import { Icon } from "@iconify/react"
import { copyImgToClipboard, enableBrowserEvent } from "~utils"


export const createButton = (option) => {
  console.log(option, "option");
  
  /**
   * @function 确认截图
   */
  const  confirmScreenshot = (option)=> {
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