package com.example.demo.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.model.Attribute;
import com.example.demo.model.AttributeContent;
import com.example.demo.model.Node;
import com.example.demo.model.Pipe;
import com.example.demo.repository.AttributeContentRepository;

@ExtendWith(MockitoExtension.class)
public class AttributeContentServiceTest {
    
    @Mock
    private AttributeContentRepository attributeContentRepository;

    @InjectMocks
    private AttributeContentService service;

    //testing AttributeContentService layer not allowing to save a duplicate AttributeContent
    @Test
    void testCheckDuplicateUid_throwsWhenExists() {
        when(attributeContentRepository.findByUid("duplicate"))
            .thenReturn(Optional.of(new AttributeContent()));
        assertThrows(RuntimeException.class, () -> service.checkDuplicateUid("duplicate"));
    }

    //testing AttributeContentService layer not allowing to save a AttributeContent that does not have Pipe and Attribute attached
    @Test
    void testCreate_throwsIfBothPipeAndAttributeAreNull() {
        AttributeContent ac = new AttributeContent();
        ac.setUid("uid-1");
        assertThrows(IllegalArgumentException.class, () -> service.create(ac, null, null));
    }

    //testing creating AttributeContent that only linked to Pipe successfully
    @Test
    void testCreate_succeedsWhenPipeSet() {
        AttributeContent ac = new AttributeContent();
        ac.setUid("uid-2");
        Pipe pipe = new Pipe();

        when(attributeContentRepository.findByUid("uid-2")).thenReturn(Optional.empty());
        when(attributeContentRepository.save(ac)).thenReturn(ac);

        AttributeContent result = service.create(ac, pipe, null);

        assertEquals(pipe, result.getPipe());
        assertThat(result.getUid()).isEqualTo("uid-2");
        assertNull(result.getAttribute());
    }

    //testing creating AttributeContent that only linked to Attribute successfully
    @Test
    void testCreate_succeedsWhenAttributeSet() {
        AttributeContent ac = new AttributeContent();
        ac.setUid("uid-3");
        Attribute attr = new Attribute();

        when(attributeContentRepository.findByUid("uid-3")).thenReturn(Optional.empty());
        when(attributeContentRepository.save(ac)).thenReturn(ac);

        AttributeContent result = service.create(ac, null, attr);

        assertEquals(attr, result.getAttribute());
        assertNull(result.getPipe());
    }

    //testing creating AttributeContent that is both linked to Attribute and Pipe successfully
    @Test
    void testCreate_succeedsWhenAttributeAndPipeSet() {
        AttributeContent ac = new AttributeContent();
        ac.setUid("uid-3");
        Attribute attr = new Attribute();
        attr.setUid("attr-uid");
        Pipe pipe = new Pipe();
        pipe.setUid("pipe-uid");

        when(attributeContentRepository.findByUid("uid-3")).thenReturn(Optional.empty());
        when(attributeContentRepository.save(ac)).thenReturn(ac);

        AttributeContent result = service.create(ac, pipe, attr);

        assertEquals(attr, result.getAttribute());
        assertThat(result.getUid()).isEqualTo("uid-3");
        assertNotNull(result.getAttribute());
        assertNotNull(result.getPipe());
        assertThat(result.getPipe().getUid()).isEqualTo("pipe-uid");
        assertThat(result.getAttribute().getUid()).isEqualTo("attr-uid");
    }

    //testing attributeContentService's deleteByUid that returns AttributeContent successfully
    @Test
    void testDeleteByUid_succeeds() {
        AttributeContent ac = new AttributeContent();
        ac.setUid("delete-me");

        when(attributeContentRepository.findByUid("delete-me")).thenReturn(Optional.of(ac));
        service.deleteByUid("delete-me");
        verify(attributeContentRepository).delete(ac);
    }

    //testing attributeContentService's deleteByUid that throws an exception when trying to delete unpersisted AttributeContent
    @Test
    void testDeleteByUid_throwsIfNotFound() {
        when(attributeContentRepository.findByUid("missing")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> service.deleteByUid("missing"));
    }

    // @Test
    // void testAttributeContentDeletionOnlyWhenBothParentsDeleted() {
    //     // Setup entities
    //     Node node = new Node();
    //     node.setUid("node-uid");
    //     node.setName("Node");
        

    //     Pipe pipe = new Pipe();
    //     pipe.setUid("pipe-uid");
    //     pipe.setName("Pipe");
    //     pipe.setSourceNode(node);
       

    //     Attribute attribute = new Attribute();
    //     attribute.setUid("attribute-uid");
    //     attribute.setName("Attribute");
    //     attribute.setNode(node);
        

    //     AttributeContent content = new AttributeContent();
    //     content.setUid("content-uid");
    //     content.setName("Content");
    //     content.setPipe(pipe);
    //     content.setAttribute(attribute);
    //     content.setBelongingNode(node);
    //     content = attributeContentRepository.save(content);

    //     // Delete Pipe and verify content still exists
    //     pipeRepository.delete(pipe);
    //     attributeContentService.cleanUpOrphanedAttributeContents();
    //     assertTrue(attributeContentRepository.existsById(content.getId()));

    //     // Delete Attribute and verify content is deleted
    //     attributeRepository.delete(attribute);
    //     attributeContentService.cleanUpOrphanedAttributeContents();
    //     assertFalse(attributeContentRepository.existsById(content.getId()));
    // }

    @Test
    void testCleanUpOrphanedAttributeContents_deletesOnlyOrphans() {
        AttributeContent ac1 = new AttributeContent(); // orphan
        ac1.setUid("attr1-uid");
        AttributeContent ac2 = new AttributeContent(); 
        ac2.setPipe(new Pipe());
        AttributeContent ac3 = new AttributeContent(); 
        ac3.setAttribute(new Attribute());

        when(attributeContentRepository.findAll()).thenReturn(List.of(ac1, ac2, ac3));

        service.cleanUpOrphanedAttributeContents();
        Optional<AttributeContent> ac1_fetched =  attributeContentRepository.findByUid("attr1-uid");

        assertEquals(ac1_fetched, Optional.empty());
        verify(attributeContentRepository).deleteAll(List.of(ac1));

        List<AttributeContent>  ac_all = attributeContentRepository.findAll();
        assertEquals(2, ac_all.size()); 
    }

}
