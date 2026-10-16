// Sätteri hast plugin (Astro 7's Markdown processor). Turns a Markdown image
// that stands alone in its paragraph and has a title,
//   ![Alt text](./photo.webp "Caption")
// into <figure><img alt="Alt text"><figcaption>Caption</figcaption></figure>.
// The title is dropped from the <img> (it'd duplicate the caption as a hover
// tooltip); the post lightbox reads the caption from the <figcaption>.
// Several titled images on consecutive lines of the same paragraph become a
// <div class="figure-row"> of figures, laid out side by side (global.css).
// Images without a title are left untouched. Runs before Astro's own image
// plugin, so the <img> is still optimized as usual.

const isBlankText = (node) => node.type === "text" && node.value.trim() === "";

const isTitledImage = (node) =>
  node.type === "element" && node.tagName === "img" && Boolean(node.properties?.title);

const toFigure = (img) => {
  const { title, ...properties } = img.properties;
  return {
    type: "element",
    tagName: "figure",
    properties: {},
    children: [
      { type: "element", tagName: "img", properties, children: [] },
      {
        type: "element",
        tagName: "figcaption",
        properties: {},
        children: [{ type: "text", value: String(title) }],
      },
    ],
  };
};

export const figureCaptions = {
  name: "figure-captions",
  element: {
    filter: ["p"],
    visit(p, ctx) {
      const content = p.children.filter((child) => !isBlankText(child));
      if (content.length === 0 || !content.every(isTitledImage)) return;

      if (content.length === 1) {
        ctx.replaceNode(p, toFigure(content[0]));
        return;
      }
      ctx.replaceNode(p, {
        type: "element",
        tagName: "div",
        properties: { className: ["figure-row"] },
        children: content.map(toFigure),
      });
    },
  },
};
