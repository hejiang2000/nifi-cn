package org.apache.nifi.translate;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.nifi.annotation.behavior.DynamicProperties;
import org.apache.nifi.annotation.behavior.DynamicProperty;
import org.apache.nifi.annotation.behavior.Restricted;
import org.apache.nifi.annotation.behavior.Stateful;
import org.apache.nifi.annotation.behavior.SystemResourceConsideration;
import org.apache.nifi.annotation.documentation.CapabilityDescription;
import org.apache.nifi.annotation.documentation.DeprecationNotice;
import org.apache.nifi.annotation.documentation.Tags;
import org.apache.nifi.bundle.BundleCoordinate;
import org.apache.nifi.components.ConfigurableComponent;
import org.apache.nifi.components.PropertyDescriptor;
import org.apache.nifi.nar.ExtensionManager;
import org.apache.nifi.util.StringUtils;
import org.yaml.snakeyaml.Yaml;

public class ConfigurableComponentExporter implements ComponentExporterIntf {

	private final ExtensionManager extensionManager;
	private final String[] languages;
	private final static Yaml yaml = new Yaml();

	public ConfigurableComponentExporter(final ExtensionManager extensionManager, final String[] langs) {
		this.extensionManager = extensionManager;
		this.languages = langs;
	}

	@Override
	public void export(final Class<? extends ConfigurableComponent> componentClass, final File translationDir,
			final BundleCoordinate bundleCoordinate) throws IOException {
		Map<String, Object> container = new HashMap<>();

		final String classType = componentClass.getCanonicalName();
		final ConfigurableComponent component = extensionManager.getTempComponent(classType, bundleCoordinate);

		exportDeprecationNotice(component, container);
		exportDescription(component, container);
		exportTags(component, container);
		exportProperties(component, container);
		exportDynamicProperties(component, container);
		exportAdditionalBodyInfo(component, container);
		exportStatefulInfo(component, container);
		exportRestrictedInfo(component, container);
		exportInputRequirementInfo(component, container);
		exportSystemResourceConsiderationInfo(component, container);
		exportSeeAlso(component, container);

		File file = new File(translationDir, component.getClass().getCanonicalName() + ".yaml");

		try (OutputStream stream = new FileOutputStream(file);
				Writer writer = new OutputStreamWriter(stream, StandardCharsets.UTF_8)) {
			yaml.dump(container, writer);
		}
	}

	protected Map<String, Object> buildLanguageMap(Object obj) {
		Map<String, Object> map = new HashMap<>(languages.length);
		for (String lang : languages) {
			map.put(lang, obj);
		}
		return map;
	}

	private void exportDeprecationNotice(ConfigurableComponent component, Map<String, Object> container) {
		final DeprecationNotice deprecationNotice = component.getClass().getAnnotation(DeprecationNotice.class);
		if (deprecationNotice != null && !StringUtils.isEmpty(deprecationNotice.reason())) {
			container.put("deprecationNotice", buildLanguageMap(deprecationNotice.reason()));
		}
	}

	private void exportDescription(ConfigurableComponent component, Map<String, Object> container) {
		final CapabilityDescription capabilityDescription = component.getClass()
				.getAnnotation(CapabilityDescription.class);
		if (capabilityDescription != null && !StringUtils.isEmpty(capabilityDescription.value())) {
			container.put("capabilityDescription", buildLanguageMap(capabilityDescription.value()));
		}
	}

	private void exportTags(ConfigurableComponent component, Map<String, Object> container) {
		final Tags tags = component.getClass().getAnnotation(Tags.class);
		if (tags != null) {
			container.put("tags", buildLanguageMap(tags.value()));
		}
	}

	private void exportProperties(ConfigurableComponent component, Map<String, Object> container) {
		List<PropertyDescriptor> list = component.getPropertyDescriptors();
		if (list == null || list.size() == 0) {
			return;
		}

		Map<String, Object> map = new HashMap<>();
		for (PropertyDescriptor pd : list) {
			Map<String, Object> prop = new HashMap<>();
			prop.put("displayName", pd.getDisplayName());
			prop.put("description", pd.getDescription());
			map.put(pd.getName(), buildLanguageMap(prop));
		}

		container.put("properties", map);
	}

	private void exportDynamicProperties(ConfigurableComponent component, Map<String, Object> container) {
		final List<DynamicProperty> dynamicProperties = new ArrayList<>();
		final DynamicProperties dynProps = component.getClass().getAnnotation(DynamicProperties.class);
		if (dynProps != null) {
			for (final DynamicProperty dynProp : dynProps.value()) {
				dynamicProperties.add(dynProp);
			}
		}

		final DynamicProperty dynProp = component.getClass().getAnnotation(DynamicProperty.class);
		if (dynProp != null) {
			dynamicProperties.add(dynProp);
		}

		if (dynamicProperties.size() == 0) {
			return;
		}

		Map<String, Object> map = new HashMap<>();
		for (DynamicProperty pd : dynamicProperties) {
			Map<String, Object> prop = new HashMap<>();
			prop.put("value", pd.value());
			prop.put("description", pd.description());
			map.put(pd.name(), buildLanguageMap(prop));
		}

		container.put("dynamicProperties", map);
	}

	protected void exportAdditionalBodyInfo(ConfigurableComponent component, Map<String, Object> container) {
	}

	private void exportStatefulInfo(ConfigurableComponent component, Map<String, Object> container) {
		final Stateful stateful = component.getClass().getAnnotation(Stateful.class);
		if (stateful != null && !StringUtils.isEmpty(stateful.description())) {
			container.put("statefulDescription", buildLanguageMap(stateful.description()));
		}
	}

	private void exportRestrictedInfo(ConfigurableComponent component, Map<String, Object> container) {
		final Restricted restricted = component.getClass().getAnnotation(Restricted.class);
		if (restricted != null && !StringUtils.isEmpty(restricted.value())) {
			container.put("restrictedDescription", buildLanguageMap(restricted.value()));
		}
	}

	private void exportInputRequirementInfo(ConfigurableComponent component, Map<String, Object> container) {
	}

	private void exportSystemResourceConsiderationInfo(ConfigurableComponent component, Map<String, Object> container) {
		SystemResourceConsideration[] systemResourceConsiderations = component.getClass()
				.getAnnotationsByType(SystemResourceConsideration.class);
		if (systemResourceConsiderations.length > 0) {
			List<String> list = new ArrayList<String>();
			for (SystemResourceConsideration src : systemResourceConsiderations) {
				list.add(src.description());
			}
			container.put("systemResourceConsiderations", buildLanguageMap(list));
		}
	}

	private void exportSeeAlso(ConfigurableComponent component, Map<String, Object> container) {
	}
}
