// const setOptions = require("flow-remove-types/register");

// setOptions({
//   exclude: "",
// });

globalThis.jest = vi;

require("@react-native/polyfills/Object.es8");
await import("@react-native/polyfills/error-guard");

globalThis.__DEV__ = true;

// const { default: P } = await import("promise");
globalThis.Promise = Promise;
globalThis.window = globalThis;

globalThis.requestAnimationFrame = function (callback) {
  return setTimeout(callback, 0);
};
globalThis.cancelAnimationFrame = function (id) {
  clearTimeout(id);
};

globalThis.regeneratorRuntime = await import("regenerator-runtime/runtime");

const MockNativeMethods = {
  measure: jest.fn(),
  measureInWindow: jest.fn(),
  measureLayout: jest.fn(),
  setNativeProps: jest.fn(),
  focus: jest.fn(),
  blur: jest.fn(),
};

const mockComponent = async (moduleName, instanceMethods) => {
  const React = require("react");
  const RealComponent = await vi.importActual(moduleName);

  const SuperClass =
    typeof RealComponent === "function" ? RealComponent : React.Component;

  const name =
    RealComponent.displayName ||
    RealComponent.name ||
    (RealComponent.render // handle React.forwardRef
      ? RealComponent.render.displayName || RealComponent.render.name
      : "Unknown");

  const nameWithoutPrefix = name.replace(/^(RCT|RK)/, "");

  const Component = class extends SuperClass {
    static displayName = "Component";

    render() {
      const props = Object.assign({}, RealComponent.defaultProps);

      if (this.props) {
        Object.keys(this.props).forEach((prop) => {
          // We can't just assign props on top of defaultProps
          // because React treats undefined as special and different from null.
          // If a prop is specified but set to undefined it is ignored and the
          // default prop is used instead. If it is set to null, then the
          // null value overwrites the default value.
          if (this.props[prop] !== undefined) {
            props[prop] = this.props[prop];
          }
        });
      }

      return React.createElement(nameWithoutPrefix, props, this.props.children);
    }
  };

  Component.displayName = nameWithoutPrefix;

  Object.keys(RealComponent).forEach((classStatic) => {
    Component[classStatic] = RealComponent[classStatic];
  });

  if (instanceMethods != null) {
    Object.assign(Component.prototype, instanceMethods);
  }

  return Component;
};

const React = require("react");

let nativeTag = 1;

const mockNativeComponent = (viewName) => {
  const Component = class extends React.Component {
    _nativeTag = nativeTag++;

    render() {
      return React.createElement(viewName, this.props, this.props.children);
    }

    // The methods that exist on host components
    blur = jest.fn();
    focus = jest.fn();
    measure = jest.fn();
    measureInWindow = jest.fn();
    measureLayout = jest.fn();
    setNativeProps = jest.fn();
  };

  if (viewName === "RCTView") {
    Component.displayName = "View";
  } else {
    Component.displayName = viewName;
  }

  return Component;
};

jest
  .mock("react-native/Libraries/Core/InitializeCore", () => {})
  .mock("react-native/Libraries/Core/NativeExceptionsManager", () => ({
    default: {
      reportException: jest.fn(),
    },
  }))
  .mock("react-native/Libraries/ReactNative/UIManager", () => ({
    AndroidViewPager: {
      Commands: {
        setPage: jest.fn(),
        setPageWithoutAnimation: jest.fn(),
      },
    },
    blur: jest.fn(),
    createView: jest.fn(),
    customBubblingEventTypes: {},
    customDirectEventTypes: {},
    dispatchViewManagerCommand: jest.fn(),
    focus: jest.fn(),
    getViewManagerConfig: jest.fn((name) => {
      if (name === "AndroidDrawerLayout") {
        return {
          Constants: {
            DrawerPosition: {
              Left: 10,
            },
          },
        };
      }
    }),
    hasViewManagerConfig: jest.fn((name) => {
      return name === "AndroidDrawerLayout";
    }),
    measure: jest.fn(),
    manageChildren: jest.fn(),
    removeSubviewsFromContainerWithID: jest.fn(),
    replaceExistingNonRootView: jest.fn(),
    setChildren: jest.fn(),
    updateView: jest.fn(),
    AndroidDrawerLayout: {
      Constants: {
        DrawerPosition: {
          Left: 10,
        },
      },
    },
    AndroidTextInput: {
      Commands: {},
    },
    ScrollView: {
      Constants: {},
    },
    View: {
      Constants: {},
    },
  }))
  .mock("react-native/Libraries/Image/Image", () =>
    mockComponent("react-native/Libraries/Image/Image")
  )
  .mock("react-native/Libraries/Text/Text", () =>
    mockComponent("react-native/Libraries/Text/Text", MockNativeMethods)
  )
  .mock("react-native/Libraries/Components/TextInput/TextInput", () =>
    mockComponent("react-native/Libraries/Components/TextInput/TextInput", {
      ...MockNativeMethods,
      isFocused: jest.fn(),
      clear: jest.fn(),
      getNativeRef: jest.fn(),
    })
  )
  .mock("react-native/Libraries/Modal/Modal", () => {
    const baseComponent = mockComponent("react-native/Libraries/Modal/Modal");
    const mockModal = jest.requireActual("./mockModal");
    return mockModal(baseComponent);
  })
  .mock("react-native/Libraries/Components/View/View", () =>
    mockComponent(
      "react-native/Libraries/Components/View/View",
      MockNativeMethods
    )
  )
  .mock(
    "react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo",
    () => ({
      __esModule: true,
      default: {
        addEventListener: jest.fn(),
        announceForAccessibility: jest.fn(),
        isAccessibilityServiceEnabled: jest.fn(),
        isBoldTextEnabled: jest.fn(),
        isGrayscaleEnabled: jest.fn(),
        isInvertColorsEnabled: jest.fn(),
        isReduceMotionEnabled: jest.fn(),
        isReduceTransparencyEnabled: jest.fn(),
        isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
        removeEventListener: jest.fn(),
        setAccessibilityFocus: jest.fn(),
        sendAccessibilityEvent_unstable: jest.fn(),
        getRecommendedTimeoutMillis: jest.fn(),
      },
    })
  )
  .mock("react-native/Libraries/Components/RefreshControl/RefreshControl", () =>
    jest.importActual(
      "react-native/Libraries/Components/RefreshControl/__mocks__/RefreshControlMock"
    )
  )
  .mock("react-native/Libraries/Components/ScrollView/ScrollView", async () => {
    const baseComponent = mockComponent(
      "react-native/Libraries/Components/ScrollView/ScrollView",
      {
        ...MockNativeMethods,
        getScrollResponder: jest.fn(),
        getScrollableNode: jest.fn(),
        getInnerViewNode: jest.fn(),
        getInnerViewRef: jest.fn(),
        getNativeScrollRef: jest.fn(),
        scrollTo: jest.fn(),
        scrollToEnd: jest.fn(),
        flashScrollIndicators: jest.fn(),
        scrollResponderZoomTo: jest.fn(),
        scrollResponderScrollNativeHandleToKeyboard: jest.fn(),
      }
    );
    const mockScrollView = await jest.importActual(
      "react-native/jest/mockScrollView"
    );
    return mockScrollView(baseComponent);
  })
  .mock(
    "react-native/Libraries/Components/ActivityIndicator/ActivityIndicator",
    () =>
      mockComponent(
        "react-native/Libraries/Components/ActivityIndicator/ActivityIndicator"
      )
  )
  .mock(
    "react-native/Libraries/Components/TextInput/AndroidTextInputNativeComponent",
    () =>
      mockComponent(
        "react-native/Libraries/Components/TextInput/AndroidTextInputNativeComponent"
      )
  )
  .mock("react-native/Libraries/AppState/AppState", () => ({
    addEventListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
  }))
  .mock("react-native/Libraries/Linking/Linking", () => ({
    openURL: jest.fn(),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    openSettings: jest.fn(),
    addEventListener: jest.fn(),
    getInitialURL: jest.fn(() => Promise.resolve()),
    removeEventListener: jest.fn(),
    sendIntent: jest.fn(),
  }))
  // Mock modules defined by the native layer (ex: Objective-C, Java)
  .mock("react-native/Libraries/BatchedBridge/NativeModules", () => {
    return {
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
        getConstants: () => ({
          BLOB_URI_SCHEME: "content",
          BLOB_URI_HOST: null,
        }),
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
    };
  })
  .mock(
    "react-native/Libraries/NativeComponent/NativeComponentRegistry",
    () => {
      return {
        get: jest.fn((name, viewConfigProvider) => {
          return mockNativeComponent(name);
        }),
        getWithFallback_DEPRECATED: jest.fn((name, viewConfigProvider) => {
          return mockNativeComponent(name);
        }),
        setRuntimeConfigProvider: jest.fn(),
      };
    }
  )
  .mock("react-native/Libraries/ReactNative/requireNativeComponent", () => {
    return mockNativeComponent;
  })
  .mock(
    "react-native/Libraries/Utilities/verifyComponentAttributeEquivalence",
    () => function () {}
  )
  .mock("react-native/Libraries/Components/View/ViewNativeComponent", () => {
    const React = require("react");
    const Component = class extends React.Component {
      render() {
        return React.createElement("View", this.props, this.props.children);
      }
    };

    Component.displayName = "View";

    return {
      __esModule: true,
      default: Component,
    };
  });
