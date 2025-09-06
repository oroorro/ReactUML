import { test, expect, Request } from '@playwright/test';
import { generateUniqueId } from '../util/util';

// Extend Window interface for E2E testing
declare global {
    interface Window {
        frontendNodes?: any;
    }
}


test.describe('Batch API E2E Tests', () => {


    let pipeInChildUID: string;

    /**
     * Logs the status, ok, and JSON body of a Playwright APIResponse.
     * @param {APIResponse} response - The Playwright APIResponse object.
     */
    async function logApiResponse(response) {
        if (!response) {
            console.error('❌ No response object provided to logApiResponse');
            return;
        }
        try {
            console.log('🧾 Response status:', response.status());
            console.log('✅ OK:', response.ok());
            const jsonr = await response.json();
            console.log('📦 JSON response body:', jsonr);
        } catch (e) {
            console.error('❌ Failed to parse JSON or log response:', e);
        }
    }



    test.beforeEach(async ({ page }) => {
        // Go to login page
        await page.goto('http://localhost:8080/login');

        // Fill out login form
        await page.fill('input[name="username"]', 'test1');
        await page.fill('input[name="password"]', '123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000);

        await page.goto('http://localhost:8080/test-e2e');

        await page.waitForSelector('.Flow');
        await page.waitForTimeout(2000);

        //create node , pipe and attribute
         //create a node by right clicking 
         await page.mouse.click(500, 300, { button: 'right' });

         const contextMenu = await page.waitForSelector('div.NodeContextMenu[datatype="contextMenu"]');
 
         //node should be created on right clicked position 
         // Wait for context menu to appear
         await page.waitForSelector('.create_button');
         await page.click('.create_button');
 
         //create a Node 
         await page.waitForSelector('.create_node_button');
         await page.click('.create_node_button');
 
         //get nodeId for created Node in UI 
         const node = page.locator('.react-flow__node.react-flow__node-ReactNode.nopan.selectable');
         const nodeId = await node.getAttribute('data-id');

         //right click on created Node 
        const createdNode = await page.waitForSelector(`[data-id="${nodeId}"]`);
        const createdNodebox = await createdNode.boundingBox();

        console.log("createdNodebox here", JSON.stringify(createdNodebox, null, 2));
        if (!createdNodebox) throw new Error('Node bounding box not found');
        await page.mouse.click(createdNodebox.x + 3, createdNodebox.y + 3, { button: 'right' });
         //create a child node 
         await page.waitForSelector('.create_button');
         await page.click('.create_button');

         //create a child node 
         await page.waitForSelector('.create_node_button');
         await page.click('.create_node_button');

         const childNodeBatchResponse = await page.waitForResponse(
            response => response.url().includes('/batch') && response.request().method() === 'POST',
            { timeout: 10000 }
        );

        // Wait for the response to complete
        await childNodeBatchResponse.finished();
        const childNodeBatchData = await childNodeBatchResponse.json();

        // const childNodeUIDFromUI = childNodeBatchData.createdEntities[0].uid;
        // const pipeUIDOfchildNodeFromUI = childNodeBatchData.createdEntities[1].uid; 
        // console.log("childNodeUIDFromUI here", childNodeUIDFromUI);
        // console.log("pipeUIDOfchildNodeFromUI here", pipeUIDOfchildNodeFromUI);

        const frontendNodes = await page.evaluate(() => {
            // Access nodes through the global variable exposed by Flow component
            return (window as any).frontendNodes || null;
        });
        
         //get nodeId for created Node in UI 
         const childNode = page.locator('.childNode');


         //const childNode = page.locator(`div.react-flow__node.react-flow__node-ReactNode.nopan.selectable[data-id="${childNodeUIDFromUI}"]`);
         console.log("childNode here", JSON.stringify(childNode, null, 2));
         const childNodebox = await childNode.boundingBox();

         //console.log("childNode here", JSON.stringify(childNode, null, 2));
        //  const childNodeId = await childNode.getAttribute('data-id');
        //  const childNodebox = await childNode.boundingBox();
        //  const childNodePosition = await childNode.evaluate(el => {
        //     if (el instanceof HTMLElement) {
        //       return {
        //         x: el.offsetLeft,
        //         y: el.offsetTop,
        //         width: el.offsetWidth,
        //         height: el.offsetHeight
        //       };
        //     } else if (el instanceof SVGElement) {
        //       const rect = el.getBoundingClientRect();
        //       return {
        //         x: rect.left,
        //         y: rect.top,
        //         width: rect.width,
        //         height: rect.height
        //       };
        //     }
        //   });

        //   console.log("childNodePosition here", JSON.stringify(childNodePosition, null, 2));
        //   console.log("childNodebox here", JSON.stringify(childNodebox, null, 2));
        //  if (!childNodePosition) throw new Error('Node bounding box not found');
          if (!childNodebox) throw new Error('Node bounding box not found');

         await page.waitForTimeout(1000);

         //create a pipe in parent node
         await page.mouse.click(createdNodebox.x + 5, createdNodebox.y + 5, { button: 'right' });

         await page.waitForSelector('.create_button');
         await page.click('.create_button');

         await page.waitForSelector('.create_pipe_button');
         await page.click('.create_pipe_button');

         const batchResponse = await page.waitForResponse(
            response => response.url().includes('/batch') && response.request().method() === 'POST',
            { timeout: 10000 }
        );

        await batchResponse.finished();
         //create a attribute in parent node 
        await page.mouse.click(createdNodebox.x + 5, createdNodebox.y + 5, { button: 'right' });

        await page.waitForSelector('.create_button');
        await page.click('.create_button');

        await page.waitForSelector('.create_attribute_button');
        await page.click('.create_attribute_button');

        await page.waitForSelector('.attribute_button_sub_select_type');
        await page.click('.attribute_button_sub_select_type');

        await page.waitForSelector('button.attribute_button_sub_3rd_select_type.import');
        await page.click('button.attribute_button_sub_3rd_select_type.import');//create an attribute on Node 

        // Wait for the batch API response before checking the backend
        const batchResponseAttribute = await page.waitForResponse(
            response => response.url().includes('/batch') && response.request().method() === 'POST',
            { timeout: 10000 }
        );

        // Wait for the response to complete
        await batchResponseAttribute.finished();


         //create a pipe in child node 
         await page.mouse.click(childNodebox.x + 5, childNodebox.y + 40, { button: 'right' });

         await page.waitForSelector('.create_button');
         await page.click('.create_button');

         await page.waitForSelector('.create_pipe_button');
         await page.click('.create_pipe_button');

         const batchResponsePipeChild = await page.waitForResponse(
            response => response.url().includes('/batch') && response.request().method() === 'POST',
            { timeout: 10000 }
         );
         await batchResponsePipeChild.finished();

         let childNodeBatchDataPipe = await batchResponsePipeChild.json();

         console.log("childNodeBatchDataPipe here", JSON.stringify(childNodeBatchDataPipe, null, 2));
         pipeInChildUID = childNodeBatchDataPipe.createdEntities[1].uid;

         console.log("pipeUIDFromUI here", pipeInChildUID);



         //create a attribute in child node 
         await page.mouse.click(childNodebox.x + 5, childNodebox.y + 40, { button: 'right' });

         await page.waitForSelector('.create_button');
         await page.click('.create_button');

         await page.waitForSelector('.create_attribute_button');
         await page.click('.create_attribute_button');

         await page.waitForSelector('.attribute_button_sub_select_type');
         await page.click('.attribute_button_sub_select_type');

         await page.waitForSelector('button.attribute_button_sub_3rd_select_type.import');
         await page.click('button.attribute_button_sub_3rd_select_type.import');//create an attribute on Node 

         const batchResponseAttributeChild = await page.waitForResponse(
            response => response.url().includes('/batch') && response.request().method() === 'POST',
            { timeout: 10000 }
         );
         await batchResponseAttributeChild.finished();

    });

    test.afterEach(async ({ request }) => {
        const response = await request.delete('http://localhost:8080/test-debug/cleanup?username=test1');
        expect(response.ok()).toBeTruthy();
    });

    test('deleting pipe from propscount on top of pipe', async ({ page }) => {
      
        await page.waitForSelector('.Flow');

        //check that frontend nodes are equal to backend nodes
        const frontendNodes = await page.evaluate(() => {
            // Access nodes through the global variable exposed by Flow component
            return (window as any).frontendNodes || null;
        });
        
        const treeResponse = await page.request.get('http://localhost:8080/test-debug/tree');
        const treeData = await treeResponse.json();

        console.log("treeData here", JSON.stringify(treeData, null, 2));
       

        let dataFromBackend = treeData[0];
                     // First node of frontendNodes is the root node 
        let dataFromFrontend = frontendNodes[0].data;
        console.log("frontendNodes here", JSON.stringify(dataFromFrontend, null, 2));


        //check that backend's first child is equal to frontend's first child
        expect(dataFromBackend.uid).toBe(dataFromFrontend.id);
        //check that backend's root node's attributes is equal to frontend's root node's attributes
        expect(dataFromBackend.attributes[0].uid).toBe(dataFromFrontend.attributes[0].id);

        //check that both backend's and frontend's pipes are null
        expect(dataFromBackend.pipes.length).toBe(0);
        expect(dataFromFrontend.pipes).toBeUndefined();


        const backendGhostNode = dataFromBackend.children.find(child => child.type === 'ghost');
        const frontendGhostNode = dataFromFrontend.children.find(child => child.type === 'ghost');

        const frontendNodeChildNode = dataFromFrontend.children.filter(child => child.type != 'ghost');
        const backendNodeChildNode = dataFromBackend.children.filter(child => child.type != 'ghost');


        const frontendNodeChildNodesGhostNode = frontendNodeChildNode[0].children.find(child => child.type === 'ghost');
        const backendNodeChildNodesGhostNode = backendNodeChildNode[0].children.find(child => child.type === 'ghost');
       
     
        //check that backend's ghost node is equal to frontend's ghost node
        expect(backendGhostNode.uid).toBe(frontendGhostNode.id);


        expect(frontendNodeChildNode.uid).toBe(backendNodeChildNode.id);
        expect(frontendNodeChildNode[0].pipes[0].uid).toBe(backendNodeChildNode[0].pipes[0].id);

        //check that backend's first child's ghost node is equal to frontend's first child's ghost node
        expect(backendNodeChildNodesGhostNode.uid).toBe(frontendNodeChildNodesGhostNode.id);
        //and it's pipe is equal to frontend's first child's ghost node's pipe
        expect(backendNodeChildNodesGhostNode.pipes[0].uid).toBe(frontendNodeChildNodesGhostNode.pipes[0].id);




       
        const childPipeElement = page.locator(`.propsCount[data-id="${frontendNodeChildNodesGhostNode.id}+${pipeInChildUID}"]`);
        //get bounding box of childPipeElement
        const childPipeElementbox = await childPipeElement.boundingBox();

        if (!childPipeElementbox) throw new Error('Child pipe element bounding box not found');

        //click on childPipeElement
        await page.mouse.click(childPipeElementbox.x + 5, childPipeElementbox.y + 5, { button: 'right' });

        //click on delete button
        await page.waitForSelector('.pipe_delete_button');
        await page.click('.pipe_delete_button');

        //wait for the response
        const batchResponseDeletePipe = await page.waitForResponse(
            response => response.url().includes('/batch') && response.request().method() === 'POST',
            { timeout: 10000 }
        );

        await batchResponseDeletePipe.finished();
        await expect(childPipeElement).not.toBeVisible();


        //make sure frontend's childPipeElement is deleted


        //make sure backend's childPipeElement is deleted 

      
    });

    test('deleting pipe from pipe element', async ({ page }) => {
      
        await page.waitForSelector('.Flow');

        // const childPipeElement = page.locator(`.propsCount[data-id="${pipeInChildUID}"]`);
        // //get bounding box of childPipeElement
        // const childPipeElementbox = await childPipeElement.boundingBox();
        // console.log("childPipeElementbox here", JSON.stringify(childPipeElementbox, null, 2));
        // if (!childPipeElementbox) throw new Error('Child pipe element bounding box not found');

        // //click on childPipeElement
        // await page.mouse.click(childPipeElementbox.x + 5, childPipeElementbox.y + 5, { button: 'right' });

        // //click on delete button
        // await page.waitForSelector('.pipe_delete_button');
        // await page.click('.pipe_delete_button');

        // //wait for the response
        // const batchResponseDeletePipe = await page.waitForResponse(
        //     response => response.url().includes('/batch') && response.request().method() === 'POST',
        //     { timeout: 10000 }
        // );
        // await batchResponseDeletePipe.finished();


      
    });

});