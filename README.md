# snowpack-plugin-inliner
A plugin for snowpack which transforms files into base64 URIs.

## Usage

### Install
```bash
npm install --save-dev snowpack-plugin-inliner
```

### Configuration
add this plugin to your Snowpack config:  

#### Commonly
**snowpack.config.json**
```json
{
  "plugins": [
    ["snowpack-plugin-inliner"]
  ]
}
```

#### Custom
**snowpack.config.js**
```javascript
module.exports = {
  "plugins": [
    ["snowpack-plugin-inliner", {
      "exts": ["jpg", "png"], // only "jpg" & "png" will be inlined with
      "limit": 66666, // set maximum of file size: 66666 bytes
    }],
  ],
};
```

## Options

|             Name              |            Type             |                 Default                    | Description                                                                         |
| :---------------------------: | :-------------------------: | :----------------------------------------: | :---------------------------------------------------------------------------------- |
|          **`exts`**           |       `Array<string>`       |       `["jpg","jpeg","png","svg"]`         | Specifying the extensions of a file will be inlined with.                           |
|          **`limit`**          | `boolean | number | string` |                 `10240`                    | Specifying the maximum size of a file in bytes.                                     |
|          **`encoding`**       |          `string`           |                 `base64`                   | Specify the encoding which the file will be inlined with.                           |


