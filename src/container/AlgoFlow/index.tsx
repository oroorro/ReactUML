import React, { forwardRef, type CSSProperties } from 'react';
import cc from 'classcat';

import "../../style/style.css";


import type { EdgeTypes, 
    NodeOrigin, 
    NodeTypes, 
    AlgoFlowProps, 
    AlgoFlowRefType, 
    Viewport 
} from '../../types';

import { infiniteExtent } from '../../store/initialState';
import { ConnectionLineType, 
    ConnectionMode, 
    PanOnScrollMode, 
    SelectionMode 
} from '../../types';

import StoreUpdater from '../../component/StoreUpdater';
import { BezierEdge } from '../../component/Edges';
import DefaultNode from '../../component/Nodes/DefaultNode'; 


import SelectionListener from '../../component/SelectionListener';

//importing containers 
import WrapWithStore from '../WrapWithStore';
import GraphView from '../GraphView';

//importing different types of Node 
import ReactNode from '../../component/Nodes/ReactNode';

const defaultNodeTypes: NodeTypes = {
    default: DefaultNode,
    ReactNode: ReactNode,
};

const defaultEdgeTypes: EdgeTypes = {
    default: BezierEdge,
};


const initNodeOrigin: NodeOrigin = [0, 0];
const initSnapGrid: [number, number] = [15, 15];
const initDefaultViewport: Viewport = { x: 0, y: 0, zoom: 1 };

const wrapperStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 0,
};

const AlgoFlow = forwardRef<AlgoFlowRefType, AlgoFlowProps>(
    (
      {
        nodes,
        edges,
        defaultNodes,
        defaultEdges,
        className,
        nodeTypes = defaultNodeTypes,
        edgeTypes = defaultEdgeTypes,
        onNodeClick,
        onEdgeClick,
        onInit,
        onMove,
        onMoveStart,
        onMoveEnd,
        onConnect,
        onConnectStart,
        onConnectEnd,
        onClickConnectStart,
        onClickConnectEnd,
        onNodeMouseEnter,
        onNodeMouseMove,
        onNodeMouseLeave,
        onNodeContextMenu,
        onNodeDoubleClick,
        onNodeDragStart,
        onNodeDrag,
        onNodeDragStop,
        onNodesDelete,
        onEdgesDelete,
        onSelectionChange,
        onSelectionDragStart,
        onSelectionDrag,
        onSelectionDragStop,
        onSelectionContextMenu,
        onSelectionStart,
        onSelectionEnd,
        connectionMode = ConnectionMode.Strict,
        connectionLineType = ConnectionLineType.Bezier,
        connectionLineStyle,
        connectionLineComponent,
        connectionLineContainerStyle,
        deleteKeyCode = 'Backspace',
        selectionKeyCode = 'Shift',
        selectionOnDrag = false,
        selectionMode = SelectionMode.Full,
        panActivationKeyCode = 'Space',
        multiSelectionKeyCode =  'Control',
        zoomActivationKeyCode =  'Control',
        snapToGrid = false,
        snapGrid = initSnapGrid,
        onlyRenderVisibleElements = false,
        selectNodesOnDrag = true,
        nodesDraggable,
        nodesConnectable,
        nodesFocusable,
        nodeOrigin = initNodeOrigin,
        edgesFocusable,
        edgesUpdatable,
        elementsSelectable,
        defaultViewport = initDefaultViewport,
        minZoom = 0.5,
        maxZoom = 2,
        translateExtent = infiniteExtent,
        preventScrolling = true,
        nodeExtent,
        defaultMarkerColor = '#b1b1b7',
        zoomOnScroll = true,
        zoomOnPinch = true,
        panOnScroll = false,
        panOnScrollSpeed = 0.5,
        panOnScrollMode = PanOnScrollMode.Free,
        zoomOnDoubleClick = true,
        panOnDrag = true,
        onPaneClick,
        onPaneMouseEnter,
        onPaneMouseMove,
        onPaneMouseLeave,
        onPaneScroll,
        onPaneContextMenu,
        children,
        onEdgeUpdate,
        onEdgeContextMenu,
        onEdgeDoubleClick,
        onEdgeMouseEnter,
        onEdgeMouseMove,
        onEdgeMouseLeave,
        onEdgeUpdateStart,
        onEdgeUpdateEnd,
        edgeUpdaterRadius = 10,
        onNodesChange,
        onEdgesChange,
        noDragClassName = 'nodrag',
        noWheelClassName = 'nowheel',
        noPanClassName = 'nopan',
        fitView = false,
        fitViewOptions,
        connectOnClick = true,
        attributionPosition,
        defaultEdgeOptions,
        elevateNodesOnSelect = true,
        elevateEdgesOnSelect = false,
        disableKeyboardA11y = false,
        autoPanOnConnect = true,
        autoPanOnNodeDrag = true,
        connectionRadius = 20,
        isValidConnection,
        onError,
        style,
        id,
        nodeDragThreshold,
        ...rest
      },
      ref
    ) => {
      const rfId = id || '1';
  
      return (
        <div
          {...rest}
          style={{ ...style, ...wrapperStyle }}
          ref={ref}
          className={cc(['react-flow', className])}
          data-testid="rf__wrapper"
          id={id}
        >
          <WrapWithStore>
          <GraphView
            onInit={onInit}
            onMove={onMove}
            onMoveStart={onMoveStart}
            onMoveEnd={onMoveEnd}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onNodeMouseEnter={onNodeMouseEnter}
            onNodeMouseMove={onNodeMouseMove}
            onNodeMouseLeave={onNodeMouseLeave}
            onNodeContextMenu={onNodeContextMenu}
            onNodeDoubleClick={onNodeDoubleClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionLineType={connectionLineType}
            connectionLineStyle={connectionLineStyle}
            connectionLineComponent={connectionLineComponent}
            connectionLineContainerStyle={connectionLineContainerStyle}
            selectionKeyCode={selectionKeyCode}
            selectionOnDrag={selectionOnDrag}
            selectionMode={selectionMode}
            deleteKeyCode={deleteKeyCode}
            multiSelectionKeyCode={multiSelectionKeyCode}
            panActivationKeyCode={panActivationKeyCode}
            zoomActivationKeyCode={zoomActivationKeyCode}
            onlyRenderVisibleElements={onlyRenderVisibleElements}
            selectNodesOnDrag={selectNodesOnDrag}
            defaultViewport={defaultViewport}
            translateExtent={translateExtent}
            minZoom={minZoom}
            maxZoom={maxZoom}
            preventScrolling={preventScrolling}
            zoomOnScroll={zoomOnScroll}
            zoomOnPinch={zoomOnPinch}
            zoomOnDoubleClick={zoomOnDoubleClick}
            panOnScroll={panOnScroll}
            panOnScrollSpeed={panOnScrollSpeed}
            panOnScrollMode={panOnScrollMode}
            panOnDrag={panOnDrag}
            onPaneClick={onPaneClick}
            onPaneMouseEnter={onPaneMouseEnter}
            onPaneMouseMove={onPaneMouseMove}
            onPaneMouseLeave={onPaneMouseLeave}
            onPaneScroll={onPaneScroll}
            onPaneContextMenu={onPaneContextMenu}
            onSelectionContextMenu={onSelectionContextMenu}
            onSelectionStart={onSelectionStart}
            onSelectionEnd={onSelectionEnd}
            onEdgeUpdate={onEdgeUpdate}
            onEdgeContextMenu={onEdgeContextMenu}
            onEdgeDoubleClick={onEdgeDoubleClick}
            onEdgeMouseEnter={onEdgeMouseEnter}
            onEdgeMouseMove={onEdgeMouseMove}
            onEdgeMouseLeave={onEdgeMouseLeave}
            onEdgeUpdateStart={onEdgeUpdateStart}
            onEdgeUpdateEnd={onEdgeUpdateEnd}
            edgeUpdaterRadius={edgeUpdaterRadius}
            defaultMarkerColor={defaultMarkerColor}
            noDragClassName={noDragClassName}
            noWheelClassName={noWheelClassName}
            noPanClassName={noPanClassName}
            elevateEdgesOnSelect={elevateEdgesOnSelect}
            rfId={rfId}
            disableKeyboardA11y={disableKeyboardA11y}
            nodeOrigin={nodeOrigin}
            nodeExtent={nodeExtent}
          />
          <StoreUpdater
            nodes={nodes}
            edges={edges}
            defaultNodes={defaultNodes}
            defaultEdges={defaultEdges}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onClickConnectStart={onClickConnectStart}
            onClickConnectEnd={onClickConnectEnd}
            nodesDraggable={nodesDraggable}
            nodesConnectable={nodesConnectable}
            nodesFocusable={nodesFocusable}
            edgesFocusable={edgesFocusable}
            edgesUpdatable={edgesUpdatable}
            elementsSelectable={elementsSelectable}
            elevateNodesOnSelect={elevateNodesOnSelect}
            minZoom={minZoom}
            maxZoom={maxZoom}
            nodeExtent={nodeExtent}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            snapToGrid={snapToGrid}
            snapGrid={snapGrid}
            connectionMode={connectionMode}
            translateExtent={translateExtent}
            connectOnClick={connectOnClick}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView={fitView}
            fitViewOptions={fitViewOptions}
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
            onNodeDragStart={onNodeDragStart}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
            onSelectionDrag={onSelectionDrag}
            onSelectionDragStart={onSelectionDragStart}
            onSelectionDragStop={onSelectionDragStop}
            noPanClassName={noPanClassName}
            nodeOrigin={nodeOrigin}
            rfId={rfId}
            autoPanOnConnect={autoPanOnConnect}
            autoPanOnNodeDrag={autoPanOnNodeDrag}
            onError={onError}
            connectionRadius={connectionRadius}
            isValidConnection={isValidConnection}
            nodeDragThreshold={nodeDragThreshold}
          />
            <SelectionListener onSelectionChange={onSelectionChange} />
            {children}
          </WrapWithStore>
        </div>
      )
    }
)

AlgoFlow.displayName = 'AlgoFlow';

export default AlgoFlow;