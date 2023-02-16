package org.apache.nifi.translate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.apache.nifi.annotation.behavior.DynamicRelationship;
import org.apache.nifi.annotation.behavior.ReadsAttribute;
import org.apache.nifi.annotation.behavior.ReadsAttributes;
import org.apache.nifi.annotation.behavior.WritesAttribute;
import org.apache.nifi.annotation.behavior.WritesAttributes;
import org.apache.nifi.components.ConfigurableComponent;
import org.apache.nifi.nar.ExtensionManager;
import org.apache.nifi.processor.Processor;
import org.apache.nifi.processor.Relationship;

public class ProcessorComponentTranslator extends ConfigurableComponentTranslator {

	public ProcessorComponentTranslator(final ExtensionManager extensionManager, final String lang) {
		super(extensionManager, lang);
	}

	@Override
	protected void translateAdditionalBodyInfo(ConfigurableComponent component, Map<String, Object> container) {
		final Processor processor = (Processor) component;
		translateRelationships(processor, container);
		translateDynamicRelationships(processor, container);
		translateAttributeInfo(processor, container);
	}

	@SuppressWarnings("unchecked")
	private void translateRelationships(final Processor processor, Map<String, Object> container) {
		Map<String, Object> map = (Map<String, Object>) container.get("relationships");
		for (Relationship relationship : processor.getRelationships()) {
			Object langValue = getLanguageValue((Map<String, Object>) map.get(relationship.getName()));
			updateObjectFieldValue(relationship, "description", langValue);
		}
	}

	@SuppressWarnings("unchecked")
	private void translateDynamicRelationships(final Processor processor, Map<String, Object> container) {
		List<DynamicRelationship> results = new ArrayList<>();

		DynamicRelationship dynamicRelationships = processor.getClass().getAnnotation(DynamicRelationship.class);
		if (dynamicRelationships != null) {
			results.add(dynamicRelationships);
		}

		Map<String, Object> map = (Map<String, Object>) container.get("dynamicRelationships");
		for (DynamicRelationship relationship : results) {
			Object langValue = getLanguageValue((Map<String, Object>) map.get(relationship.name()));
			updateAnnotationMemberValues(relationship, "description", langValue);
		}
	}

	@SuppressWarnings("unchecked")
	private void translateAttributeInfo(final Processor processor, Map<String, Object> container) {
		List<ReadsAttribute> ralist = new ArrayList<>();

		ReadsAttributes readsAttributes = processor.getClass().getAnnotation(ReadsAttributes.class);
		if (readsAttributes != null) {
			ralist.addAll(Arrays.asList(readsAttributes.value()));
		}

		ReadsAttribute readsAttribute = processor.getClass().getAnnotation(ReadsAttribute.class);
		if (readsAttribute != null) {
			ralist.add(readsAttribute);
		}

		Map<String, Object> ram = (Map<String, Object>) container.get("readAttributes");
		for (ReadsAttribute ra : ralist) {
			Object langValue = getLanguageValue((Map<String, Object>) ram.get(ra.attribute()));
			updateAnnotationMemberValues(ra, "description", langValue);
		}

		List<WritesAttribute> walist = new ArrayList<>();

		WritesAttributes writesAttributes = processor.getClass().getAnnotation(WritesAttributes.class);
		if (writesAttributes != null) {
			walist.addAll(Arrays.asList(writesAttributes.value()));
		}

		WritesAttribute writeAttribute = processor.getClass().getAnnotation(WritesAttribute.class);
		if (writeAttribute != null) {
			walist.add(writeAttribute);
		}

		Map<String, Object> wam = (Map<String, Object>) container.get("writeAttributes");
		for (WritesAttribute wa : walist) {
			Object langValue = getLanguageValue((Map<String, Object>) wam.get(wa.attribute()));
			updateAnnotationMemberValues(wa, "description", langValue);
		}
	}
}
