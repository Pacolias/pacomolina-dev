// Sätteri hast plugin (Astro 7's Markdown processor). Turns a Markdown image
// that stands alone in its paragraph and has a title,
//   ![Alt text](./photo.webp "Caption")
// into <figure><img alt="Alt text"><figcaption>Caption</figcaption></figure>.
// The title is dropped from the <img> (it'd duplicate the caption as a hover
// tooltip); the post lightbox reads the caption from the <figcaption>.
// Images without a title are left untouched. Runs before Astro's own image
// plugin, so the <img> is still optimized as usual.

const isBlankText = (node) => node.type === "text" && node.value.trim() === "";

export const figureCaptions = {
  name: "figure-captions",
  element: {
    filter: ["p"],
    visit(p, ctx) {
      const content = p.children.filter((child) => !isBlankText(child));
      const [img] = content;
      if (content.length !== 1 || img.type !== "element" || img.tagName !== "img") return;
      const title = img.properties?.title;
      if (!title) return;

      const { title: _title, ...properties } = img.properties;
      ctx.replaceNode(p, {
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
      });
    },
  },
};
