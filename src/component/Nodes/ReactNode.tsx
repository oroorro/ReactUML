
import React, { memo } from 'react';

import Handle from '../../component/Handle';
import { Position } from '../../types';
import type { NodeProps } from '../../types';

const ReactNode = ({
  data,
  isConnectable,
  
}: NodeProps) => {
  return (
    <>
     
      {data?.label}
      
    </>
  );
};

ReactNode.displayName = 'ReactNode';

export default memo(ReactNode);