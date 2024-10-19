import type { TYPE } from "~types"

/**
 * JSON格式化函数
 * stringify 方法接受一个值和一个可选的 replacer，以及一个可选的空间参数，并返回一个 JSON 文本。
 * @param {any} value 需要格式化的值
 * @param {TYPE.IJsonFormatterOption} option 可选的配置参数
 * @returns {string} 格式化后的 JSON 字符串
 */
export const formatter = (value, option?: TYPE.IJsonFormatterOption) => {
  const {
    replacer = null,
    space = 2,
    limit = 0,
    keyIsNeedQuote = false
  } = option || {}
  // 定义一个正则表达式，用于匹配需要转义的字符
  const regEscapable =
    /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g

  // 定义一个变量 gap，用于存储缩进字符串
  let gap = ""
  // 存储缩进字符串
  let indent = ""

  // 字符替换表
  const meta = {
    "\b": "\\b",
    "\t": "\\t",
    "\n": "\\n",
    "\f": "\\f",
    "\r": "\\r",
    '"': '\\"',
    "\\": "\\\\"
  }

  // 如果 limit 参数不是一个数字，则抛出错误
  if (typeof limit !== "number")
    throw new Error("formatter: limit 必须是一个数字")

  // 如果 space 参数是一个数字，则创建一个包含该数量空格的缩进字符串
  // 如果 space 参数是一个字符串，则将其用作缩进字符串
  if (typeof space === "number") indent = " ".repeat(space)
  if (typeof space === "string") indent = space

  // 如果 replacer 参数不是一个函数或数组，则抛出错误
  if (
    replacer &&
    typeof replacer !== "function" &&
    (typeof replacer !== "object" || typeof replacer.length !== "number")
  )
    throw new Error("formatter: 错误的 replacer 参数")

  // 引号函数，用于将字符串安全地转换为 JSON 字符串
  const quote = (string) => {
    // 如果字符串中没有控制字符、引号字符和反斜杠字符，则可以直接添加引号
    // 否则，必须将这些字符替换为安全的转义序列
    regEscapable.lastIndex = 0
    return regEscapable.test(string)
      ? `"${string.replace(regEscapable, (a) => {
          const key = meta[a]
          return typeof key === "string"
            ? key
            : `\\u${("0000" + a.charCodeAt(0).toString(16)).slice(-4)}`
        })}"`
      : `"${string}"`
  }

  // keyTranslateStr 函数，用于将对象的键转换为字符串
  const keyTranslateStr = (key, holder, limit) => {
    console.log("---->>", key, holder, limit)

    let value = holder[key]
    // 如果值有 toJSON 方法，则调用它以获得替代值
    if (
      value &&
      typeof value === "object" &&
      typeof value.toJSON === "function"
    )
      value = value.toJSON(key)

    // 如果我们使用 replacer 函数调用，则调用 replacer 以获得替代值
    if (typeof replacer === "function")
      value = replacer.call(holder, key, value)

    // 下一步取决于值的类型
    switch (typeof value) {
      case "string":
        return quote(value)
      case "number":
        return isFinite(value) ? String(value) : "null"
      case "boolean":
      case "null":
        return String(value)
      case "object":
        if (!value) return "null"
        gap += indent
        const partial = []
        // 值是否是数组？
        if (Array.isArray(value)) {
          // 如果是数组，则遍历数组中的每个元素
          for (let i = 0; i < value.length; i++) {
            partial.push(keyTranslateStr(i, value, limit) || "null")
          }
          // 如果 limit 参数大于 0，则递归调用 formatter 函数以格式化数组
          const values =
            partial.length === 0
              ? "[]"
              : gap
                ? gap.length + partial.join(",").length + 4 > limit
                  ? `[\n${gap}${partial.join(",\n" + gap)}\n${gap.slice(0, -indent.length)}]`
                  : `[ ${partial.join(", ")} ]`
                : `[${partial.join(",")}]`
          gap = gap.slice(0, -indent.length)
          return values
        }

        // 如果 replacer 是数组，使用它来选择要字符串化的成员
        if (replacer && typeof replacer === "object") {
          for (let i = 0; i < replacer.length; i++) {
            const k = replacer[i]
            if (typeof k === "string") {
              const v = keyTranslateStr(k, value, limit)
              if (v)
                partial.push(
                  `${keyIsNeedQuote ? k : quote(k)}` + (gap ? ": " : ":") + v
                )
            }
          }
        } else {
          // 否则，遍历对象中的所有键
          for (const k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              const v = keyTranslateStr(k, value, limit)
              if (v)
                partial.push(
                  `${keyIsNeedQuote ? k : quote(k)}` + (gap ? ": " : ":") + v
                )
            }
          }
        }
        // 将所有成员文本连接在一起，用逗号分隔，并用大括号包裹
        const str =
          partial.length === 0
            ? "{}"
            : gap
              ? gap.length + partial.join(",").length + 4 > limit
                ? `{\n${gap}${partial.join(",\n" + gap)}\n${gap.slice(0, -indent.length)}}`
                : `{ ${partial.join(", ")} }`
              : `{${partial.join(",")}}`
        gap = gap.slice(0, -indent.length)
        return str
    }
  }

  // 创建一个假的根对象，其中包含我们的值，键为 ''
  return keyTranslateStr("", { "": value }, limit)
}
