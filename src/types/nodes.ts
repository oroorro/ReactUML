import type { Position,
    XYPosition, 
} from './utils';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
import { internalsSymbol } from '../utils';

import type {HandleElement, CoordinateExtent } from '.';

export type NodeMouseHandler = (event: ReactMouseEvent, node: Node) => void;
export type NodeDragHandler = (event: ReactMouseEvent, node: Node, nodes: Node[]) => void;
export type SelectionDragHandler = (event: ReactMouseEvent, nodes: Node[]) => void;


export type NodeInternals = Map<string, Node>;

export type Node<T = any, U extends string | undefined = string | undefined> = {
    id: string;
    position: XYPosition;
    data: T;
    type?: U;
    style?: CSSProperties;
    className?: string;
    sourcePosition?: Position;
    targetPosition?: Position;
    hidden?: boolean;
    selected?: boolean;
    dragging?: boolean;
    draggable?: boolean;
    selectable?: boolean;
    connectable?: boolean;
    deletable?: boolean;
    dragHandle?: string;
    width?: number | null;
    height?: number | null;
    parentId?: string;
    zIndex?: number;
    extent?: 'parent' | CoordinateExtent;
    expandParent?: boolean;
    positionAbsolute?: XYPosition;
    ariaLabel?: string;
    focusable?: boolean;
    resizing?: boolean;

    children?: ReactChild[];
    
    [internalsSymbol]?: {
        z?: number;
        handleBounds?: NodeHandleBounds;
        isParent?: boolean;
    };
};

export type WrapNodeProps<T = any> = Pick<
  Node<T>,
  'id' | 'data' | 'style' | 
  'className' | 'dragHandle' | 
  'sourcePosition' | 'targetPosition' | 
  'hidden' | 'ariaLabel' | 'children'
> &
  Required<Pick<Node<T>, 'selected' | 'type' | 'zIndex'>> & {
    isConnectable: boolean;
    xPos: number;
    yPos: number;
    xPosOrigin: number;
    yPosOrigin: number;
    initialized: boolean;
    isSelectable: boolean;
    isDraggable: boolean;
    isFocusable: boolean;
    selectNodesOnDrag: boolean;
    onClick?: NodeMouseHandler;
    onDoubleClick?: NodeMouseHandler;
    onMouseEnter?: NodeMouseHandler;
    onMouseMove?: NodeMouseHandler;
    onMouseLeave?: NodeMouseHandler;
    onContextMenu?: NodeMouseHandler;
    resizeObserver: ResizeObserver | null;
    isParent: boolean;
    noDragClassName: string;
    noPanClassName: string;
    rfId: string;
    disableKeyboardA11y: boolean;
    hasHandleBounds: boolean;
  };

// props that get passed to a custom node
export type NodeProps<T = any> = Pick<
  WrapNodeProps<T>,
  'id' | 'data' | 'dragHandle' | 'type' | 'selected' | 'isConnectable' | 'xPos' | 'yPos' | 'zIndex' | 'children'
> & {
  dragging: boolean;
  targetPosition?: Position;
  sourcePosition?: Position;
  //children?: ReactChild[]; // Include children
  color?: string; // Include color
  title?: string; // Include title
  isPropsInboundShared?: boolean;
};


export type NodeHandleBounds = {
    source: HandleElement[] | null;
    target: HandleElement[] | null;
  };

export type NodeDimensionUpdate = {
    id: string;
    nodeElement: HTMLDivElement;
    forceUpdate?: boolean;
};

export type NodeDragItem = {
    id: string;
    position: XYPosition;
    positionAbsolute: XYPosition;
    // distance from the mouse cursor to the node when start dragging
    distance: XYPosition;
    width?: number | null;
    height?: number | null;
    extent?: 'parent' | CoordinateExtent;
    parentNode?: string;
    parentId?: string;
    dragging?: boolean;
    expandParent?: boolean;
  };

export type NodeOrigin = [number, number];


//ReactNode
// export type ReactNodeProps<T = any> = Pick<WrapNodeProps<T>,
// 'id' | 'dragHandle' | 'type' | 'selected' | 'isConnectable' | 'xPos' | 'yPos' | 'zIndex'
// > & {
//   dragging: boolean; 
//   children: ReactChild[], //nested array 
//   color: string,
//   title: string, 
//   isPropsInboundShared: boolean,
//   type: string,
// };

export type ReactChild = {
  title: string,
  numbersOfPropsGoingIn: number,
  color: string,
  pipes: Pipe[],
  attributes: Attribute[],
  children?: ReactChild[], 
  muteAll?: boolean,
}

export type Pipe = {
  color: string,
  numbersOfProps: number // number of props that is associated with current pipe color
  name?: string //name of prop that is associated with current pipe color
  id: string //unique id that each pipe has 
  props: AttributeContent[], //will be using AttributeContent type since, it has all of necessary data type, we may change the name of AttributeContent in the future 
  //props = {name:string, type:string, belongsTo:string }
  mute?: boolean,
}

export type ReactNodeType = {

}

export type Attribute = {
  nameOfAttribute: string, // can be Hook, var, function, reactInbuilt (API, Hook), import, export 
  totalNumberOfAttribute: number,
  AttributeContents: AttributeContent[] | ReactInBuiltAttributeContent[],
  mute?: boolean,
}

export type AttributeContent = {
  name: string, 
  type?: string, // type of the attribute 
  belongsTo: string, //id of Node that created props for the first time 
}

export type ReactInBuiltAttributeContent = {
  typeOfReactInbuilt: string, //can be useEffect, useRef(Hook), cache(API) ... 
  reactInbuiltAttributes: ReactInbuiltAttributes[], //ex for useEffect)name of useEffect would be showing dependecny array [var1, array2],
}                                                   //type would be [var1:string, array2:number[]]

type ReactInbuiltAttributes = {
  name: string,
  type?: string,
  belongsTo: string //id of Node that created props for the first time 
}