const { flowPlugin } = require("@bunchtogether/vite-plugin-flow");
const react = require("@vitejs/plugin-react");
const fs = require("fs");
const { viteCommonjs } = require("@originjs/vite-plugin-commonjs");
const { resolve, join } = require("path");

module.exports = {
  plugins: [
    flowPlugin({ exclude: [], include: [/react-native/] }),
    react({ exclude: [], include: [/react-native/] }),
    {
      name: "fuck-rn",
      enforce: "pre",
      resolveId(id) {
        // so babel plugin can transform files named .js inside node_modules
        if (id.includes("react-native/") && id.endsWith(".js")) {
          return id + "x";
        }
        if (id.includes("Platform")) {
          return "/node_modules/react-native/Libraries/Utilities/Platform.android.js";
        }
      },
      transform(code, id) {
        if (id.includes("react-native/index.js") || id === "react-native") {
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
            compose += `import ${name} from '${path}';\nexport { default as ${name} } from '${path}';\n`;
            names.push(name);
          });
          compose += `\n export default { ${names.join(", ")} }`;
          return {
            code: compose,
          };
        }
        if (id.includes("UIManager.js")) {
          return {
            code: `import * as __require_for_vite_aL3LkW from "./DummyUIManager";
            import * as __require_for_vite_6fyIBo from "./UIManagerInjection";
            import * as __require_for_vite_7srx6x from "./PaperUIManager";
            const UIManager = global.RN$Bridgeless === true ? __require_for_vite_aL3LkW.default || __require_for_vite_aL3LkW : __require_for_vite_6fyIBo.default || __require_for_vite_6fyIBo.default.unstable_UIManager || __require_for_vite_7srx6x.default || __require_for_vite_7srx6x;
            module.exports = UIManager`,
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
        if (id.includes("BatchedBridge/NativeModules")) {
          return `
          export default {
            AlertManager: {
              alertWithArgs: jest.fn(),
            },
            AsyncLocalStorage: {
              multiGet: jest.fn((keys, callback) =>
                process.nextTick(() => callback(null, []))
              ),
              multiSet: jest.fn((entries, callback) =>
                process.nextTick(() => callback(null))
              ),
              multiRemove: jest.fn((keys, callback) =>
                process.nextTick(() => callback(null))
              ),
              multiMerge: jest.fn((entries, callback) =>
                process.nextTick(() => callback(null))
              ),
              clear: jest.fn((callback) => process.nextTick(() => callback(null))),
              getAllKeys: jest.fn((callback) =>
                process.nextTick(() => callback(null, []))
              ),
            },
            Clipboard: {
              getString: jest.fn(() => ""),
              setString: jest.fn(),
            },
            DeviceInfo: {
              getConstants() {
                return {
                  Dimensions: {
                    window: {
                      fontScale: 2,
                      height: 1334,
                      scale: 2,
                      width: 750,
                    },
                    screen: {
                      fontScale: 2,
                      height: 1334,
                      scale: 2,
                      width: 750,
                    },
                  },
                };
              },
            },
            DevSettings: {
              addMenuItem: jest.fn(),
              reload: jest.fn(),
            },
            ImageLoader: {
              getSize: jest.fn((url) => Promise.resolve({ width: 320, height: 240 })),
              prefetchImage: jest.fn(),
            },
            ImageViewManager: {
              getSize: jest.fn((uri, success) =>
                process.nextTick(() => success(320, 240))
              ),
              prefetchImage: jest.fn(),
            },
            KeyboardObserver: {
              addListener: jest.fn(),
              removeListeners: jest.fn(),
            },
            Networking: {
              sendRequest: jest.fn(),
              abortRequest: jest.fn(),
              addListener: jest.fn(),
              removeListeners: jest.fn(),
            },
            PlatformConstants: {
              getConstants() {
                return {};
              },
            },
            PushNotificationManager: {
              presentLocalNotification: jest.fn(),
              scheduleLocalNotification: jest.fn(),
              cancelAllLocalNotifications: jest.fn(),
              removeAllDeliveredNotifications: jest.fn(),
              getDeliveredNotifications: jest.fn((callback) =>
                process.nextTick(() => [])
              ),
              removeDeliveredNotifications: jest.fn(),
              setApplicationIconBadgeNumber: jest.fn(),
              getApplicationIconBadgeNumber: jest.fn((callback) =>
                process.nextTick(() => callback(0))
              ),
              cancelLocalNotifications: jest.fn(),
              getScheduledLocalNotifications: jest.fn((callback) =>
                process.nextTick(() => callback())
              ),
              requestPermissions: jest.fn(() =>
                Promise.resolve({ alert: true, badge: true, sound: true })
              ),
              abandonPermissions: jest.fn(),
              checkPermissions: jest.fn((callback) =>
                process.nextTick(() =>
                  callback({ alert: true, badge: true, sound: true })
                )
              ),
              getInitialNotification: jest.fn(() => Promise.resolve(null)),
              addListener: jest.fn(),
              removeListeners: jest.fn(),
            },
            SourceCode: {
              getConstants() {
                return {
                  scriptURL: null,
                };
              },
            },
            StatusBarManager: {
              setColor: jest.fn(),
              setStyle: jest.fn(),
              setHidden: jest.fn(),
              setNetworkActivityIndicatorVisible: jest.fn(),
              setBackgroundColor: jest.fn(),
              setTranslucent: jest.fn(),
              getConstants: () => ({
                HEIGHT: 42,
              }),
            },
            Timing: {
              createTimer: jest.fn(),
              deleteTimer: jest.fn(),
            },
            UIManager: {},
            BlobModule: {
              getConstants: () => ({ BLOB_URI_SCHEME: "content", BLOB_URI_HOST: null }),
              addNetworkingHandler: jest.fn(),
              enableBlobSupport: jest.fn(),
              disableBlobSupport: jest.fn(),
              createFromParts: jest.fn(),
              sendBlob: jest.fn(),
              release: jest.fn(),
            },
            WebSocketModule: {
              connect: jest.fn(),
              send: jest.fn(),
              sendBinary: jest.fn(),
              ping: jest.fn(),
              close: jest.fn(),
              addListener: jest.fn(),
              removeListeners: jest.fn(),
            },
            I18nManager: {
              allowRTL: jest.fn(),
              forceRTL: jest.fn(),
              swapLeftAndRightInRTL: jest.fn(),
              getConstants: () => ({
                isRTL: false,
                doLeftAndRightSwapInRTL: true,
              }),
            },
          }
          `;
        }
        if (id.includes("symbolicateStackTrace")) {
          return {
            code: code.replace("??", "||"),
          };
        }
        if (id.includes("Core/NativeExceptionsManager")) {
          return {
            code: `
            export default { reportException: jest.fn() }`,
          };
        }
        if (id.includes("InitializeCore")) {
          return { code: "" };
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
    setupFiles: ["setup.js"],
    globals: true,
    deps: {
      inline: [/react-native/, /react-test-renderer/],
    },
  },
};
