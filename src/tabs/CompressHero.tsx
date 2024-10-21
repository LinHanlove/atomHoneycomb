import { Icon } from "@iconify/react"

import "~/assets/style/tailwind.css"

import { useEffect, useState } from "react"

import Progress from "~components/progress"
import { Compressor_PNG, formatFileSize, UPNG_PNG } from "~utils"

export default function CompressHero() {
  /**
   * @useState quality
   * @description 选择的压缩率
   */
  const [quality, setQuality] = useState<number>(0.6)

  /**
   * @constant adjustList
   * @description 压缩率
   */
  const adjustList = [
    { value: 0.8, label: "轻度" },
    { value: 0.6, label: "一般" },
    { value: 0.4, label: "重度" }
  ]

  /**
   * @useState fileList
   */
  const [fileList, setFileList] = useState<any[]>([])

  /**
   * @useState compressor details
   */
  const [compressorDetails, setCompressorDetails] = useState<any[]>([])

  /**
   * @description 监听文件列表
   */
  useEffect(() => {
    if (!fileList.length) {
      setCompressorDetails([])
      return
    }

    const afterData = []

    const processFiles = async () => {
      console.log(fileList)

      for (const file of fileList) {
        let fileData
        if (file.status !== "success") {
          if (file.type === "image/png") {
            fileData = await UPNG_PNG(file, quality)
          } else {
            console.log(await Compressor_PNG(file, quality))

            fileData = await Compressor_PNG(file, quality)
          }
          // console.log("压缩前--->", file)

          // console.log("压缩后-->", fileData)
          file["status"] = "success"
          const compressibility =
            ((file.size - fileData.size) / file.size) * 100
          afterData.push({
            id: file.id,
            file: fileData,
            name: file.name,
            size: fileData.size,
            type: file.type,
            compressibility
          })
        }
      }

      setCompressorDetails([...afterData, ...compressorDetails])
    }

    processFiles()
  }, [fileList, quality])

  /**
   * @function handleFileChange
   * @description 上传文件
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.files, fileList)
    Array.from(e.target.files).forEach((file) => {
      file["id"] = file.name.split(".")[0] + "-" + new Date().getTime()
    })

    setFileList([...fileList, ...e.target.files])
    e.target.value = ""
  }

  return (
    <>
      <h2 className="title text-center text-2xl font-bold py-4">
        CompressHero
      </h2>
      <div className="subTitle mx-4  text-[10px] font-semibold flex ">
        <div className="mb-1 ">
          智能有损压缩，支持PNG、JPEG、GIF、WEBP等格式
        </div>
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
      <div className="container h-[75vh] overflow-y-auto border-2 border-gray-200 rounded-lg p-4 mx-4">
        {/* S 调节区 */}
        <div className="flex justify-start">
          <div className="flex items-center mb-4 bg-[#f5f5f5] p-1 rounded-lg">
            {adjustList.map((item) => {
              return (
                <div
                  style={{
                    backgroundColor:
                      item.value === quality ? "orange" : "#f5f5f5"
                  }}
                  onClick={() => setQuality(item.value)}
                  className="w-[60px] h-[26px] flex items-center justify-center rounded-lg mr-4 cursor-pointer hover:bg-[#e0e0e0] transition-all duration-300"
                  key={item.value}>
                  <div className="flex items-center ">{item.label}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* E 调节区 */}
        <div className="content flex items-start justify-center ">
          {/* S 上传区 */}
          <div className="flex justify-center">
            <input
              type="file"
              accept="image/*"
              multiple
              id="file"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file"
              className="w-[384px] h-[160px] group border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer">
              <Icon
                icon="si:add-fill"
                className="w-[20px] h-[20px] text-[orange] mb-2 group-hover:scale-150 transition-all duration-300"
              />
              <div className="text-[#666] text-[14px] font-semibold group-hover:scale-[1.2] transition-all duration-300">
                点击或拖拽图片文件到此处
              </div>
            </label>
          </div>
        </div>
        {/* E 上传区 */}

        {/* S 展示区 */}
        <div className=" mt-4 flex justify-center items-center flex-col ">
          {fileList.map((item) => (
            <div className="flex items-center justify-between w-[70vw] h-[46px]">
              <div key={item.name} className="mt-2 w-[66vw] ">
                {item.name}
                <Progress
                  beforeText={formatFileSize(item.size)}
                  afterText={formatFileSize(
                    compressorDetails.find((i) => i.id === item.id)?.size
                  )}
                  progress={
                    compressorDetails.find((i) => i.id === item.id)
                      ?.compressibility
                  }
                />
              </div>
              <div className="h-full group flex items-end justify-center ">
                <Icon
                  icon="line-md:download-loop"
                  className="w-[20px] h-[20px] rounded-full  text-[orange] group-hover:bg-[#f5f5f5] group-hover:scale-150 transition-all duration-300"
                />
              </div>
            </div>
          ))}
        </div>
        {/* S 展示区 */}
      </div>
    </>
  )
}
