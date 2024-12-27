import { createWithEqualityFn } from 'zustand/traditional';
import { useRef, type ReactNode } from 'react';
import { type StoreApi } from 'zustand';

export function ReactFlowProvider(){

    //const storeRef = useRef<UseBoundStoreWithEqualityFn<StoreApi<number>> | null>(null);

    const initialState = {
        nodes: [],
        edges: [],
        // Other initial states like width, height, etc.
      };
      
      // Creating the store
      const useMyStore = createWithEqualityFn(
        (set, get) => ({
          // Spread the initial state
          ...initialState,
      
          // Example action to set nodes
          setNodes: (nodes:number) => set({ nodes }),
      
          // Example action to set edges
          setEdges: (edges:number) => set({ edges }),
      
          // You can define more actions here
      
        }),
        Object.is // Equality function
      );
      
      
}
export default ReactFlowProvider;