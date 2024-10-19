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
  interface IJsonFormatterOption {
    /* 可选的 replacer 参数，用于选择键 */
    replacer?: (key: string, value: any) => any | any[]
    /* 可选的 space 参数，用于缩进 */
    space?: string | number
    /* 可选的 limit 参数，用于限制缩进的深度 */
    limit?: number
    /* 格式化后key是否需要引号 */
    keyIsNeedQuote?: boolean
  }
}

declare module "plasmo" {
  export interface PlasmoCSConfig {}
}
