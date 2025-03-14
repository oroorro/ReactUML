import React, { useContext } from 'react';
import type { FC, PropsWithChildren } from 'react';

import StoreContext from '../../contexts/StoreContext';
import ReactFlowProvider from '../../component/ReactFlowProvider';

const WrapWithStore: FC<PropsWithChildren<unknown>> = ({ children }) => {
  const isWrapped = useContext(StoreContext);

  if (isWrapped) {
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/18051
    return <>{children}</>;
  }

  return <ReactFlowProvider>{children}</ReactFlowProvider>;
};

WrapWithStore.displayName = 'AlgoFlowWrapWithStore';

export default WrapWithStore;