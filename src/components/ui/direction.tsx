'use client';

import { Direction } from 'radix-ui';
import type * as React from 'react';

type Direction = React.ComponentProps<
  typeof Direction.DirectionProvider
>['dir'];

type DirectionProviderProps = Omit<
  React.ComponentProps<typeof Direction.DirectionProvider>,
  'dir'
> & {
  dir?: Direction;
  direction?: Direction;
};

function DirectionProvider({ dir, direction, children }: DirectionProviderProps) {
  return (
    <Direction.DirectionProvider dir={direction ?? dir ?? 'ltr'}>
      {children}
    </Direction.DirectionProvider>
  );
}

const useDirection = Direction.useDirection;

export { DirectionProvider, useDirection };
