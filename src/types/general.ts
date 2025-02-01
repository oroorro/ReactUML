import type { CSSProperties, ComponentType, MemoExoticComponent, 
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent } from 'react';

import type { 
    Position,
    XYPosition, 
    Dimensions,
    XYZPosition,
    Rect,
    Box,
    Transform,
    CoordinateExtent,
    Viewport
} from './utils';

import type {
    Node, 
    NodeDimensionUpdate, 
    NodeDragItem, 
    NodeOrigin,
    NodeDragHandler,
    NodeMouseHandler,
    SelectionDragHandler,
    NodeInternals,
    NodeProps,
    WrapNodeProps,
    UniqueId, 
} from './nodes';


import type {
    Edge,
    EdgeLabelOptions,
    DefaultEdgeOptions,
    EdgeProps,
    WrapEdgeProps
} from './edges';


import type {NodeChange, EdgeChange} from './changes';
import type { D3DragEvent, Selection as D3Selection, SubjectPosition, ZoomBehavior } from 'd3';
import type { HandleType, ConnectingHandle } from './handles';

export type UnselectNodesAndEdgesParams = {
    nodes?: Node[];
    edges?: Edge[];
  };

export interface Connection {
    source: string | null;
    target: string | null;
    sourceHandle: string | null;
    targetHandle: string | null;
}

export type OnConnectStartParams = {
    nodeId: string | null;
    handleId: string | null;
    handleType: HandleType | null;
  };


export type IsValidConnection = (edge: Edge | Connection) => boolean;

export type ConnectionStatus = 'valid' | 'invalid';

export enum ConnectionMode {
  Strict = 'strict',
  Loose = 'loose',
}

export type SnapGrid = [number, number];



export type SelectionRect = Rect & {
    startX: number;
    startY: number;
};

export type FitViewOptions = {
    padding?: number;
    includeHiddenNodes?: boolean;
    minZoom?: number;
    maxZoom?: number;
    duration?: number;
    nodes?: (Partial<Node> & { id: Node['id'] })[];
  };


// on handlers   

export type OnConnect = (connection: Connection) => void;  
export type OnConnectStart = (event: ReactMouseEvent | ReactTouchEvent, params: OnConnectStartParams) => void;
export type OnConnectEnd = (event: MouseEvent | TouchEvent) => void;

export type OnNodesChange = (changes: NodeChange[]) => void;
export type OnEdgesChange = (changes: EdgeChange[]) => void;

export type OnNodesDelete = (nodes: Node[]) => void;
export type OnEdgesDelete = (edges: Edge[]) => void;

export type OnMove = (event: MouseEvent | TouchEvent, viewport: Viewport) => void;
export type OnMoveStart = OnMove;
export type OnMoveEnd = OnMove;

export type OnError = (id: string, message: string) => void;
export type OnViewportChange = (viewport: Viewport) => void;

export type OnSelectionChangeParams = {
    nodes: Node[];
    edges: Edge[];
};
  
export type OnSelectionChangeFunc = (params: OnSelectionChangeParams) => void;


export type ReactFlowActions = {
    setNodes: (nodes: Node[]) => void;
    getNodes: () => Node[];
    setEdges: (edges: Edge[]) => void;
    setDefaultNodesAndEdges: (nodes?: Node[], edges?: Edge[]) => void;
    updateNodeDimensions: (updates: NodeDimensionUpdate[]) => void;
    updateNodePositions: (nodeDragItems: NodeDragItem[] | Node[], positionChanged: boolean, dragging: boolean) => void;
    resetSelectedElements: () => void;
    unselectNodesAndEdges: (params?: UnselectNodesAndEdgesParams) => void;
    addSelectedNodes: (nodeIds: string[]) => void;
    addSelectedEdges: (edgeIds: string[]) => void;
    setMinZoom: (minZoom: number) => void;
    setMaxZoom: (maxZoom: number) => void;
    setTranslateExtent: (translateExtent: CoordinateExtent) => void;
    setNodeExtent: (nodeExtent: CoordinateExtent) => void;
    cancelConnection: () => void;
    reset: () => void;
    triggerNodeChanges: (changes: NodeChange[]) => void;
    panBy: (delta: XYPosition) => boolean;
  };


  export type ReactFlowStore = {
    rfId: string;
    width: number;
    height: number;
    transform: Transform;
    edges: Edge[];
    onNodesChange: OnNodesChange | null;
    onEdgesChange: OnEdgesChange | null;
    hasDefaultNodes: boolean;
    hasDefaultEdges: boolean;
    domNode: HTMLDivElement | null;
    paneDragging: boolean;
    noPanClassName: string;
    nodeInternals: NodeInternals;
  
    d3Zoom: ZoomBehavior<Element, unknown> | null;
    d3Selection: D3Selection<Element, unknown, null, undefined> | null;
    d3ZoomHandler: ((this: Element, event: any, d: unknown) => void) | undefined;
    minZoom: number;
    maxZoom: number;
    translateExtent: CoordinateExtent;
    nodeExtent: CoordinateExtent;
    nodeOrigin: NodeOrigin;
    nodeDragThreshold: number;
  
    nodesSelectionActive: boolean;
    userSelectionActive: boolean;
    userSelectionRect: SelectionRect | null;
  
    // @todo remove this in next major version in favor of connectionStartHandle
    connectionNodeId: string | null;
    connectionHandleId: string | null;
    connectionHandleType: HandleType | null;
    connectionPosition: XYPosition;
    connectionStatus: ConnectionStatus | null;
    connectionMode: ConnectionMode;
  
    snapToGrid: boolean;
    snapGrid: SnapGrid;
  
    nodesDraggable: boolean;
    nodesConnectable: boolean;
    nodesFocusable: boolean;
    edgesFocusable: boolean;
    edgesUpdatable: boolean;
    elementsSelectable: boolean;
    elevateNodesOnSelect: boolean;
  
    multiSelectionActive: boolean;
  
    connectionStartHandle: ConnectingHandle | null;
    connectionEndHandle: ConnectingHandle | null;
    // @todo this is only used for the click connection - we might remove this in the next major version
    connectionClickStartHandle: ConnectingHandle | null;
  
    onNodeDragStart?: NodeDragHandler;
    onNodeDrag?: NodeDragHandler;
    onNodeDragStop?: NodeDragHandler;
  
    onSelectionDragStart?: SelectionDragHandler;
    onSelectionDrag?: SelectionDragHandler;
    onSelectionDragStop?: SelectionDragHandler;
  
    onConnect?: OnConnect;
    onConnectStart?: OnConnectStart;
    onConnectEnd?: OnConnectEnd;
  
    onClickConnectStart?: OnConnectStart;
    onClickConnectEnd?: OnConnectEnd;
  
    connectOnClick: boolean;
    defaultEdgeOptions?: DefaultEdgeOptions;
  
    fitViewOnInit: boolean;
    fitViewOnInitDone: boolean;
    fitViewOnInitOptions: FitViewOptions | undefined;
  
    onNodesDelete?: OnNodesDelete;
    onEdgesDelete?: OnEdgesDelete;
    onError?: OnError;
  
    // event handlers
    onViewportChangeStart?: OnViewportChange;
    onViewportChange?: OnViewportChange;
    onViewportChangeEnd?: OnViewportChange;
  
    onSelectionChange: OnSelectionChangeFunc[];
  
    ariaLiveMessage: string;
    autoPanOnConnect: boolean;
    autoPanOnNodeDrag: boolean;
    connectionRadius: number;
  
    isValidConnection?: IsValidConnection;
    indexMap?: { [key: string]: string };
  }; 
  
  export type ReactFlowState = ReactFlowStore & ReactFlowActions;  

export interface UpdateEdgeOptions {
    shouldReplaceId?: boolean;
}


export type NodeTypes = { [key: string]: ComponentType<NodeProps> };
export type NodeTypesWrapped = { [key: string]: MemoExoticComponent<ComponentType<WrapNodeProps>> };
export type EdgeTypes = { [key: string]: ComponentType<EdgeProps> };
export type EdgeTypesWrapped = { [key: string]: MemoExoticComponent<ComponentType<WrapEdgeProps>> };


export type KeyCode = string | Array<string>;


export enum PanOnScrollMode {
  Free = 'free',
  Vertical = 'vertical',
  Horizontal = 'horizontal',
}



// ViewportHelperFunctions associates 
export type ZoomInOut = (options?: ViewportHelperFunctionOptions) => void;
export type ZoomTo = (zoomLevel: number, options?: ViewportHelperFunctionOptions) => void;
export type GetZoom = () => number;
export type GetViewport = () => Viewport;
export type SetViewport = (viewport: Viewport, options?: ViewportHelperFunctionOptions) => void;
export type SetCenter = (x: number, y: number, options?: SetCenterOptions) => void;
export type FitBounds = (bounds: Rect, options?: FitBoundsOptions) => void;
export type FitView = (fitViewOptions?: FitViewOptions) => boolean;
export type Project = (position: XYPosition) => XYPosition;

export type SetCenterOptions = ViewportHelperFunctionOptions & {
  zoom?: number;
};

export type FitBoundsOptions = ViewportHelperFunctionOptions & {
  padding?: number;
};

export type ViewportHelperFunctionOptions = {
  duration?: number;
};


export type ViewportHelperFunctions = {
  zoomIn: ZoomInOut;
  zoomOut: ZoomInOut;
  zoomTo: ZoomTo;
  getZoom: GetZoom;
  setViewport: SetViewport;
  getViewport: GetViewport;
  fitView: FitView;
  setCenter: SetCenter;
  fitBounds: FitBounds;
  project: Project;
  screenToFlowPosition: (position: XYPosition) => XYPosition;
  flowToScreenPosition: (position: XYPosition) => XYPosition;
  viewportInitialized: boolean;
};

export type PanelPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export enum SelectionMode {
  Partial = 'partial',
  Full = 'full',
}

export type UpdateNodeInternals = (nodeId: string | string[]) => void;