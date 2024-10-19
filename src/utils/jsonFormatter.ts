import type { TYPE } from "~types"

/**
 * @function jsonFormatter
 * @description 将JSON数据转换为HTML字符串。
 * @param data JSON数据
 * @param options 格式化选项
 * @returns
 */
export const jsonFormatter = (
  data: unknown,
  options?: TYPE.FormatOptions
): string => {
  const {
    indent = 2,
    lineNumbers = false,
    linkUrls = true,
    linksNewTab = true,
    quoteKeys = false,
    trailingCommas = true
  } = options

  // 将JSON转换为HTML。
  const invalidHtml = /[<>&]|\\"/g

  const jsonLine = /^( *)("[^"]+": )?("[^"]*"|[\w.+-]*)?([{}[\],]*)?$/gm
  // 正则表达式解析JSON字符串的每一行到四个部分：
  //    捕获组         部分        描述                    例子
  //    ----------------  ----------  ---------------------------  ------------------
  //    ( *)                p1: indent  缩进空格                '   '
  //    ("[^"]+": )         p2: key     键名                    '"active": '
  //    ("[^"]*"|[\w.+-]*)  p3: value   键值                    'true'
  //    ([{}[\],]*)         p4: end     行终止字符              ','
  // 例如，'   "active": true,' 被解析为：['   ', '"active": ', 'true', ',']

  // 将特殊字符转换为HTML实体。
  const toHtml = (char: string) =>
    char === "<"
      ? "&lt;"
      : char === ">"
        ? "&gt;"
        : char === "&"
          ? "&amp;"
          : "&bsol;&quot;" // 转义的引号: \"

  const spanTag = (type: TYPE.JsonType, display?: string): string =>
    // 创建类似于 "<span class=json-boolean>true</span>" 的HTML。
    display ? "<span class=json-" + type + ">" + display + "</span>" : ""

  /**
   * @function buildValueHtml
   * @description 分析一个值并返回类似于 "<span class=json-number>3.1415</span>" 的HTML。
   * @param value JSON值
   * @returns
   */
  const buildValueHtml = (value: string): string => {
    // 分析一个值并返回类似于 "<span class=json-number>3.1415</span>" 的HTML。
    const strType = /^"/.test(value) && "string"
    const boolType = ["true", "false"].includes(value) && "boolean"
    const nullType = value === "null" && "null"
    const type = boolType || nullType || strType || "number"
    const urlPattern = /https?:\/\/[^\s"]+/g
    const target = linksNewTab ? " target=_blank" : ""
    const makeLink = (link: string) =>
      `<a class=json-link href="${link}"${target}>${link}</a>`
    const display =
      strType && linkUrls ? value.replace(urlPattern, makeLink) : value
    return spanTag(type, display)
  }

  /**
   * @function buildLineHtml
   * @description 将JSON字符串的每一行转换为HTML。
   * @param match JSON字符串的每一行
   * @param parts 捕获组（缩进，键，值，结束）
   * @returns
   */
  const replacer = (match: string, ...parts: string[]): string => {
    // 将四个括号捕获组（缩进，键，值，结束）转换为HTML。
    const part = {
      indent: parts[0],
      key: parts[1],
      value: parts[2],
      end: parts[3]
    }
    const findName = quoteKeys ? /(.*)(): / : /"([\w$]+)": |(.*): /
    const indentHtml = part.indent || ""
    const keyName = part.key && part.key.replace(findName, "$1$2")
    const keyHtml = part.key
      ? spanTag("key", keyName) + spanTag("mark", ": ")
      : ""
    const valueHtml = part.value ? buildValueHtml(part.value) : ""
    const noComma = !part.end || ["]", "}"].includes(match.at(-1)!)
    const addComma = trailingCommas && match.at(0) === " " && noComma
    const endHtml = spanTag(
      "mark",
      addComma ? (part.end ?? "") + "," : part.end
    )
    return indentHtml + keyHtml + valueHtml + endHtml
  }

  // 将JSON转换为HTML。
  const json = JSON.stringify(data, null, indent) || "undefined"

  // 将特殊字符转换为HTML实体。
  const html = json.replace(invalidHtml, toHtml).replace(jsonLine, replacer)

  // 将HTML包裹在 <pre> 标签中。
  const makeLine = (line: string): string => `   <li class=json-li>${line}</li>`

  // 用 <ol> 标签包裹 HTML。
  const addLineNumbers = (
    html: string
  ): string => // 用 <ol> 标签包裹 HTML
    [
      "<ol class=json-lines style='list-style:auto !important;'>",
      ...html.split("\n").map(makeLine),
      "</ol>"
    ].join("\n")

  // 返回HTML。
  return lineNumbers ? addLineNumbers(html) : html
}
