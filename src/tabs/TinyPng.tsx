import { Icon } from "@iconify/react"
import * as imageConversion from "image-conversion"

import "~/assets/style/tailwind.css"

import { useEffect, useState } from "react"

import { blobToFile, notify } from "~utils"

export default function JsonFormatter() {
  /**
   * @function data
   * @description 压缩后的图片数据
   */
  const [data, setData] = useState<any>(null)

  /**
   * @function handleFileChange
   * @description 处理文件上传
   */
  const handleFileChange = (file: File) => {
    console.log("文件--->", file)

    if (!file) return
    if (!file.type.startsWith("image/")) {
      notify({
        message: "请上传图片文件",
        chrome
      })
      return
    }
    imageConversion.compressAccurately(file, 200).then((res) => {
      setData(blobToFile(res, file.name))
      console.log(blobToFile(res, file.name))
    })
  }
  // useEffect(() => {
  //   console.log(Compressor, data)
  // }, [data])
  return (
    <>
      <h2 className="title text-center text-2xl font-bold py-4">tinyPng</h2>
      <div className="subTitle mx-4  text-[10px] font-semibold flex ">
        <div className="waring">注意：</div>
        <div className="mb-1 ">
          在【lineNumbers】模式下双击格式化后的行可复制到剪切板
        </div>
        <div className="mx-2">|</div>
        <div className="mb-1">缩进可调整</div>
        <div className="mx-2">|</div>
        <div className="mb-1 ">操作项可多选</div>
        <div className="mx-2">|</div>
        <div className="mb-1 text-[orange]">
          <a
            title="使用文档"
            href="https://linhan.atomnotion.com/posts/about-atomHoneycomb"
            target="_blank"
            rel="noopener noreferrer">
            使用文档
          </a>
        </div>
      </div>
      <div className="container min-h-[75vh] border-2 border-gray-200 rounded-lg p-4 mx-4">
        <div className="content flex items-start justify-center ">
          {/* S 上传区 */}
          <div className="flex justify-center">
            <input
              type="file"
              id="file"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />
            <label
              htmlFor="file"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
              上传图片
            </label>
          </div>
          <div className="json-container mt-4"></div>
          {/* E 上传区 */}
        </div>
      </div>
    </>
  )
}
