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

  // 是否展示设置
  const openSetting = () => {
    setSetModel(showModel === "true" ? "false" : "true")
  }

  // 是否展示删除
  const openDelete = () => {
    setShowEditModel(showEditModel === "true" ? "false" : "true")
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

    if (!alias || !prefix) return setSetModel("false")

    if (setting.find((item: any) => item.alias === alias)) {
      alert("别名已存在")
      return setSetModel("false")
    }

    if (setting.length >= 10) return alert("最多添加10个别名")

    setSetting([...setting, newSetting])
    setSearchTarget(searchTarget)
    localStorage.setItem("setting", JSON.stringify([...setting, newSetting]))
    localStorage.setItem("searchTarget", searchTarget)
    setSetModel("false")
  }

  // 删除快捷搜索
  const onDelete = (key: string) => {
    const newSetting = setting.filter(
      (item: any, index: number) => item.alias !== key
    )
    setSetting(newSetting)
    localStorage.setItem("setting", JSON.stringify(newSetting))
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
            <p className="w-full text-center mt-1 text-nowrap">设置</p>
          </div>
          <div className="w-[40px] flex justify-center items-center flex-col">
            {/* 点击截图 */}
            <button
              className="atom-button"
              type="button"
              title="删除"
              onClick={() => openDelete()}>
              <Icon
                icon="tabler:settings-star"
                className=" text-[orange] w-[20px] h-[20px]"
              />
            </button>
            {/* 点击截图 */}
            <p className="w-full text-center mt-1 text-nowrap">删除</p>
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
      {showEditModel === "true" && (
        <div className="modal fixed z-[9999] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] h-[80%] bg-[#fff] px-[10px] pb-[16px] pt-2 rounded-xl  shadow-2xl">
          <p className=" text-[14px] font-bold">删除设置</p>
          <div className="modal-content text-[10px]">
            <p className="mt-1 pb-1 text-[#818999]">
              点击列表中的删除按钮即可删除
            </p>
          </div>
          <div className="title flex items-center">
            <div className="w-[10%]">名称</div>
            <div className="w-[80%] text-center">规则</div>
            <div className="w-[10%]">操作</div>
          </div>
          <div className="list overflow-y-auto h-[54%]">
            {setting.map((item, idx) => {
              return (
                <div
                  className="title flex items-center w-full flex-nowrap"
                  key={idx}>
                  <div className="w-[50px] truncate text-[teal]">
                    {item.alias}
                  </div>
                  <div className="flex-1 flex items-center overflow-x-auto">
                    <div className="w-[100px] truncate">{item.prefix}</div>
                    <div className="text-[orange] w-[28px] text-nowrap text-[7px]">
                      + 搜索值 +
                    </div>
                    <div className="w-[100px] truncate ml-2">
                      {item.suffix || "--"}
                    </div>
                  </div>
                  <div
                    onClick={() => onDelete(item.alias as string)}
                    className="w-[20px] h-[20px] rounded-full hover:bg-[#f0f0f0] flex items-center justify-center ">
                    <Icon
                      icon="mdi:delete-outline"
                      className=" text-[red] w-[14px] h-[14px] cursor-pointer"
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <button
            className="atom-button--small !w-auto !px-2 text-nowrap text-[teal] mx-[auto] mt-2"
            type="button"
            title="确定"
            onClick={() => setShowEditModel("false")}>
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
