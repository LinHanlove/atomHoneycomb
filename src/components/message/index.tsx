import { Icon } from "@iconify/react"
import ReactDOM from "react-dom/client"

import { Log } from "~utils"

const messageContainerStyle: React.CSSProperties = {
  position: "absolute",
  top: "30%",
  left: "50%",
  transform: "translateX(-50%)",
  width: "86%",
  maxWidth: "624px",
  backgroundColor: "#fff",
  boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
  borderRadius: "5px",
  padding: "30px 40px",
  display: "flex",
  alignItems: "center"
}

const titleStyle: React.CSSProperties = {
  fontSize: "18px"
}

const subTitleStyle: React.CSSProperties = {
  fontSize: "14px",
  padding: "16px 0 0 0"
}

export const Message = (option) => {
  Log(option, "option")

  const { title, subTitle } = option
  const containerDom = document.createElement("div")
  containerDom.className = "message-container"

  const container = ReactDOM.createRoot(containerDom)

  container.render(
    <div style={messageContainerStyle}>
      <Icon
        icon="eos-icons:arrow-rotate"
        width="40"
        height="40"
        color="orange"
      />
      <div style={{ marginLeft: "16px" }}>
        <div style={titleStyle} className="title">
          {title}
        </div>
        <div style={subTitleStyle} className="subtitle">
          {subTitle}
        </div>
      </div>
    </div>
  )

  return containerDom
}
