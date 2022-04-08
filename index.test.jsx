import React from 'react'
import { test, expect } from 'vitest';
import { HelloWorldApp } from './index';
import renderer from 'react-test-renderer'

test('HelloWorldApp', () => {
    expect(renderer.create(<HelloWorldApp />).toJSON()).toMatchInlineSnapshot(`
      <View
        style={
          {
            "alignItems": "center",
            "flex": 1,
            "justifyContent": "center",
          }
        }
      >
        <RCTText
          accessible={true}
          allowFontScaling={true}
          ellipsizeMode="tail"
          isHighlighted={false}
          selectionColor={null}
        >
          Hello, world!
        </RCTText>
      </View>
    `)
})