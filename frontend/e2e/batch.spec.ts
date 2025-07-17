import { test, expect, Request } from '@playwright/test';
import { generateUniqueId } from '../util/util';

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
        // const response = await request.delete('http://localhost:8080/test-debug/cleanup?username=test1');
        // expect(response.ok()).toBeTruthy();
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

        // const responseAttribute = await page.request.post('http://localhost:8080/batch', {
        //     headers: { 'Content-Type': 'application/json' },
        //     data: {
        //         created: {
        //             nodes: [],
        //             pipes: [],
        //             attributes: [
        //                 {
        //                     uid: generateUniqueId(),
        //                     name: 'import',
        //                     node: {
        //                         uid: nodeId,
        //                     },
        //                 },
        //             ],
        //             attributeContents: [],
        //         },
        //         updated: null,
        //         deleted: null,
        //     },
        // });

        // expect(responseAttribute.ok()).toBeTruthy();
        // const json = await responseAttribute.json();
        // expect(json.success).toBeTruthy();


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

        await inputs.nth(0).fill('foo');
        await inputs.nth(1).fill('bar');

        await page.waitForSelector('.contentAttribute_editing_add_button');
        await page.click('.contentAttribute_editing_add_button');//calls create attributecontent

        //wait for /batch POST call 
        const batchResponseForCreatingContentAttrib = await page.waitForResponse(
            response => response.url().includes('/batch') && response.request().method() === 'POST',
            { timeout: 10000 }
        );

        // Wait for the response to complete
        await batchResponseForCreatingContentAttrib.finished();


        // //check if created attributecontent got persisted 
        // const nodeDataAfterContent = await (await page.request.get(`http://localhost:8080/test-debug/node/${nodeId}`)).json();
        // const importAttribute = nodeDataAfterContent.attributes.find(attr => attr.name === 'import');
        // expect(importAttribute).toBeTruthy();

        // const hasAttributeContent = importAttribute.attributeContents && 
        //     importAttribute.attributeContents.some(content => content.uid === attributeContentUid);
        // expect(hasAttributeContent).toBeTruthy();

        const pipeResponseforContentAttrib = await page.request.get(`http://localhost:8080/test-debug/pipes/byUid/${pipeUidFromUI}`);
        let pipeDataAfterContentAttrib: any = null;

        if (pipeResponse.ok()) {
            //pipeDataAfterContentAttrib = await pipeResponseforContentAttrib.json();
            //console.log('pipeDataAfterContentAttrib:', JSON.stringify(pipeDataAfterContentAttrib, null, 2));
            const rawText = await pipeResponseforContentAttrib.text();
console.log('Raw response:', rawText);
            // The pipe should  have a sourceNode to ghostNode uid 
            ///expect(nodeDataAfterPipe.uid).toBe(pipeUidFromUI);
        } else {
            
            throw new Error(`Pipe not found - status: ${pipeResponseforContentAttrib.status()} - response: ${await pipeResponseforContentAttrib.text()}`);
        }



    });


});
