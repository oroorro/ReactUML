import { useCallback } from "react";
import { UniqueId, ReactChild } from "../types"; 

export const useFindNodeById = () => {
  const findNodeById = useCallback(
    (nodeId: UniqueId, initialNodes: ReactChild[]): ReactChild | undefined => {
      const queue: ReactChild[] = [...initialNodes];

      while (queue.length > 0) {
        const currentNode = queue.shift(); // Dequeue the first node

        if (!currentNode) continue;

        // Check if the current node's id matches
        if (currentNode.id === nodeId) {
          return currentNode;
        }

        // Add children to the queue if they exist
        if (currentNode.children && currentNode.children.length > 0) {
          queue.push(...currentNode.children);
        }
      }

      // Return undefined if the node was not found
      return undefined;
    },
    []
  );

  return { findNodeById };
};
