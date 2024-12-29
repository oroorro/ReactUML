
import React, { memo } from 'react';

import Handle from '../../component/Handle';
import { Position } from '../../types';
import type { NodeProps, ReactChild } from '../../types';

const ReactNode = ({
  isConnectable,
  data,
  
}: NodeProps) => {

    const {children, title} = data;
    // Recursive function to render children
  const renderChildren = (children: ReactChild[] | undefined, level: number): JSX.Element | null => {
    if (!children || children.length === 0) {
      return null;
    }

    return (
        <div>
        {children.map((child, index) => (
          <div key={index} style={{ paddingLeft: `${level * 20}px` }}>
            <h4>{child.title}</h4>
            <p>Props Going In: {child.numbersOfPropsGoingIn}</p>
            {child.pipes.map((pipe, i) => (
              <p key={i}>
                Pipe Color: {pipe.color}, Props: {pipe.numbersOfProps}
              </p>
            ))}
            {renderChildren(child.children, level + 1)}
          </div>
        ))}
        </div>
    );
  };

  console.log("children", children, "title", title);

  return (
    <div>
      <h3>React Node</h3>
      {renderChildren(children, 0)}
    </div>
  );
};

ReactNode.displayName = 'ReactNode';

export default memo(ReactNode);