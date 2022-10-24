package org.apache.nifi.translate;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Proxy;
import java.util.ArrayList;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.yaml.snakeyaml.Yaml;

public class ConfigurableComponentTranslator implements ComponentTranslationIntf {

	private static final Logger logger = LoggerFactory.getLogger(ConfigurableComponentTranslator.class);

	private final ExtensionManager extensionManager;
	private final String language;
	private final static Yaml yaml = new Yaml();

	public ConfigurableComponentTranslator(final ExtensionManager extensionManager, final String lang) {
		this.extensionManager = extensionManager;
		this.language = lang;
	}

	@Override
	public void translate(final Class<? extends ConfigurableComponent> componentClass, final File translationDir,
			final BundleCoordinate bundleCoordinate) throws IOException {
		final String classType = componentClass.getCanonicalName();
		final ConfigurableComponent component = extensionManager.getTempComponent(classType, bundleCoordinate);

		File file = new File(translationDir, component.getClass().getCanonicalName() + ".yaml");
		Map<String, Object> container;

		try (InputStream stream = new FileInputStream(file)) {
			container = yaml.load(stream);
		}

		translateDeprecationNotice(component, container);
		translateDescription(component, container);
		translateTags(component, container);
		translateProperties(component, container);
		translateDynamicProperties(component, container);
		translateAdditionalBodyInfo(component, container);
		translateStatefulInfo(component, container);
		translateRestrictedInfo(component, container);
		translateInputRequirementInfo(component, container);
		translateSystemResourceConsiderationInfo(component, container);
		translateSeeAlso(component, container);
	}

	protected Object getLanguageValue(Map<String, Object> container) {
		return container.get(language);
	}

	@SuppressWarnings("unchecked")
	protected void updateAnnotationMemberValues(Object annotation, String name, Object value) {
		try {
			InvocationHandler handler = Proxy.getInvocationHandler(annotation);
			Field field = handler.getClass().getDeclaredField("memberValues");
			field.setAccessible(true);
			Map<String, Object> memberValues = (Map<String, Object>) field.get(handler);
			memberValues.put(name, value);
		} catch (NoSuchFieldException | SecurityException | IllegalArgumentException | IllegalAccessException e) {
			logger.error(e.getMessage());
		}
	}

	protected void updateObjectFieldValue(Object object, String name, Object value) {
		try {
			Field field = object.getClass().getDeclaredField(name);
			field.setAccessible(true);
			field.set(object, value);
		} catch (NoSuchFieldException | SecurityException | IllegalArgumentException | IllegalAccessException e) {
			logger.error(e.getMessage());
		}
	}

	@SuppressWarnings("unchecked")
	private void translateDeprecationNotice(ConfigurableComponent component, Map<String, Object> container) {
		final DeprecationNotice deprecationNotice = component.getClass().getAnnotation(DeprecationNotice.class);
		if (deprecationNotice != null && !StringUtils.isEmpty(deprecationNotice.reason())) {
			Object langValue = getLanguageValue((Map<String, Object>) container.get("deprecationNotice"));
			updateAnnotationMemberValues(deprecationNotice, "reason", langValue);
		}
	}

	@SuppressWarnings("unchecked")
	private void translateDescription(ConfigurableComponent component, Map<String, Object> container) {
		final CapabilityDescription capabilityDescription = component.getClass()
				.getAnnotation(CapabilityDescription.class);
		if (capabilityDescription != null && !StringUtils.isEmpty(capabilityDescription.value())) {
			Object langValue = getLanguageValue((Map<String, Object>) container.get("capabilityDescription"));
			updateAnnotationMemberValues(capabilityDescription, "value", langValue);
		}
	}

	@SuppressWarnings("unchecked")
	private void translateTags(ConfigurableComponent component, Map<String, Object> container) {
		final Tags tags = component.getClass().getAnnotation(Tags.class);
		if (tags != null) {
			String[] langValue = ((List<String>) getLanguageValue((Map<String, Object>) container.get("tags")))
					.toArray(new String[] {});
			updateAnnotationMemberValues(tags, "value", langValue);
		}
	}

	@SuppressWarnings("unchecked")
	private void translateProperties(ConfigurableComponent component, Map<String, Object> container) {
		List<PropertyDescriptor> list = component.getPropertyDescriptors();
		if (list == null || list.size() == 0) {
			return;
		}

		Map<String, Object> map = (Map<String, Object>) container.get("properties");
		for (PropertyDescriptor pd : list) {
			Map<String, Object> langValue = (Map<String, Object>) getLanguageValue(
					(Map<String, Object>) map.get(pd.getName()));
			updateObjectFieldValue(pd, "displayName", langValue.get("displayName"));
			updateObjectFieldValue(pd, "description", langValue.get("description"));
		}
	}

	@SuppressWarnings("unchecked")
	private void translateDynamicProperties(ConfigurableComponent component, Map<String, Object> container) {
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

		Map<String, Object> map = (Map<String, Object>) container.get("dynamicProperties");
		for (DynamicProperty pd : dynamicProperties) {
			Map<String, Object> langValue = (Map<String, Object>) getLanguageValue(
					(Map<String, Object>) map.get(pd.name()));
			updateAnnotationMemberValues(pd, "value", langValue.get("value"));
			updateAnnotationMemberValues(pd, "description", langValue.get("description"));
		}
	}

	protected void translateAdditionalBodyInfo(ConfigurableComponent component, Map<String, Object> container) {
	}

	@SuppressWarnings("unchecked")
	private void translateStatefulInfo(ConfigurableComponent component, Map<String, Object> container) {
		final Stateful stateful = component.getClass().getAnnotation(Stateful.class);
		if (stateful != null && !StringUtils.isEmpty(stateful.description())) {
			Object langValue = getLanguageValue((Map<String, Object>) container.get("statefulDescription"));
			updateAnnotationMemberValues(stateful, "description", langValue);
		}
	}

	@SuppressWarnings("unchecked")
	private void translateRestrictedInfo(ConfigurableComponent component, Map<String, Object> container) {
		final Restricted restricted = component.getClass().getAnnotation(Restricted.class);
		if (restricted != null && !StringUtils.isEmpty(restricted.value())) {
			Object langValue = getLanguageValue((Map<String, Object>) container.get("restrictedDescription"));
			updateAnnotationMemberValues(restricted, "value", langValue);
		}
	}

	private void translateInputRequirementInfo(ConfigurableComponent component, Map<String, Object> container) {
	}

	@SuppressWarnings("unchecked")
	private void translateSystemResourceConsiderationInfo(ConfigurableComponent component,
			Map<String, Object> container) {
		SystemResourceConsideration[] systemResourceConsiderations = component.getClass()
				.getAnnotationsByType(SystemResourceConsideration.class);
		if (systemResourceConsiderations.length > 0) {
			List<String> langValue = (List<String>) getLanguageValue(
					(Map<String, Object>) container.get("systemResourceConsiderations"));
			int i = 0;
			for (SystemResourceConsideration src : systemResourceConsiderations) {
				updateAnnotationMemberValues(src, "description", langValue.get(i++));
			}
		}
	}

	private void translateSeeAlso(ConfigurableComponent component, Map<String, Object> container) {
	}
}
