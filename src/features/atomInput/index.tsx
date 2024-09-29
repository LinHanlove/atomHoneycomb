import { Icon } from "@iconify/react"
import { useEffect, useState } from "react"

import cssText from "./index.scss"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

// 输入框组件
export const Input = ({
  onInput,
  value = "",
  placeholder = "输入关键字",
  width = 120,
  readOnly = false
}) => {
  const [input, setInput] = useState("")
  const [showClose, setShowClose] = useState(false)

  const onInputChange = (value) => {
    setInput(value)
    onInput(value)
  }

  const onClose = () => {
    setInput("")
    onInput("")
  }

  useEffect(() => {
    onInputChange(value)
    setShowClose(!!value)
  }, [value])

  useEffect(() => {
    setShowClose(!!input)
  }, [input])

  return (
    <div className="flex justify-between items-center">
      <div className="label-box">
        <label className="relative">
          <input
            style={{ width: `${width}px` }}
            className="text-[teal] text-[12px]  py-[4px] pl-[8px] pr-[4px] box-border"
            type="text"
            placeholder={placeholder}
            onInput={(e) => onInputChange(e.currentTarget.value)}
            value={input}
            readOnly={readOnly}
          />
          {showClose && (
            <Icon
              icon="carbon:close-filled"
              onClick={() => onClose()}
              className=" text-[orange] w-[12px] h-[12px] absolute top-0 right-1 z-[999]"
            />
          )}
        </label>
      </div>
    </div>
  )
}
