import { createWithEqualityFn } from 'zustand/traditional';

// Example initial state and actions
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
    setNodes: (nodes) =>{ 
        set({ nodes })
        console.log('Updated nodes:', nodes, typeof(createWithEqualityFn), createWithEqualityFn);
    },

    // Example action to set edges
    setEdges: (edges) => set({ edges }),

    getNodes: () => {
        const {nodes, setNodes} = get();
        const node = get();
        return node;
    }

  }),
  Object.is // Equality function
);

export default useMyStore;
