const mime = require('mime')
const path = require('path');
const { promises: fs } = require('fs');

const pkg = require('./package.json');

const defaultExts = ['jpg', 'jpeg', 'png', 'svg'];
const defaultLimit = 10240;
const defaultEncoding = 'base64';

async function encode(file, name, { limit = defaultLimit, bufferEncoding = defaultEncoding }) {
  const encoding = 'binary';
  if (path.isAbsolute(file)) {
    file = await fs.readFile(file, encoding);
  }

  if (file.length > limit) {
    return;
  }

  const mimetype = mime.getType(name);
  const buffer = Buffer.from(file, encoding);
  return `data:${mimetype || ''};${bufferEncoding},${buffer.toString(bufferEncoding)}`;
}

/**
 * @typedef {object} IPluginOptions
 * @property {string[]} options.exts - default ["jpg","jpeg","png","svg"]
 * @property {string|number} options.limit - default 10240
 * @property {string} options.encoding - default "base64"
 */

/**
 * @param {IPluginOptions} options 
 * @returns {IPluginOptions}
 */
function formatOptions(options) {
  const {
    exts = defaultExts,
    limit = defaultLimit,
    encoding = defaultEncoding,
  } = options || {};

  return {
    exts: Array.isArray(exts) && exts.length > 0 ? exts : defaultExts,
    limit: limit === false ? 0 : Number(limit === true ? defaultLimit : limit),
    encoding: encoding || defaultEncoding,
  };
}

function getEncodingType(ext) {
  const UTF8_FORMATS = ['.css', '.html', '.js', '.map', '.mjs', '.json', '.svg', '.txt', '.xml'];
  return UTF8_FORMATS.includes(ext) ? 'utf-8' : 'binary';
}

/**
 * @param {any} snowpackConfig 
 * @param {IPluginOptions} options
 */
module.exports = function plugin(snowpackConfig, options) {
  const {
    exts,
    limit,
    encoding,
  } = formatOptions(options);

  const input = exts
    .filter(ext => typeof ext === 'string' && !!ext)
    .map(ext => ext.startsWith('.') ? ext : `.${ext}`);

  const output = ['.js'].concat(input);

  const cwd = process.cwd();

  let isDev = true;

  return {
    name: pkg.name,
    resolve: {
      input,
      output,
    },
    async run(options) {
      isDev = !!options.isDev;
    },
    async load({ filePath, fileExt }) {
      const uri = await encode(
        filePath,
        filePath,
        { limit, bufferEncoding: encoding },
      );
      if (uri) {
        console.log(`[${pkg.name}] Inlined File: ${filePath}`);
        return {
          '.js': `export default "${uri}";`,
        };
      } else {
        const { sep } = path.posix;
        const rootpath = filePath.replace(cwd + sep, '');
        let webUri = rootpath;

        // replace base proxy url
        for (const [starts, dir] of Object.entries(snowpackConfig.mount)) {
          if (rootpath.startsWith(starts)) {
            webUri = rootpath.replace(starts, dir.endsWith(sep) ? dir : `${dir}${sep}`);
            break;
          }
        }

        if (!isDev) {
          // copy file while build with snowpack
          const { out } = snowpackConfig.devOptions;
          const dest = path.posix.join(out, webUri);
          fs.copyFile(filePath, dest);
        }

        return {
          '.js': `export default "${webUri}";`,
          [fileExt]: await fs.readFile(filePath, getEncodingType(fileExt)),
        };
      }
    },
  };
}

