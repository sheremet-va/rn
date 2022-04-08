import React from 'react'
import { test, expect } from 'vitest';
import { HelloWorldApp } from './index';
import renderer from '@testing-library/react-native'

test('HelloWorldApp', () => {
    const view = renderer.render(<HelloWorldApp />)
    expect(view.getByText(/Hello/)).toBeTruthy()
    expect(view.toJSON()).toMatchInlineSnapshot(`
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