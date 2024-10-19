export namespace TYPE {
  // 默认配置
  interface ISetting {
    alias: string
    prefix: string
    suffix: string
  }

  // 发送消息
  interface ISendMessage {
    type: string
    origin: string
    data?: any
    chrome?: any
  }

  // 消息弹窗
  interface IChromeMessage {
    type?: "basic" | "image" | "list" | "progress" // 消息类型 [https://developer.chrome.com/docs/extensions/reference/api/notifications?hl=zh-cn#type-TemplateType]
    title?: string
    message: string
    iconUrl?: string
    chrome?: any
    timeout?: number
  }

  // 截图区域
  interface IContent {
    x: number
    y: number
    w: number
    h: number
  }

  // json formatter
  interface IFormatOption {
    indent: number // 缩进空格数
    lineNumbers: boolean // 是否用 <ol> 标签包裹 HTML 以支持行号
    linkUrls: boolean // 是否为URL创建锚点标签
    linksNewTab: boolean // 是否给锚点标签添加 target=_blank 属性
    quoteKeys: boolean // 是否总是为键名使用双引号
    trailingCommas: boolean // 是否在数组和对象的最后一个项目后追加逗号
  }
  type FormatOptions = Partial<TYPE.IFormatOption>
  type JsonType = "key" | "string" | "number" | "boolean" | "null" | "mark"
}

declare module "plasmo" {
  export interface PlasmoCSConfig {}
}
