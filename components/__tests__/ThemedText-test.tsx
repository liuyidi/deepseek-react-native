import * as React from 'react';
import renderer from 'react-test-renderer';

import { AppearanceProvider } from '@/context/AppearanceContext';

import { ThemedText } from '../ThemedText';

it(`renders correctly`, () => {
  const tree = renderer
    .create(
      <AppearanceProvider>
        <ThemedText>Snapshot test!</ThemedText>
      </AppearanceProvider>
    )
    .toJSON();

  expect(tree).toMatchSnapshot();
});
