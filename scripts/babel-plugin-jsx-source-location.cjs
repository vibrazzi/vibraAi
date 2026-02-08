
module.exports = function babelPluginJsxSourceLocation({ types: t }) {
  const HTML_TAGS = new Set([
    'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio',
    'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button',
    'canvas', 'caption', 'cite', 'code', 'col', 'colgroup',
    'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt',
    'em', 'embed',
    'fieldset', 'figcaption', 'figure', 'footer', 'form',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html',
    'i', 'iframe', 'img', 'input', 'ins',
    'kbd',
    'label', 'legend', 'li', 'link',
    'main', 'map', 'mark', 'math', 'menu', 'menuitem', 'meta', 'meter',
    'nav', 'noscript',
    'object', 'ol', 'optgroup', 'option', 'output',
    'p', 'param', 'picture', 'pre', 'progress',
    'q',
    'rb', 'rp', 'rt', 'rtc', 'ruby',
    's', 'samp', 'script', 'search', 'section', 'select', 'slot', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup',
    'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track',
    'u', 'ul',
    'var', 'video',
    'wbr',
  ]);

  const SVG_TAGS = new Set([
    'svg',
    'a', 'altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor', 'animateMotion', 'animateTransform',
    'circle', 'clipPath', 'color-profile', 'cursor',
    'defs', 'desc',
    'ellipse',
    'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence',
    'filter', 'font', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignObject',
    'g', 'glyph', 'glyphRef',
    'hkern',
    'image',
    'line', 'linearGradient',
    'marker', 'mask', 'metadata', 'missing-glyph', 'mpath',
    'path', 'pattern', 'polygon', 'polyline',
    'radialGradient', 'rect',
    'set', 'stop', 'switch', 'symbol',
    'text', 'textPath', 'tref', 'tspan',
    'use',
    'view', 'vkern',
  ]);

  const NATIVE_TAGS = new Set([...HTML_TAGS, ...SVG_TAGS]);

  const shouldSkipFile = (filename) => {
    if (!filename) return true;
    return filename.includes('node_modules');
  };

  const getRelativePath = (filename, cwd) => {
    if (!filename || !cwd) return filename;
    if (filename.startsWith(cwd)) {
      return filename.slice(cwd.length + 1);
    }
    return filename;
  };

  const hasDataSourceAttr = (attributes) => {
    return attributes.some(
      (attr) =>
        t.isJSXAttribute(attr) &&
        t.isJSXIdentifier(attr.name, { name: 'data-source' })
    );
  };

  const shouldSkipElement = (name) => {
    if (t.isJSXMemberExpression(name)) {
      return true;
    }

    if (t.isJSXIdentifier(name)) {
      const tagName = name.name;

      const skipList = ['Fragment', 'Suspense', 'StrictMode'];
      if (skipList.includes(tagName)) {
        return true;
      }

      if (!NATIVE_TAGS.has(tagName)) {
        return true;
      }
    }

    return false;
  };

  return {
    name: 'jsx-source-location',
    visitor: {
      JSXOpeningElement(path, state) {
        const { filename } = state;

        if (shouldSkipFile(filename)) {
          return;
        }

        if (shouldSkipElement(path.node.name)) {
          return;
        }

        if (hasDataSourceAttr(path.node.attributes)) {
          return;
        }

        const { line, column } = path.node.loc?.start || {};
        if (!line) {
          return;
        }

        const cwd = state.cwd || process.cwd();
        const relativePath = getRelativePath(filename, cwd);

        const col = column !== undefined ? column + 1 : 1;
        const sourceValue = `${relativePath}:${line}:${col}`;
        const dataSourceAttr = t.jsxAttribute(
          t.jsxIdentifier('data-source'),
          t.stringLiteral(sourceValue)
        );

        path.node.attributes.push(dataSourceAttr);
      },
    },
  };
};
