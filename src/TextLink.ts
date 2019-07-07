export namespace TextLink {
  export function format(str: string): string {
    str = str.replace(
      /(.?)(https?:\/\/\S+)(\S)/g,
      (matchAll: string, m1: string, m2: string, m3: string) => {
        const kakkos = new Map([["[", "]"], ["(", ")"], ["<", ">"], ["{", "}"]]);
        // m1がkakkosの中に当てはまるかどうかチェック
        let head = "", tail = "", url = "", a = "";
        if (kakkos.get(m1) === m3) {
          head = m1;
          url = m2;
          a = m2;
          tail = m3;
        } else {
          head = m1;
          url = m2 + m3;
          a = m2 + m3;
          tail = "";
        }
        url = url.replace(/"/g, ""); // あり得ないはずなので消す
        head = head.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        a = a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        tail = tail.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return `${head}<a href="${url}" rel="noopener noreferrer nofollow" target="_blank">${shortUrlDispaly(a)}</a>${tail}`;
      }
    );
    str = str.replace(/\n/g, "<br>");
    return str;
  }
}
function shortUrlDispaly(link: string): string {
  const linkObject = new URL(link);
  if (linkObject.host === "developers.google.com") {
    if (linkObject.pathname == "/drive/api/v3/reference/files/list") {
      linkObject.search = "";
      linkObject.hash = "";
      return linkObject.toString();
    }
  } else if (linkObject.host == "www.google.com") {
    if (linkObject.pathname == "/search") {
      linkObject.search = "";
      linkObject.hash = "";
      return linkObject.toString();
    }
  } else if (linkObject.host == "www.amazon.co.jp") {
    linkObject.pathname = "";
    linkObject.search = "";
    linkObject.hash = "";
    return linkObject.toString();
}
  return link;
}
