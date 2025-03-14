
import type { CSSProperties, ComponentType, HTMLAttributes, ReactNode, MouseEvent as ReactMouseEvent } from 'react';



import { ConnectionStatus, Position } from '.';
import type { Connection, HandleElement, HandleType, Node } from '.';

export type EdgeLabelOptions = {
    label?: string | ReactNode;
    labelStyle?: CSSProperties;
    labelShowBg?: boolean;
    labelBgStyle?: CSSProperties;
    labelBgPadding?: [number, number];
    labelBgBorderRadius?: number;
  };

export type DefaultEdgeOptions = Omit<
  Edge,
  'id' | 'source' | 'target' | 'sourceHandle' | 'targetHandle' | 'sourceNode' | 'targetNode'
>;  

export enum MarkerType {
    Arrow = 'arrow',
    ArrowClosed = 'arrowclosed',
  }


  export type EdgeMarker = {
    type: MarkerType;
    color?: string;
    width?: number;
    height?: number;
    markerUnits?: string;
    orient?: string;
    strokeWidth?: number;
  };
  
  export type EdgeMarkerType = string | EdgeMarker;

  type DefaultEdge<T = any> = {
    id: string;
    type?: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    style?: CSSProperties;
    animated?: boolean;
    hidden?: boolean;
    deletable?: boolean;
    data?: T;
    className?: string;
    sourceNode?: Node;
    targetNode?: Node;
    selected?: boolean;
    markerStart?: EdgeMarkerType;
    markerEnd?: EdgeMarkerType;
    zIndex?: number;
    ariaLabel?: string;
    interactionWidth?: number;
    focusable?: boolean;
    updatable?: boolean;
  } & EdgeLabelOptions;;


export type Edge<T = any> = DefaultEdge<T>;

export type EdgeMouseHandler = (event: ReactMouseEvent, edge: Edge) => void;
export type OnEdgeUpdateFunc<T = any> = (oldEdge: Edge<T>, newConnection: Connection) => void;
export type EdgeUpdatable = boolean | HandleType;
export type BezierPathOptions = {
  curvature?: number;
};
export type SmoothStepPathOptions = {
  offset?: number;
  borderRadius?: number;
};

export type WrapEdgeProps<T = any> = Omit<Edge<T>, 'sourceHandle' | 'targetHandle'> & {
  onClick?: EdgeMouseHandler;
  onEdgeDoubleClick?: EdgeMouseHandler;
  sourceHandleId?: string | null;
  targetHandleId?: string | null;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  elementsSelectable?: boolean;
  onEdgeUpdate?: OnEdgeUpdateFunc;
  onContextMenu?: EdgeMouseHandler;
  onMouseEnter?: EdgeMouseHandler;
  onMouseMove?: EdgeMouseHandler;
  onMouseLeave?: EdgeMouseHandler;
  edgeUpdaterRadius?: number;
  onEdgeUpdateStart?: (event: ReactMouseEvent, edge: Edge, handleType: HandleType) => void;
  onEdgeUpdateEnd?: (event: MouseEvent | TouchEvent, edge: Edge, handleType: HandleType) => void;
  rfId?: string;
  isFocusable: boolean;
  isUpdatable: EdgeUpdatable;
  pathOptions?: BezierPathOptions | SmoothStepPathOptions;
  disableKeyboardA11y?: boolean;
};



export type EdgeProps<T = any> = Pick<
  Edge<T>,
  'id' | 'animated' | 'data' | 'style' | 'selected' | 'source' | 'target'
> &
  Pick<
    WrapEdgeProps,
    | 'sourceX'
    | 'sourceY'
    | 'targetX'
    | 'targetY'
    | 'sourcePosition'
    | 'targetPosition'
    | 'sourceHandleId'
    | 'targetHandleId'
    | 'interactionWidth'
  > &
  EdgeLabelOptions & {
    markerStart?: string;
    markerEnd?: string;
    // @TODO: how can we get better types for pathOptions?
    pathOptions?: any;
  };


export enum ConnectionLineType {
    Bezier = 'default',
    Straight = 'straight',
    Step = 'step',
    SmoothStep = 'smoothstep',
    SimpleBezier = 'simplebezier',
}  

export type ConnectionLineComponentProps = {
  connectionLineStyle?: CSSProperties;
  connectionLineType: ConnectionLineType;
  fromNode?: Node;
  fromHandle?: HandleElement;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromPosition: Position;
  toPosition: Position;
  connectionStatus: ConnectionStatus | null;
};

export type ConnectionLineComponent = ComponentType<ConnectionLineComponentProps>;




// edge text associates 

export type EdgeTextProps = HTMLAttributes<SVGElement> &
  EdgeLabelOptions & {
    x: number;
    y: number;
};

export type BaseEdgeProps = Pick<EdgeProps, 'style' | 'markerStart' | 'markerEnd' | 'interactionWidth'> &
  EdgeLabelOptions & {
    id?: string;
    labelX?: number;
    labelY?: number;
    path: string;
  };

  export type BezierEdgeProps<T = any> = EdgeProps<T> & {
    pathOptions?: BezierPathOptions;
  };  
