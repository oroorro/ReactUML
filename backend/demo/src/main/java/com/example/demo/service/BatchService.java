package com.example.demo.service;


import org.springframework.stereotype.Service;

import com.example.demo.dto.ChangeSetDto;
import com.example.demo.model.Attribute;
import com.example.demo.model.AttributeContent;

import com.example.demo.model.Node;
import com.example.demo.model.Pipe;

import jakarta.transaction.Transactional;

@Service
public class BatchService {

    private final NodeService nodeService;
    private final PipeService pipeService;
    private final AttributeService attributeService;
    private final AttributeContentService attributeContentService;

    public BatchService(NodeService nodeService,
                        PipeService pipeService,
                        AttributeService attributeService,
                        AttributeContentService attributeContentService) {
        this.nodeService = nodeService;
        this.pipeService = pipeService;
        this.attributeService = attributeService;
        this.attributeContentService = attributeContentService;
    }

    @Transactional
    public void applyChanges(ChangeSetDto changes, Integer userId) {
        // 1. DELETE first (avoid FK constraint issues)
        if (changes.deleted != null) {
            if (changes.deleted.attributeContentUids != null) {
                for (String uid : changes.deleted.attributeContentUids) {
                    attributeContentService.deleteByUid(uid);
                }
            }
            if (changes.deleted.pipeUids != null) {
                for (String uid : changes.deleted.pipeUids) {
                    pipeService.deletePipeByUid(uid);
                }
            }
            if (changes.deleted.attributeUids != null) {
                for (String uid : changes.deleted.attributeUids) {
                    attributeService.deleteAttribute(uid);
                }
            }
            if (changes.deleted.nodeUids != null) {
                for (String uid : changes.deleted.nodeUids) {
                    //nodeService.deleteNode(userId, id);
                    boolean success = nodeService.deleteNodeByUid(uid);
                    if (!success) {
                        System.out.println("Warning: Node with UID " + uid + " not found.");
                    }
                }
            }
        }

        // 2. UPDATE existing
        if (changes.updated != null) {
            if (changes.updated.attributeContents != null) {
                for (AttributeContent ac : changes.updated.attributeContents) {
                    attributeContentService.editAttributeContent(ac);
                }
            }
            if (changes.updated.pipes != null) {
                for (Pipe pipe : changes.updated.pipes) {
                    pipeService.editPipe(pipe);
                }
            }
            if (changes.updated.nodes != null) {
                for (Node node : changes.updated.nodes) {
                    nodeService.editNode(node);
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
    }
}

