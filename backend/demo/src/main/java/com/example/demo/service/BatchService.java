package com.example.demo.service;


import org.springframework.stereotype.Service;

import com.example.demo.dto.BatchResponse;
import com.example.demo.dto.ChangeSetDto;
import com.example.demo.model.Attribute;
import com.example.demo.model.AttributeContent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.core.JsonProcessingException;

import com.example.demo.model.Node;
import com.example.demo.model.Pipe;

import jakarta.transaction.Transactional;

@Service
public class BatchService {

    private final NodeService nodeService;
    private final PipeService pipeService;
    private final AttributeService attributeService;
    private final AttributeContentService attributeContentService;
    private final ObjectMapper objectMapper;

    public BatchService(NodeService nodeService,
                        PipeService pipeService,
                        AttributeService attributeService,
                        AttributeContentService attributeContentService,
                        ObjectMapper objectMapper) {
        this.nodeService = nodeService;
        this.pipeService = pipeService;
        this.attributeService = attributeService;
        this.attributeContentService = attributeContentService;
        this.objectMapper = objectMapper;
    }


    @Transactional
    public BatchResponse applyChanges(ChangeSetDto changes, JsonNode dto, Integer userId) {

        BatchResponse response = new BatchResponse(true, "Batch processed successfully");

        // 1. DELETE first (avoid FK constraint issues)
        if (changes.deleted != null) {
            if (changes.deleted.attributeContentUids != null) {
                for (String uid : changes.deleted.attributeContentUids) {
                    boolean success = attributeContentService.deleteByUid(uid);
                    if (!success) {
                        response.addError("attributeContentUids", uid);
                        response.success = false;
                        response.message = "Some entities failed to delete";
                        System.out.println("Warning: AttributeContent with UID " + uid + " not found.");
                    }
                }
            }
            if (changes.deleted.pipeUids != null) {
                for (String uid : changes.deleted.pipeUids) {
                    boolean success = pipeService.deletePipeByUid(uid);
                    if (!success) {
                        response.addError("pipeUids", uid);
                        response.success = false;
                        response.message = "Some entities failed to delete";
                        System.out.println("Warning: Pipe with UID " + uid + " not found.");
                    }
                }
            }
            if (changes.deleted.attributeUids != null) {
                for (String uid : changes.deleted.attributeUids) {
                    boolean success = attributeService.deleteAttribute(uid);
                    if (!success) {
                        response.addError("attributeUids", uid);
                        response.success = false;
                        response.message = "Some entities failed to delete";
                        System.out.println("Warning: Attribute with UID " + uid + " not found.");
                    }
                }
            }
            if (changes.deleted.nodeUids != null) {
                for (String uid : changes.deleted.nodeUids) {
                    //nodeService.deleteNode(userId, id);
                    boolean success = nodeService.deleteNodeByUid(uid);
                    if (!success) {
                        response.addError("nodeUids", uid);
                        response.success = false;
                        response.message = "Some entities failed to delete";
                        System.out.println("Warning: Node with UID " + uid + " not found.");
                    }
                }
            }

            
        }

        // 2. UPDATE existing
        // if (changes.updated != null) {
        //     if (changes.updated.attributeContents != null) {
        //         for (AttributeContent ac : changes.updated.attributeContents) {
        //             try {

        //                 //JsonNode jsonNode = objectMapper.valueToTree(ac);
        //                 for(JsonNode contentNode: dto.get("updated").get("attributeContents")){

        //                     AttributeContent dto = objectMapper.treeToValue(contentNode, AttributeContent.class);
        //                     boolean success = attributeContentService.editAttributeContent(dto, contentNode);
        //                     if (!success) {
        //                         response.addError("attributeContents", ac.getUid());
        //                         response.success = false;
        //                         response.message = "Some entities failed to update";
        //                         System.out.println("Warning: AttributeContent with UID " + ac.getUid() + " not found or failed to update.");
        //                     }
        //                 }
                        
        //             } catch (JsonProcessingException e) {
        //                 response.addError("attributeContents", ac.getUid());
        //                 response.success = false;
        //                 response.message = "Failed to process JSON for AttributeContent: " + e.getMessage();
        //                 System.out.println("Error processing AttributeContent with UID " + ac.getUid() + ": " + e.getMessage());
        //             }
        //         }
        //     }
        //     if (changes.updated.pipes != null) {
        //         for (Pipe pipe : changes.updated.pipes) {
        //             pipeService.editPipe(pipe);
        //         }
        //     }
        //     if (changes.updated.nodes != null) {
        //         for (Node node : changes.updated.nodes) {
        //             nodeService.editNode(node);
        //         }
        //     }
        // }


        //UPDATING BATCH

        //updating attributeContents 
        if (changes.updated != null && changes.updated.attributeContents != null) {
            
            JsonNode updatedNode = dto.get("updated");
            if (updatedNode != null && updatedNode.has("attributeContents")) {
                JsonNode contentsArray = updatedNode.get("attributeContents");
                if (contentsArray.isArray()) {
                    for (int i = 0; i < changes.updated.attributeContents.size(); i++) {
                        AttributeContent ac = changes.updated.attributeContents.get(i);
                        JsonNode rawNode = contentsArray.get(i); // Match by index
                        try {
                            boolean success = attributeContentService.editAttributeContent(ac, rawNode);
                            if (!success) {
                                response.addError("attributeContents", ac.getUid());
                                response.success = false;
                                response.message = "Some entities failed to update";
                                System.out.println("Warning: AttributeContent with UID " + ac.getUid() + " not found or failed to update.");
                            }
                        } catch (Exception e) {
                            response.addError("attributeContents", ac.getUid());
                            response.success = false;
                            response.message = "Failed to process JSON for AttributeContent: " + e.getMessage();
                            System.out.println("Error processing AttributeContent with UID " + ac.getUid() + ": " + e.getMessage());
                        }
                    }
                }
            }

        }
        //updating attributes 
        else if (changes.updated != null && changes.updated.attributes != null) {
            JsonNode updatedNode = dto.get("updated");
            if (updatedNode != null && updatedNode.has("attributes")) {
                JsonNode attributesArray = updatedNode.get("attributes");
                if (attributesArray.isArray()) {
                    for (int i = 0; i < changes.updated.attributes.size(); i++) {
                        Attribute attr = changes.updated.attributes.get(i);
                        JsonNode rawNode = attributesArray.get(i); // Match by index
                        try {
                            boolean success = attributeService.editAttribute(attr, rawNode);
                            if (!success) {
                                response.addError("attributes", attr.getUid());
                                response.success = false;
                                response.message = "Some entities failed to update";
                                System.out.println("Warning: Attribute with UID " + attr.getUid() + " not found or failed to update.");
                            }
                        } catch (Exception e) {
                            response.addError("attributes", attr.getUid());
                            response.success = false;
                            response.message = "Failed to process JSON for Attribute: " + e.getMessage();
                            System.out.println("Error processing Attribute with UID " + attr.getUid() + ": " + e.getMessage());
                        }
                    }
                }
            }
        }
        //updating pipes 
        else if (changes.updated != null && changes.updated.pipes != null) {
            JsonNode updatedNode = dto.get("updated");
            if (updatedNode != null && updatedNode.has("pipes")) {
                JsonNode pipesArray = updatedNode.get("pipes");
                if (pipesArray.isArray()) {
                    for (int i = 0; i < changes.updated.pipes.size(); i++) {
                        Pipe pipe = changes.updated.pipes.get(i);
                        JsonNode rawNode = pipesArray.get(i); // Match by index
                        try {
                            boolean success = pipeService.editPipe(pipe, rawNode);
                            if (!success) {
                                response.addError("pipes", pipe.getUid());
                                response.success = false;
                                response.message = "Some entities failed to update";
                                System.out.println("Warning: Pipe with UID " + pipe.getUid() + " not found or failed to update.");
                            }
                        } catch (Exception e) {
                            response.addError("pipes", pipe.getUid());
                            response.success = false;
                            response.message = "Failed to process JSON for Pipe: " + e.getMessage();
                            System.out.println("Error processing Pipe with UID " + pipe.getUid() + ": " + e.getMessage());
                        }
                    }
                }
            }
        }
        //updating nodes 
        //updating nodes
        else if (changes.updated != null && changes.updated.nodes != null) {
            JsonNode updatedNode = dto.get("updated");
            if (updatedNode != null && updatedNode.has("nodes")) {
                JsonNode nodesArray = updatedNode.get("nodes");
                if (nodesArray.isArray()) {
                    for (int i = 0; i < changes.updated.nodes.size(); i++) {
                        Node node = changes.updated.nodes.get(i);
                        JsonNode rawNode = nodesArray.get(i); // Match by index
                        try {
                            Node updated = nodeService.editNode(node, rawNode);
                            if (updated == null) {
                                response.addError("nodes", node.getUid());
                                response.success = false;
                                response.message = "Some entities failed to update";
                                System.out.println("Warning: Node with UID " + node.getUid() + " not found or failed to update.");
                            }
                        } catch (Exception e) {
                            response.addError("nodes", node.getUid());
                            response.success = false;
                            response.message = "Failed to process JSON for Node: " + e.getMessage();
                            System.out.println("Error processing Node with UID " + node.getUid() + ": " + e.getMessage());
                        }
                    }
                }
            }
        }

        // 3. CREATE new
        if (changes.created != null) {
            if (changes.created.nodes != null) {
                for (Node node : changes.created.nodes) {
                    nodeService.createNode(userId, node);
                }
            }
            if (changes.created.pipes != null) {
                for (Pipe pipe : changes.created.pipes) {
                    pipeService.createPipe(pipe);
                }
            }
            if (changes.created.attributes != null) {
                for (Attribute attribute : changes.created.attributes) {
                    attributeService.createAttribute(attribute);
                }
            }
            if (changes.created.attributeContents != null) {
                for (AttributeContent ac : changes.created.attributeContents) {
                    attributeContentService.createAttributeContent(ac);
                }
            }
        }

        return response;
    }
}

