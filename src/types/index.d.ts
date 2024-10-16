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
}