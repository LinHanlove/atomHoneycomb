import { log } from "atom-tools"
import { useEffect, useState } from "react"

import "~/assets/style/tailwind.css"
import "../../node_modules/pretty-print-json/dist/css/pretty-print-json.css"

import { formatter } from "../utils/jsonFormatter"

export default function JsonFormatter() {
  // 格式化前的数据
  const [data, setData] = useState<string>("")
  // 格式化后的数据
  const [formattedData, setFormattedData] = useState<string>("")

  useEffect(() => {
    try {
      if (!data) return
      setFormattedData(
        formatter(JSON.parse(data || ""), {
          keyIsNeedQuote: true
        })
      )
      console.log(formatter(data))
    } catch (error) {
      log.error(error)
    }
  }, [data])

  return (
    <>
      <h2 className="title text-center text-2xl font-bold py-4">
        JsonFormatter
      </h2>
      <div className="content  grid grid-cols-2 border-2 border-gray-200 rounded-lg p-4 mx-4">
        <div className="col-span-1  pr-4">
          <h3 className="text-xl font-bold py-2">Input:</h3>
          <div className="input-area">
            <textarea
              title="json-input-area"
              className="w-full  min-h-[70vh] p-2 border-2 border-gray-200 rounded-lg resize-none"
              inputMode="text"
              onInput={(e: any) => setData(e.target.value)}
            />
          </div>
        </div>
        <div className="col-span-1 pl-4">
          <h3 className="text-xl font-bold py-2">Output:</h3>
          <div className="output-area w-full h-[70vh] overflow-y-auto p-2 border-2 border-gray-200 rounded-lg resize-none">
            <pre>{formattedData}</pre>
          </div>
        </div>
      </div>
    </>
  )
}
