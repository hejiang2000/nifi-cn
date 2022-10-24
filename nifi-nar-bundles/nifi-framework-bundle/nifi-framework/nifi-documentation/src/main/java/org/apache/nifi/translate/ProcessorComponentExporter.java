package org.apache.nifi.translate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
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

public class ProcessorComponentExporter extends ConfigurableComponentExporter {

	public ProcessorComponentExporter(final ExtensionManager extensionManager, final String[] langs) {
		super(extensionManager, langs);
	}

	@Override
	protected void exportAdditionalBodyInfo(ConfigurableComponent component, Map<String, Object> container) {
		final Processor processor = (Processor) component;
		exportRelationships(processor, container);
		exportDynamicRelationships(processor, container);
		exportAttributeInfo(processor, container);
	}

	private void exportRelationships(final Processor processor, Map<String, Object> container) {
		Map<String, Object> map = new HashMap<>();
		for (Relationship relationship : processor.getRelationships()) {
			map.put(relationship.getName(), buildLanguageMap(relationship.getDescription()));
		}
		if (map.size() > 0) {
			container.put("relationships", map);
		}
	}

	private void exportDynamicRelationships(final Processor processor, Map<String, Object> container) {
		Map<String, Object> map = new HashMap<>();
		List<DynamicRelationship> results = new ArrayList<>();

		DynamicRelationship dynamicRelationships = processor.getClass().getAnnotation(DynamicRelationship.class);
		if (dynamicRelationships != null) {
			results.add(dynamicRelationships);
		}

		for (DynamicRelationship rs : results) {
			map.put(rs.name(), buildLanguageMap(rs.description()));
		}
		if (map.size() > 0) {
			container.put("dynamicRelationships", map);
		}
	}

	private void exportAttributeInfo(final Processor processor, Map<String, Object> container) {
		List<ReadsAttribute> ralist = new ArrayList<>();

		ReadsAttributes readsAttributes = processor.getClass().getAnnotation(ReadsAttributes.class);
		if (readsAttributes != null) {
			ralist.addAll(Arrays.asList(readsAttributes.value()));
		}

		ReadsAttribute readsAttribute = processor.getClass().getAnnotation(ReadsAttribute.class);
		if (readsAttribute != null) {
			ralist.add(readsAttribute);
		}

		Map<String, Object> ram = new HashMap<>();
		for (ReadsAttribute ra : ralist) {
			ram.put(ra.attribute(), buildLanguageMap(ra.description()));
		}
		if (ram.size() > 0) {
			container.put("readAttributes", ram);
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

		Map<String, Object> wam = new HashMap<>();
		for (WritesAttribute wa : walist) {
			wam.put(wa.attribute(), buildLanguageMap(wa.description()));
		}
		if (wam.size() > 0) {
			container.put("writeAttributes", wam);
		}
	}
}
