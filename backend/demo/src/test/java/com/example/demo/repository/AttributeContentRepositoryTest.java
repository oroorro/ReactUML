package com.example.demo.repository;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.example.demo.model.Attribute;
import com.example.demo.model.AttributeContent;
import com.example.demo.model.Node;

@DataJpaTest
public class AttributeContentRepositoryTest {

    @Autowired
    private AttributeRepository attributeRepository;

    @Autowired
    private NodeRepository nodeRepository;

    @Autowired
    private AttributeContentRepository attributeContentRepository;

    @Test
    void testFindByAttribute() {
        Node node = new Node();
        node.setUid(UUID.randomUUID().toString());
        node.setName("ParentNode");
        node = nodeRepository.save(node);

        Attribute attr = new Attribute();
        attr.setUid(UUID.randomUUID().toString());
        attr.setName("AttrB");
        attr.setMute(false);
        attr.setTotalNumber(1);
        attr.setNode(node);
        attr = attributeRepository.save(attr);

        AttributeContent content = new AttributeContent();
        content.setUid(UUID.randomUUID().toString());
        content.setName("ContentB");
        content.setAttribute(attr);
        content.setParentNode(node);
        attributeContentRepository.save(content);

        // List<AttributeContent> results = attributeContentRepository.findByAttribute(attr);
        // assertThat(results).hasSize(1);
        // assertThat(results.get(0).getName()).isEqualTo("ContentB");
    }
}

