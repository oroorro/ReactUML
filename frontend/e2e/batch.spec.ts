import { test, expect, Request } from '@playwright/test';
import { generateUniqueId } from '../util/util';

// Extend Window interface for E2E testing
declare global {
    interface Window {
        frontendNodes?: any;
    }
}

test.describe('Batch API E2E Tests', () => {


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

    });

    test.afterEach(async ({ request }) => {
        const response = await request.delete('http://localhost:8080/test-debug/cleanup?username=test1');
        expect(response.ok()).toBeTruthy();
    });

    test('✅ Should create node with valid input', async ({ page }) => {

        // Should be redirected to frontend after login
        await page.waitForURL('http://localhost:8080/');

        await page.waitForSelector('.Flow');
        await page.waitForTimeout(2000);
        // Simulate context menu trigger
        //await page.click('.Flow',{ button: 'right' }); 
        // 3. Wait for context menu to appear (adjust selector to match your HTML)
        // Get bounding box of the node you want to avoid
        const nodeBox = await page.locator('.react-flow__node.react-flow__node-ReactNode').boundingBox();
        const flowBox = await page.locator('.Flow').boundingBox();

        if (nodeBox && flowBox) {
            // Choose a point inside .Flow but outside the node box
            let clickX = flowBox.x + nodeBox.width;
            let clickY = flowBox.y + 20;

            // Make sure it doesn’t overlap the node
            if (
                clickX > nodeBox.x &&
                clickX < nodeBox.x + nodeBox.width &&
                clickY > nodeBox.y &&
                clickY < nodeBox.y + nodeBox.height
            ) {
                // Move to an area just below the node
                clickY = nodeBox.y + nodeBox.height;
            }

            await page.mouse.click(clickX, clickY, { button: 'right' });

        }
        await page.waitForSelector('.create_button', { timeout: 2000 });
        await page.click('.create_button'); // Assuming it appears

        await page.waitForSelector('.create_node_button', { timeout: 2000 });
        await page.click('.create_node_button'); // Assuming it appears

        page.on('request', req => console.log('➡️', req.method(), req.url()));

        // Wait for response and assert
        const response = await page.waitForResponse(resp =>
            resp.url() === 'http://localhost:8080/batch' && resp.request().method() === 'POST',
            { timeout: 5000 }
        );

        expect(response.ok()).toBeTruthy();
        const json = await response.json();
        expect(json.success).toBeTruthy();
    });

    test('❌ Should show error for invalid node creation (missing uid)', async ({ page }) => {

        // Should be redirected to frontend after login
        await page.waitForURL('http://localhost:8080/');

        await page.waitForSelector('.Flow');
        await page.waitForTimeout(2000);

        // Manually fire invalid request to simulate user sending bad data
        const response = await page.request.post('http://localhost:8080/batch', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                created: {
                    nodes: [
                        {
                            name: 'No UID Node',
                            isStartingNode: true
                        }
                    ],
                    pipes: [],
                    attributes: [],
                    attributeContents: []
                },
                updated: null,
                deleted: null
            }
        });

        expect(response.status()).toBe(500);
        const json = await response.json();
        expect(json.error).toContain('uid must not be null');
    });

    //test 
    test('create child Node', async ({ page }) => {

        // Should be redirected to frontend after login
        await page.waitForURL('http://localhost:8080/');

        const nodeId = generateUniqueId();
        // 3. Wait for 2 seconds
        await page.waitForTimeout(2000);

        // 4. Wait for Flow to appear
        await page.waitForSelector('.Flow');

        // 5. Click on a node (ReactNode) from pre-existing Node with data-id='1qlx7vx-jj26d3'
        const node = await page.waitForSelector('[data-id="1qlx7vx-jj26d3"]');
        const box = await node.boundingBox();
        if (!box) throw new Error('Node bounding box not found');
        await page.mouse.click(box.x + 3, box.y + 3, { button: 'right' });

        // 6. Wait for create button
        await page.waitForSelector('.create_button');
        await page.click('.create_button');

        // 7. Wait for and click on "create node" button
        await page.waitForSelector('.create_node_button');
        await page.click('.create_node_button');


        // 9. Send POST request to /batch with child node payload
        const response = await page.request.post('http://localhost:8080/batch', {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                created: {
                    nodes: [
                        {
                            uid: nodeId,
                            name: 'Child Node',
                            isStartingNode: false,
                            parentId: '1qlx7vx-jj26d3',
                        },
                    ],
                    pipes: [],
                    attributes: [],
                    attributeContents: [],
                },
            },
        });

        // 10. Assert success



        expect(response.ok()).toBeTruthy();
        const json = await response.json();
        expect(json.success).toBeTruthy();
        const parent = await page.waitForSelector('[data-id="1qlx7vx-jj26d3"]');
        // Search inside the parent for the exact child node by data-id
        const child = await parent.$(`[data-id=${nodeId}]`);

        // Assert the child exists under the parent
        expect(child).not.toBeNull();


    });


    test('✅ 2. Add attribute to existing node', async ({ page }) => {

        // Should be redirected to frontend after login
        await page.waitForURL('http://localhost:8080/');

        await page.waitForTimeout(2000);
        await page.waitForSelector('.Flow');

        // 2. Click on the node with data-id="1qlx7vx-99k6j3"
        const node = await page.waitForSelector('[data-id="1qlx7vx-99k6j3"]');
        const box = await node.boundingBox();
        if (!box) throw new Error('Node bounding box not found');
        await page.mouse.click(box.x + 3, box.y + 3, { button: 'right' });


        // 11. Get node ID from context menu
        const contextMenu = await page.waitForSelector('div.NodeContextMenu[datatype="contextMenu"]');
        const nodeId = await contextMenu.getAttribute('id');
        console.log("nodeId: ", nodeId)
        expect(nodeId).toBeTruthy();

        // 3–4. Wait for context menu to appear
        await page.waitForSelector('.create_button');
        await page.click('.create_button');

        // 5–6. Create attribute menu
        await page.waitForSelector('.create_attribute_button');
        await page.click('.create_attribute_button');

        // 7–8. Select attribute type
        await page.waitForSelector('.attribute_button_sub_select_type');
        await page.click('.attribute_button_sub_select_type');

        // 9–10. Select 3rd level type: import
        await page.waitForSelector('button.attribute_button_sub_3rd_select_type.import');
        await page.click('button.attribute_button_sub_3rd_select_type.import');

        // 12. Send CreateAttributeDto request
        const response = await page.request.post('http://localhost:8080/batch', {
            headers: { 'Content-Type': 'application/json' },
            data: {
                created: {
                    nodes: [],
                    pipes: [],
                    attributes: [
                        {
                            uid: generateUniqueId(),
                            name: 'import',
                            node: {
                                uid: nodeId,
                            },
                        },
                    ],
                    attributeContents: [],
                },
                updated: null,
                deleted: null,
            },
        });
        logApiResponse(response);

        expect(response.ok()).toBeTruthy();
        const json = await response.json();
        expect(json.success).toBeTruthy();

        await page.mouse.click(box.x + 3, box.y + 3, { button: 'right' });

        // 4. Wait and click "create_button"
        await page.waitForSelector('.create_button');
        await page.click('.create_button');

        // 5. Wait and click "create_pipe_button"
        await page.waitForSelector('.create_pipe_button');
        await page.click('.create_pipe_button');

        // 6. Prepare CreatePipeDto
        const pipeData = {
            uid: generateUniqueId(),
            name: 'Auto Pipe',
            sourceNode: { uid: nodeId },
            targetNode: null, // Optional if not set yet
        };

        // 7. Send to /batch
        const responsepipe = await page.request.post('http://localhost:8080/batch', {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                created: {
                    nodes: [],
                    pipes: [pipeData],
                    attributes: [],
                    attributeContents: [],
                },
                updated: null,
                deleted: null,
            },
        });

        // 8. Validate response
        logApiResponse(responsepipe);
        expect(responsepipe.ok()).toBeTruthy();
        const jsonPipe = await responsepipe.json();
        console.log('Response JSON:', jsonPipe);
        expect(jsonPipe.success).toBeTruthy();
    });


    test('creating Node in the backgroun', async ({ page }) => {
        await page.goto('http://localhost:8080/test-e2e');
        // Should be redirected to frontend after login
        await page.waitForURL('http://localhost:8080/test-e2e');
        await page.waitForTimeout(2000);
        await page.waitForSelector('.Flow');
        //start on background
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

        // Wait for the batch API response before checking the backend
        const batchResponse1 = await page.waitForResponse(
            response => response.url().includes('/batch') && response.request().method() === 'POST',
            { timeout: 10000 }
        );

        // Wait for the response to complete
        await batchResponse1.finished();

        //check for created Node in UI 
        const node = page.locator('.react-flow__node.react-flow__node-ReactNode.nopan.selectable');
        await expect(node).toBeVisible();
        const nodeId = await node.getAttribute('data-id');
        console.log("nodeId in batch.spec.ts", nodeId);
        expect(nodeId).not.toBeNull();

        //check for created Node in DB
        const response = await page.request.get(`http://localhost:8080/test-debug/node/${nodeId}`);

        expect(response.ok()).toBeTruthy();
        const nodeData = await response.json();
        console.log("response after Node created on Background: ", JSON.stringify(nodeData, null, 2));
        expect(nodeData.uid).toBe(nodeId);

        //right click on created Node 
        const createdNode = await page.waitForSelector(`[data-id="${nodeId}"]`);
        const createdNodebox = await createdNode.boundingBox();
        if (!createdNodebox) throw new Error('Node bounding box not found');
        await page.mouse.click(createdNodebox.x + 3, createdNodebox.y + 3, { button: 'right' });

        //make an attribute
        // 3–4. Wait for context menu to appear
        await page.waitForSelector('.create_button');
        await page.click('.create_button');

        // 5–6. Create attribute menu
        await page.waitForSelector('.create_attribute_button');
        await page.click('.create_attribute_button');

        // 7–8. Select attribute type
        await page.waitForSelector('.attribute_button_sub_select_type');
        await page.click('.attribute_button_sub_select_type');

        // 9–10. Select 3rd level type: import
        await page.waitForSelector('button.attribute_button_sub_3rd_select_type.import');
        await page.click('button.attribute_button_sub_3rd_select_type.import');//create an attribute on Node 

        // Wait for the batch API response before checking the backend
        const batchResponse = await page.waitForResponse(
            response => response.url().includes('/batch') && response.request().method() === 'POST',
            { timeout: 10000 }
        );

        // Wait for the response to complete
        await batchResponse.finished();

        //check if created attribute got persisted 
        // Fetch node data from backend and check if attribute exists
        const nodeDataAfterAttr = await (await page.request.get(`http://localhost:8080/test-debug/node/${nodeId}`)).json();

        console.log('nodeDataAfterPipe:', JSON.stringify(nodeDataAfterAttr, null, 2));
        expect(nodeDataAfterAttr.uid).toBe(nodeId);
        // Check if attributes array contains the 'import' attribute
        const hasImportAttr = nodeDataAfterAttr.attributes && nodeDataAfterAttr.attributes.some(attr => attr.name === 'import');
        expect(hasImportAttr).toBeTruthy();

        //get AttributeUid from node response from /test-debug/node/${nodeId}


        //check if create Attribute's div exist under Node (UI test)
        // const wrapper = page.locator(`[data-id="${nodeId}"]`)
        const wrapper = page.locator(`div.react-flow__node.react-flow__node-ReactNode.nopan.selectable[data-id="${nodeId}"]`)
            .locator('> div')            // 1st level
            .locator('> div')            // 2nd level
            .locator('> div')            // 3rd level
            .locator('> .attributeIconWrapper'); // 4th level

        // const wrapper =    node
        // .locator('> div')            // 1st level
        //     .locator('> div')            // 2nd level
        //     .locator('> div')            // 3rd level
        //     .locator('> .attributeIconWrapper'); // 4th level

        await expect(wrapper).toBeVisible();
        let attributeUid = await wrapper.getAttribute('data-id');
        attributeUid = attributeUid?.split('+')[1] as string; //nodeUid+attributeUid, thus we need to get the second one 
        //console.log("attributeUid", attributeUid);
        const hasImportAttrUid = nodeDataAfterAttr.attributes && nodeDataAfterAttr.attributes.some(attr => attr.uid === attributeUid);
        expect(hasImportAttrUid).toBeTruthy();

        //call test-debug/attribute/attributeUid 
        const attributeResponse = await page.request.get(`http://localhost:8080/test-debug/attribute/${attributeUid}`);

        //handle error case 
        if (attributeResponse.ok()) {
            const attributeData = await attributeResponse.json();
            console.log('attributeData:', JSON.stringify(attributeData, null, 2));
            expect(attributeData.uid).toBe(attributeUid);
        } else {
            throw new Error(`Attribute not found - status: ${attributeResponse.status()} - response: ${await attributeResponse.text()}`);
        }

        //re-right click on created Node 
        await page.mouse.click(createdNodebox.x + 3, createdNodebox.y + 3, { button: 'right' });

        //create a pipe 
        await page.waitForSelector('.create_button');
        await page.click('.create_button');
        await page.waitForSelector('.create_pipe_button');


        const batchRequests: Request[]= [];
        page.on('request', request => {
          if (request.url().includes('/batch') && request.method() === 'POST') {
            batchRequests.push(request);
          }
        });

        await page.click('.create_pipe_button');//will trigger calling POST call to http://localhost:8080/batch , one for pipe and one for Node(ghost)

        // const secondBatchRequest = await secondBatchRequestPromise;
        while (batchRequests.length < 2) {
            await new Promise(res => setTimeout(res, 100));
          }
          
        // Wait for both responses to finish
        for (const req of batchRequests) {
            const resp = await req.response();
            if (resp) {
            await resp.finished();
            }
        }  

        console.log('Batch 1:', batchRequests[0].postData());
        console.log('Batch 2:', batchRequests[1].postData());

        //check if either one of them has node, pipe created 


        //check for UI update, there should be a pipe and a node (ghost)
        //get pipe uid from newly created pipe (there should be a pipe and node named ghost)
        // Step 1: Get 5th nested level and check for .pipeStickyWrapper

        const returnScopeDiv = page.locator(`div.react-flow__node.react-flow__node-ReactNode.nopan.selectable[data-id="${nodeId}"]`)
            .locator('> div') // 1st level
            .locator('> div.returnScope') // 2nd
        // 3rd

        await expect(returnScopeDiv).toBeVisible(); // Check if exists

        const pipeSticky = page.locator(`div.react-flow__node.react-flow__node-ReactNode.nopan.selectable[data-id="${nodeId}"]`)
            .locator('> div') // 1st level
            .locator('> div') // 2nd
            .locator('> div') // 3rd
            .locator('> div').nth(1) // 4th, 2nd child 
            .locator('> div.pipeStickyWrapper'); // 5th level

        await expect(pipeSticky).toBeVisible(); // Check if exists

        // Step 2: Get 8th nested level and check if it has data-id
        const eighthLevel = pipeSticky
            .locator('> div') // 6
            .locator('> div') // 7
            .locator('div[datatype="pipe"][data-id]') // 8


        const dataIdAttr = await eighthLevel.getAttribute('data-id');

        console.log('8th level data-id:', dataIdAttr);
        let pipeUidFromUI = dataIdAttr?.split('+')[1];
        let ghostNodeUidFromUI = dataIdAttr?.split('+')[0];
        expect(dataIdAttr).not.toBeNull();


        // Check if created pipe got persisted
        const pipeResponse = await page.request.get(`http://localhost:8080/test-debug/pipes/byUid/${pipeUidFromUI}`);
        let nodeDataAfterPipe: any = null;

        if (pipeResponse.ok()) {
            nodeDataAfterPipe = await pipeResponse.json();
            //console.log('nodeDataAfterPipe:', JSON.stringify(nodeDataAfterPipe, null, 2));
            // The pipe should  have a sourceNode to ghostNode uid 
            expect(nodeDataAfterPipe.uid).toBe(pipeUidFromUI);
        } else {
            console.log('Pipe not found - status:', pipeResponse.status());
            console.log('Pipe not found - response:', await pipeResponse.text());
            throw new Error(`Pipe not found - status: ${pipeResponse.status()} - response: ${pipeResponse.text()}`);
        }


        //temporally check if node gets all persisted
        const nodesResponse = await page.request.get('http://localhost:8080/test-debug/nodes');
        if (nodesResponse.ok()) {
            const nodesList = await nodesResponse.json();
            console.log('List of nodes from /nodes:', JSON.stringify(nodesList, null, 2));
        } else {
            const errorText = await nodesResponse.text();
            throw new Error(`/nodes failed - status: ${nodesResponse.status()} - response: ${errorText}`);
        }
        
        console.log('ghostNodeUidFromUI:', ghostNodeUidFromUI);
        // Check if created ghost Node got persisted
        const ghostNodeResponse = await page.request.get(`http://localhost:8080/test-debug/node/${ghostNodeUidFromUI}`);
        let nodeDataAfterGhostNode: any = null;

        if (ghostNodeResponse.ok()) {
            nodeDataAfterGhostNode = await ghostNodeResponse.json();
            //console.log('nodeDataAfterGhostNode:', JSON.stringify(nodeDataAfterGhostNode, null, 2));
            expect(nodeDataAfterGhostNode.uid).toBe(ghostNodeUidFromUI);
        } else {
            throw new Error(`ghostNodeResponse uid ${ghostNodeUidFromUI} not found - status: ${ghostNodeResponse.status()} - response: ${await ghostNodeResponse.text()}`);
        }

        //re-right click on created Node 
        await page.mouse.click(createdNodebox.x + 3, createdNodebox.y + 3, { button: 'right' });

        //create a child Node 
        await page.waitForSelector('.create_button');
        await page.click('.create_button');
        await page.waitForSelector('.create_node_button');
        await page.click('.create_node_button');

        //check if api call was made to /batch with payload of create node 
        // // Wait for the batch API response before checking the backend
        const childNodeBatchResponse = await page.waitForResponse(
            response => response.url().includes('/batch') && response.request().method() === 'POST',
            { timeout: 10000 }
        );

        // Wait for the response to complete
        await childNodeBatchResponse.finished();
        const childNodeBatchData = await childNodeBatchResponse.json();
        
        //check if the /batch response have valid object of createdEntities array holding uid and type with node 
        expect(Array.isArray(childNodeBatchData.createdEntities)).toBe(true);
        expect(typeof childNodeBatchData.createdEntities[0]).toBe('object');
        expect(childNodeBatchData.createdEntities[0]).toHaveProperty('uid');
        expect(childNodeBatchData.createdEntities[0]).toHaveProperty('type', 'node');

        // get create childNode's UID 
        const childNodeUIDFromUI = childNodeBatchData.createdEntities[0].uid;
        console.log('printing childNodeUIDFromUI:', childNodeUIDFromUI);
        //check if a childNode was created in UI 

 
        // //check if created child node got persisted by calling /test-debug with it's UID from UI 
        const nodeDataAfterChildresponse = await page.request.get(`http://localhost:8080/test-debug/node/${childNodeUIDFromUI}`);
        let nodeDataAfterChildResult: any = null;

        if (nodeDataAfterChildresponse.ok()) {
            nodeDataAfterChildResult = await nodeDataAfterChildresponse.json();
            //console.log('nodeDataAfterPipe:', JSON.stringify(nodeDataAfterChildResult, null, 2));
            //check if nodeDataAfterChildResult has uid that is equal to childNodeUIDFromUI
            expect(nodeDataAfterChildResult.uid).toBe(childNodeUIDFromUI);
            //check if nodeDataAfterChildResult has parentId that is equal to nodeId (parentUid)
            expect(nodeDataAfterChildResult.parentId).toBe(nodeId);
            //check if nodeDataAfterChildResult has isStartingNode field that is equal to false
            expect(nodeDataAfterChildResult.isStartingNode).toBe(false);
        } else {
            console.log('Pipe not found - status:', nodeDataAfterChildresponse.status());
            console.log('Pipe not found - response:', await nodeDataAfterChildresponse.text());
            throw new Error(`ghostNodeResponse uid ${childNodeUIDFromUI} not found - status: ${nodeDataAfterChildresponse.status()} - response: ${nodeDataAfterChildresponse.text()}`);
        }


        ///commented 
       
        // const hasChildNode = nodeDataAfterChild.children && nodeDataAfterChild.children.some(child => child.uid === childNodeUid);

        //expect(hasChildNode).toBeTruthy();

        // //right click on pipe 
        // // First, we need to find the pipe element in the UI

        await eighthLevel.click({ button: 'right' });

        // //create an attributecontent 
        await page.waitForSelector('.pipe_add_button');
        await page.click('.pipe_add_button');

        await page.waitForSelector('.contentAttribute_editing_input_wrapper');
        const parentDiv = page.locator('.contentAttribute_editing_input_wrapper');

        const inputs = parentDiv.locator('input');
        const attributecontent_1_name = 'foo';
        const attributecontent_1_holdingValue = 'bar';

        await inputs.nth(0).fill(attributecontent_1_name);
        await inputs.nth(1).fill(attributecontent_1_holdingValue);

        await page.waitForSelector('.contentAttribute_editing_add_button');
        await page.click('.contentAttribute_editing_add_button');//calls create attributecontent

        //wait for /batch POST call 
        const batchResponseForCreatingContentAttrib = await page.waitForResponse(
            response => response.url().includes('/batch') && response.request().method() === 'POST',
            { timeout: 10000 }
        );

        // Wait for the response to complete
        await batchResponseForCreatingContentAttrib.finished();

        //get attributecontent uid from UI 
        const attributecontentDiv = page.locator(`div.attributeContentWrapper`)
        const attributecontentDataUidFromUI = await attributecontentDiv.getAttribute('data-id');
        const attributecontentUidFromUI = attributecontentDataUidFromUI?.split('+')[2];

        //call attributeContent api /test-debug 
        const pipeResponseforContentAttrib = await page.request.get(`http://localhost:8080/test-debug/pipes/byUid/${pipeUidFromUI}`);
        let pipeDataAfterContentAttrib: any = null;

        if (pipeResponse.ok()) {
            pipeDataAfterContentAttrib = await pipeResponseforContentAttrib.json();
            console.log('pipeDataAfterContentAttrib:', JSON.stringify(pipeDataAfterContentAttrib, null, 2));
            // const rawText = await pipeResponseforContentAttrib.text();
            // console.log('Raw response:', rawText);
            // The pipe should  have a sourceNode to ghostNode uid 
            expect(pipeDataAfterContentAttrib.attributeContents[0].uid).toBe(attributecontentUidFromUI);
        } else {
            throw new Error(`Pipe not found - status: ${pipeResponseforContentAttrib.status()} - response: ${await pipeResponseforContentAttrib.text()}`);
        }

        //call http://localhost:8080/test-debug/attributeContent/attributecontentDataUidFromUI
        try {
            const attrContentResponse = await page.request.get(`http://localhost:8080/test-debug/attribute-content/${attributecontentUidFromUI}`);
            if (attrContentResponse.ok()) {
                const attrContentData = await attrContentResponse.json();
                //console.log('AttributeContent data:', JSON.stringify(attrContentData, null, 2));
                //assert and evalute with attributecontentUidFromUI with AttributeContent.uid
                //assert and evalute with attributecontent_1_name with AttributeContent.name
                //assert and evalute with attributecontent_1_holdingValue with AttributeContent.holdingValue  
                //assert and evalute with nodeId with AttributeContent.belongingNodeUid
                expect(attrContentData.uid).toBe(attributecontentUidFromUI);
                expect(attrContentData.name).toBe(attributecontent_1_name);
                expect(attrContentData.holdingValue).toBe(attributecontent_1_holdingValue);
                //expect(attrContentData.belongingNodeUid).toBe(nodeId);
            } else {
                const errorText = await attrContentResponse.text();
                throw new Error(`AttributeContent not found - status: ${attrContentResponse.status()} - response: ${errorText}`);
            }
        } catch (err) {
            console.error('Error fetching AttributeContent:', err);
            throw err; // rethrow to fail the test
        }

        // Call /tree API and compare with frontend nodes
        try {
            const treeResponse = await page.request.get('http://localhost:8080/test-debug/tree');
            if (treeResponse.ok()) {
                const treeData = await treeResponse.json();
                console.log('Tree API response:', JSON.stringify(treeData, null, 2));
                
                // Get frontend nodes state
                const frontendNodes = await page.evaluate(() => {
                    // Access nodes through the global variable exposed by Flow component
                    return (window as any).frontendNodes || null;
                });
                
                console.log('Frontend nodes:', JSON.stringify(frontendNodes, null, 2));
                
                // Compare the structures
                if (frontendNodes) {
                    // Basic structure comparison
                    expect(Array.isArray(frontendNodes)).toBe(true);
                    expect(Array.isArray(treeData)).toBe(true);
                    
                    // Compare node counts
                    expect(frontendNodes.length).toBe(treeData.length);

                                         //----------- compare firstly created node in the background-----------------
                     // First node of treeData is the root node 
                     let firstCreateNode = treeData[0];
                     // First node of frontendNodes is the root node 
                     let firstCreateNodeFromFrontend = frontendNodes[0];

                    //  // Compare firstCreateNode and firstCreateNodeFromFrontend
                    //  expect(firstCreateNode.uid).toBe(firstCreateNodeFromFrontend.id);
                    //  expect(firstCreateNode.name).toBe(firstCreateNodeFromFrontend.data.title);
                     
                     // Compare the root node's data.id with nodeId (should be same as nodeId)
                     expect(firstCreateNodeFromFrontend.data.id).toBe(nodeId);
                     
                     // Get the ghost child node (first child)
                     let ghostChildFromFrontend = firstCreateNodeFromFrontend.data.children[0];
                     let ghostChildFromBackend = firstCreateNode.children[0];

                     //log both ghostChildFromFrontend and ghostChildFromBackend
                     //console.log('ghostChildFromFrontend:', JSON.stringify(ghostChildFromFrontend, null, 2));
                     console.log('ghostChildFromBackend:', JSON.stringify(ghostChildFromBackend, null, 2));
                     
                     // Ghost node should have title "ghost"
                     expect(ghostChildFromFrontend.title).toBe("ghost");
                     expect(ghostChildFromBackend.title).toBe("ghost");
                     
                     // Ghost node's id should be same as ghostNodeUidFromUI
                     expect(ghostChildFromFrontend.id).toBe(ghostNodeUidFromUI);
                     expect(ghostChildFromBackend.uid).toBe(ghostNodeUidFromUI); 
                     
                     // Ghost node should have pipes array with length of 1
                     expect(ghostChildFromFrontend.pipes.length).toBe(1);
                     expect(ghostChildFromBackend.pipes.length).toBe(1);
                     
                     // Ghost node's pipe id should be same as pipeUidFromUI
                     expect(ghostChildFromFrontend.pipes[0].id).toBe(pipeUidFromUI);
                     expect(ghostChildFromBackend.pipes[0].id).toBe(pipeUidFromUI);
                     
                     // Ghost node's pipe should have attributeContents array with length of 1
                     expect(ghostChildFromFrontend.pipes[0].attributeContents.length).toBe(1);
                     expect(ghostChildFromBackend.pipes[0].attributeContents.length).toBe(1);
                     
                     // Ghost node's pipe's attributeContent id should be same as attributecontentUidFromUI
                     expect(ghostChildFromFrontend.pipes[0].attributeContents[0].id).toBe(attributecontentUidFromUI);
                     expect(ghostChildFromBackend.pipes[0].attributeContents[0].id).toBe(attributecontentUidFromUI);
                     
                     // Ghost node's pipe's attributeContent name should be "foo"
                     expect(ghostChildFromFrontend.pipes[0].attributeContents[0].name).toBe("foo");
                     expect(ghostChildFromBackend.pipes[0].attributeContents[0].name).toBe("foo");
                     
                     // Ghost node's pipe's attributeContent type should be "bar"
                     expect(ghostChildFromFrontend.pipes[0].attributeContents[0].type).toBe("bar");
                     expect(ghostChildFromBackend.pipes[0].attributeContents[0].type).toBe("bar");
                     
                     // Get the child node (second child)
                     let childNodeFromFrontend = firstCreateNodeFromFrontend.data.children[1];
                     let childNodeFromBackend = firstCreateNode.children[1];
                     
                     // Child node should have title "NewNode"
                     expect(childNodeFromFrontend.title).toBe("NewNode");
                     expect(childNodeFromBackend.name).toBe("NewNode");
                     
                     // Child node's id should be same as childNodeUIDFromUI
                     expect(childNodeFromFrontend.id).toBe(childNodeUIDFromUI);
                     expect(childNodeFromBackend.uid).toBe(childNodeUIDFromUI);
                     
                     // Child node should have pipes array with length of 1
                     expect(childNodeFromFrontend.pipes.length).toBe(1);
                     expect(childNodeFromBackend.pipes.length).toBe(1);
                     
                     // Child node's pipe id should be same as childNodeUIDFromUI (for the pipe)
                     expect(childNodeFromFrontend.pipes[0].id).toBe(childNodeUIDFromUI);
                     expect(childNodeFromBackend.pipes[0].uid).toBe(childNodeUIDFromUI);
                     
                     // Root node should have attributes array with length of 1
                     expect(firstCreateNodeFromFrontend.data.attributes.length).toBe(1);
                     expect(firstCreateNode.attributes.length).toBe(1);
                     
                     // Root node's attribute id should be same as attributeUid
                     expect(firstCreateNodeFromFrontend.data.attributes[0].id).toBe(attributeUid);
                     expect(firstCreateNode.attributes[0].id).toBe(attributeUid);
                     
                     // Root node's attribute name should be "import"
                     expect(firstCreateNodeFromFrontend.data.attributes[0].nameOfAttribute).toBe("import");
                     expect(firstCreateNode.attributes[0].name).toBe("import");




                    // Compare specific nodes by ID
                    // frontendNodes.forEach((frontendNode, index) => {
                        
                    //     expect(frontendNode.id).toBe(backendNode.uid);
                    //     expect(frontendNode.data.title).toBe(backendNode.name);
                        
                    //     // Compare attributes if they exist
                    //     if (frontendNode.data.attributes && backendNode.attributes) {
                    //         expect(frontendNode.data.attributes.length).toBe(backendNode.attributes.length);
                    //     }
                        
                    //     // Compare children if they exist
                    //     if (frontendNode.data.children && backendNode.children) {
                    //         expect(frontendNode.data.children.length).toBe(backendNode.children.length);
                    //     }
                    // });
                    
                    console.log('✅ Frontend and backend nodes match!');
                } else {
                    console.warn('⚠️ Could not access frontend nodes state');
                }
                
            } else {
                const errorText = await treeResponse.text();
                throw new Error(`Tree API failed - status: ${treeResponse.status()} - response: ${errorText}`);
            }
        } catch (err) {
            console.error('Error comparing frontend/backend nodes:', err);
            throw err;
        }
    });

    //call /tree api 


});
