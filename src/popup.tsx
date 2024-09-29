import { Icon } from "@iconify/react"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import cssText from "~/style.scss"
import { Input } from "~features/atomInput"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  world: "MAIN"
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const Content = () => {
  // 是否打开设置模态框
  const [showModel, setSetModel] = useStorage("isShowModel")
  // 是否打开修改模态框
  const [showEditModel, setShowEditModel] = useState("false")

  // 快捷搜索设置
  const [setting, setSetting] = useState(
    JSON.parse(
      localStorage.getItem("setting") ||
        JSON.stringify([
          {
            alias: "npm",
            prefix: "https://www.npmjs.com/package/",
            suffix: ""
          }
        ])
    ) as any
  )

  // 是否展示
  const openSetting = () => {
    setSetModel(showModel === "true" ? "false" : "true")
  }

  // 别名
  const [alias, setAlias] = useState("")
  // 前缀
  const [prefix, setPrefix] = useState("")
  // 后缀
  const [suffix, setSuffix] = useState("")

  // 搜索目标
  const [searchTarget, setSearchTarget] = useState(
    localStorage.getItem("searchTarget") || "0"
  )

  // 图标
  const icons = [
    "arcticons:bigo-live",
    "devicon:livewire",
    "emojione:bug",
    "emojione:cat",
    "emojione:dog",
    "emojione:fish",
    "emojione:horse",
    "emojione:monkey"
  ]

  // 添加快捷搜索
  const onSubmit = () => {
    const newSetting = {
      alias,
      prefix,
      suffix
    }
    // 如果本地不存在在去存储
    if (
      !setting.find((item: any) => item.alias === alias) &&
      setting.length < 10
    ) {
      setSetting([...setting, newSetting])
      setSearchTarget(searchTarget)
      localStorage.setItem("setting", JSON.stringify([...setting, newSetting]))
      localStorage.setItem("searchTarget", searchTarget)
      setSetModel("false")
    } else {
      alert("最多添加8个别名")
    }
  }

  // 快捷搜索
  const [search, setSearch] = useState("")

  const onSearch = async () => {
    if (!search) return
    const target = setting[parseInt(searchTarget)]
    window.open(
      `${target.prefix}${encodeURIComponent(search)}${target.suffix}`,
      "_blank"
    )
  }

  // 设置搜索目标
  const onSetSearchTarget = (idx: string) => {
    setSearchTarget(idx.toString())
    localStorage.setItem("searchTarget", idx)
  }

  return (
    <div
      style={{
        width: "380px",
        minHeight: "280px"
      }}>
      <header className="text-center text-[16px] text-[#000] font-bold mb-1 pt-2 ">
        Honeycomb
      </header>
      {/* S 快捷输入框 */}
      <div className="px-2 pb-3">
        <p>快捷搜索</p>
        <div className="w-full  flex justify-between items-center">
          <Input
            value={search}
            onInput={(e) => setSearch(e)}
            placeholder="输入关键字"
            width={200}
          />
          <div>
            <button
              className="atom-button"
              type="button"
              title="Search"
              onClick={onSearch}>
              <Icon
                icon="ion-md-search"
                className="w-[20px] h-[20px] text-[#00c983] "
              />
            </button>
          </div>
        </div>
      </div>
      {/* E 快捷输入框 */}

      {/* S 功能区 */}
      <div className="menu  h-20 px-4 border-t-[1px] border-[#f4f7f6] flex justify-between items-center pt-2 gap-2">
        <div className="w-[120px] h-full gap-x-2 gap-y-4 items-center border-r-[1px] border-[#f4f7f6] grid grid-cols-2">
          <div className="w-[40px] flex justify-center items-center flex-col">
            {/* 点击截图 */}
            <button
              className="atom-button"
              type="button"
              title="截图"
              onClick={async () => {}}>
              <Icon
                icon="tabler:screenshot"
                className=" text-[#00c983] w-[20px] h-[20px]"
              />
            </button>
            {/* 点击截图 */}
            <p className="w-full text-center mt-1">截图</p>
          </div>
          <div className="w-[40px] flex justify-center items-center flex-col">
            {/* 点击截图 */}
            <button
              className="atom-button"
              type="button"
              title="设置"
              onClick={() => openSetting()}>
              <Icon
                icon="tabler:settings-star"
                className=" text-[orange] w-[20px] h-[20px]"
              />
            </button>
            {/* 点击截图 */}
            <p className="w-full text-center mt-1 text-nowrap">设置搜索</p>
          </div>
          <div className="w-[40px] flex justify-center items-center flex-col">
            {/* 点击截图 */}
            <button
              className="atom-button"
              type="button"
              title="设置"
              onClick={() => openSetting()}>
              <Icon
                icon="tabler:settings-star"
                className=" text-[orange] w-[20px] h-[20px]"
              />
            </button>
            {/* 点击截图 */}
            <p className="w-full text-center mt-1 text-nowrap">修改搜索</p>
          </div>
        </div>

        <div className="flex-1 h-full gap-y-2 items-center grid grid-cols-4">
          {setting.map((item, idx) => {
            return (
              <div
                key={idx}
                className="w-[40px] flex justify-center items-center flex-col col-span-1">
                {/* 点击搜索 */}
                <button
                  className={`atom-button--small ${searchTarget === idx.toString() && "active"}`}
                  type="button"
                  title="搜索"
                  onClick={() => onSetSearchTarget(idx.toString())}>
                  <Icon
                    icon={icons[idx]}
                    className=" text-[orange] w-[20px] h-[20px]"
                  />
                </button>
                {/* 点击搜索 */}
                <p
                  className={`w-full text-center mt-1 ${searchTarget === idx.toString() && "text-[teal] text-[14px] font-bold"}`}>
                  {item.alias}
                </p>
              </div>
            )
          })}
        </div>
      </div>
      {/* E 功能区 */}

      {/* S 设置模态框 */}
      {showModel === "true" && (
        <div className="modal fixed z-[9999] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] h-[80%] bg-[#fff] px-[10px] pb-[16px] pt-2 rounded-xl  shadow-2xl">
          <p className=" text-[14px] font-bold">查询设置</p>
          <div className="modal-content text-[10px]">
            <p className="mt-1 pb-1 text-[#818999]">
              可输入支持url参数拼接搜索参数的网址 示例：
            </p>
            <p className=" w-full text-nowrap">
              <span className="bg-[orange] p-1 rounded-[6px] text-[teal]">
                https://github.com/search?q=搜索值&type=repositories
              </span>
            </p>
          </div>
          <div>
            <p className="py-1 text-[#818999]">名称</p>
            <Input
              onInput={(e) => setAlias(e)}
              placeholder="设置搜索别名"
              width={100}
            />
          </div>
          <div>
            <p className="py-1 text-[#818999]">设置规则</p>
            <div className=" flex items-center justify-between">
              <Input
                onInput={(e) => setPrefix(e)}
                placeholder="前缀,例：https://..."
              />
              <div className="text-[12px] text-[#999] flex items-center h-full">
                + 搜索值 +
              </div>
              <Input
                onInput={(e) => setSuffix(e)}
                placeholder="后缀，没有可不填"
              />
            </div>
          </div>

          <button
            className="atom-button--small !w-auto !px-2 text-nowrap text-[teal] mx-[auto] mt-3"
            type="button"
            title="确定"
            onClick={async () => onSubmit()}>
            确定
            <Icon
              icon="tabler:settings-star"
              className=" text-[orange] w-[14px] h-[14px] ml-1"
            />
          </button>
        </div>
      )}
      {/* E 设置模态框 */}

      {/* S 修改模态框 */}
      {showModel === "true" && (
        <div className="modal fixed z-[9999] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] h-[80%] bg-[#fff] px-[10px] pb-[16px] pt-2 rounded-xl  shadow-2xl">
          <p className=" text-[14px] font-bold">查询设置</p>
          <div className="modal-content text-[10px]">
            <p className="mt-1 pb-1 text-[#818999]">
              可输入支持url参数拼接搜索参数的网址 示例：
            </p>
            <p className=" w-full text-nowrap">
              <span className="bg-[orange] p-1 rounded-[6px] text-[teal]">
                https://github.com/search?q=搜索值&type=repositories
              </span>
            </p>
          </div>
          <div>
            <p className="py-1 text-[#818999]">名称</p>
            <Input
              onInput={(e) => setAlias(e)}
              placeholder="设置搜索别名"
              width={100}
            />
          </div>
          <div>
            <p className="py-1 text-[#818999]">设置规则</p>
            <div className=" flex items-center justify-between">
              <Input
                onInput={(e) => setPrefix(e)}
                placeholder="前缀,例：https://..."
              />
              <div className="text-[12px] text-[#999] flex items-center h-full">
                + 搜索值 +
              </div>
              <Input
                onInput={(e) => setSuffix(e)}
                placeholder="后缀，没有可不填"
              />
            </div>
          </div>

          <button
            className="atom-button--small !w-auto !px-2 text-nowrap text-[teal] mx-[auto] mt-3"
            type="button"
            title="确定"
            onClick={async () => onSubmit()}>
            确定
            <Icon
              icon="tabler:settings-star"
              className=" text-[orange] w-[14px] h-[14px] ml-1"
            />
          </button>
        </div>
      )}
      {/* E 修改模态框 */}
    </div>
  )
}

export default Content
