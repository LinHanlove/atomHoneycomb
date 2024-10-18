import { Icon } from "@iconify/react"
import { useEffect, useRef, useState } from "react"

import cssText from "./index.scss"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

interface IAtomInputProps {
  onInput: (value: string) => void
  value?: string
  id?: string
  placeholder?: string
  width?: number
  readOnly?: boolean
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

// 输入框组件
export const Input: React.FC<IAtomInputProps> = ({
  onInput,
  value = "",
  id = "",
  placeholder = "输入关键字",
  width = 120,
  readOnly = false,
  onKeyDown
}) => {
  const [input, setInput] = useState("")
  const [showClose, setShowClose] = useState(false)
  const inputRef = useRef(null)

  const onInputChange = (value) => {
    setInput(value)
    onInput(value)
  }

  const onClose = () => {
    setInput("")
    onInput("")
  }

  useEffect(() => {
    inputRef.current?.focus()
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
            id={id}
            style={{ width: `${width}px` }}
            className="text-[teal] text-[12px]  py-[4px] pl-[8px] pr-[4px]  "
            type="text"
            placeholder={placeholder}
            onInput={(e) => onInputChange(e.currentTarget.value)}
            value={input}
            readOnly={readOnly}
            onKeyDown={onKeyDown}
          />
          {showClose && (
            <Icon
              icon="carbon:close-filled"
              onClick={() => onClose()}
              className=" text-[#ffa500] w-[12px] h-[12px] absolute top-0 right-1 z-[999]"
            />
          )}
        </label>
      </div>
    </div>
  )
}
