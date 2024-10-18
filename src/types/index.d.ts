export namespace TYPE {
  interface ISetting{
    alias: string,
    prefix: string,
    suffix: string
  }

  interface ISendMessage{
    type: string
    origin: string
    data?: any
    chrome?: any
  } 

  interface IChromeMessage{
    type?: 'basic' | 'image' | 'list' | 'progress' // 消息类型 [https://developer.chrome.com/docs/extensions/reference/api/notifications?hl=zh-cn#type-TemplateType]
    title?: string
    message: string
    iconUrl?: string
    chrome?: any
    timeout?: number
  }

  interface IContent{
    x: number,
    y: number,
    w: number,
    h: number
  }
}


declare module 'plasmo' {
  export interface PlasmoCSConfig {
    
  }
}