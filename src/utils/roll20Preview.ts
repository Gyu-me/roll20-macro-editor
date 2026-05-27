export function roll20CodeToHtml(code: string): string {
  return code
    .replace(/^\/desc\s*/, "")
    .replace(
      /\[([\s\S]*?)\]\(([^)]*?)#"\s*style="([^)]*)\)/g,
      (_, text, href, style) => {
        const decode = (s: string) =>
          s
            .replaceAll("&#41;", ")")
            .replaceAll("&rpar;", ")")
            .replaceAll("&#44;", ",");
        const safeHref = href.trim() || "#";
        return `<a href="${safeHref}" style="${decode(style)}" onclick="return false;">${decode(text)}</a>`;
      },
    )
    .replace(/\*\*\*([\s\S]*?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*([\s\S]*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([\s\S]*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}
