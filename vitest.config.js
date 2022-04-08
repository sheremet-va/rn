const { flowPlugin } = require("@bunchtogether/vite-plugin-flow");
const react = require("@vitejs/plugin-react");
const fs = require("fs");
const { viteCommonjs } = require("@originjs/vite-plugin-commonjs");
const { resolve, join, dirname } = require("path");
const { defineConfig } = require("vite");

module.exports = defineConfig({
  plugins: [
    flowPlugin({ exclude: [], include: [/react-native/] }),
    react({ exclude: [], include: [/react-native/] }),
    {
      name: "fuck-rn",
      enforce: "pre",
      async resolveId(id, importer) {
        // so babel plugin can transform files named .js inside node_modules
        if (id.includes("react-native/") && id.endsWith(".js")) {
          return id + "x";
        }
        // if (id.includes("Platform")) {
        //   return "/node_modules/react-native/Libraries/Utilities/Platform.android.js";
        // }
        // if (id.includes("legacySendAccessibilityEvent")) {
        //   return "/node_modules/react-native/Libraries/Components/AccessibilityInfo/legacySendAccessibilityEvent.android.js";
        // }
        if (importer?.includes("react-native/")) {
          importer = importer.replace(/\.jsx$/, ".js");
          const resolved = await this.resolve(id, importer, {
            skipSelf: true,
          });
          if (resolved) return;
          const jsPath = resolve(dirname(importer), id);
          if (fs.existsSync(jsPath + ".android.js")) {
            return jsPath + ".android.jsx";
          }
        }
      },
      transform(code, id) {
        if (id.includes("react-native/index.js") || id === "react-native") {
          const matches = [
            ...code.matchAll(/return\s*require\('([\w\\/.]+)'\);/g),
          ];
          let compose = "";
          let names = [];
          matches.forEach(([, path]) => {
            const name = path.split("/").pop();
            compose += `import ${name} from '${path}';\nexport { default as ${name} } from '${path}';\n`;
            names.push(name);
          });
          const namedMatches = [
            ...code.matchAll(/require\('([\w\\/.]+)'\)\s*\.([\w]+)/g),
          ];
          namedMatches.forEach(([, path, name]) => {
            if (name === "default") {
              name = path.split("/").pop();
              compose += `import ${name} from '${path}';\nexport { default as ${name} } from '${path}';\n`;
            } else {
              compose += `import { ${name} } from '${path}';\nexport { ${name} } from '${path}';\n`;
            }
            names.push(name);
          });
          compose += `\nexport default { ${names.join(", ")} }`;
          // console.log(compose);
          // return {
          //   code: compose,
          // };

          return {
            code: `
          export { default as View } from './Libraries/Components/View/View';
          export { default as Text } from './Libraries/Text/Text';
          export { default as Platform } from './Libraries/Utilities/Platform.android.js';
                      `,
          };
        }
        if (id.includes("ReactNativePrivateInterface")) {
          const matches = [...code.matchAll(/require\('([\w\\/.]+)'\)/g)];
          let compose = "";
          let names = [];
          matches.forEach(([, path]) => {
            const name = path.split("/").pop();
            // compose += `import ${name} from '${path}';\nexport { default as ${name} } from '${path}';\n`;
            names.push(name);
          });
          compose += `
          const [${names.map(
            (name) => `{ default: ${name} }`
          )}] = await Promise.all([
            ${matches.map(([, path]) => `import('${path}')`).join(",\n")}
          ]
          );
          `;
          compose += `export { ${names.join(", ")} }`;
          compose += `\n export default { ${names.join(", ")} }`;
          return {
            code: compose,
          };
        }
        if (id.includes("createReactNativeComponentClass")) {
          return {
            code: code.replace(
              "import { ReactNativeViewConfigRegistry } from 'react-native/Libraries/ReactPrivate/ReactNativePrivateInterface';",
              "import ReactNativeViewConfigRegistry from './ReactNativeViewConfigRegistry';"
            ),
          };
        }
        if (id.includes("symbolicateStackTrace")) {
          return {
            code: code.replace("??", "||"),
          };
        }
        if (id.includes("ReactNativeViewViewConfig")) {
          return {
            code: code.replace(
              `import { Platform } from 'react-native'`,
              `import Platform from '../../Utilities/Platform.android.js'`
            ),
          };
        }
      },
      load(id) {
        if (id.includes("react-native/") && id.endsWith("jsx")) {
          if (!id.includes(__dirname)) {
            id = join(__dirname, id);
          }
          if (id.startsWith("/@fs")) {
            id = id.slice(4);
          }
          id = id.replace(/x$/, "");
          return fs.readFileSync(id, "utf8");
        }
      },
    },
    viteCommonjs({ include: ["react-native"], exclude: [] }),
  ],
  test: {
    setupFiles: ["setup.jsx"],
    globals: true,
    deps: {
      inline: [/react-native/, /react-test-renderer/],
    },
  },
});
