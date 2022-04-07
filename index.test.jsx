import React from 'react'
import { test } from 'vitest';
import { HelloWorldApp } from './index';
import renderer from 'react-test-renderer'

test('HelloWorldApp', () => {
    console.log(renderer.create(<HelloWorldApp />).toJSON())
})