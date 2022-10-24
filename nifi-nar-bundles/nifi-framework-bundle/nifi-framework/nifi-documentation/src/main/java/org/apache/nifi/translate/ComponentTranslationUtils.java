package org.apache.nifi.translate;

import java.io.File;

import org.apache.nifi.bundle.BundleCoordinate;
import org.apache.nifi.components.ConfigurableComponent;
import org.apache.nifi.controller.ControllerService;
import org.apache.nifi.nar.ExtensionDefinition;
import org.apache.nifi.nar.ExtensionManager;
import org.apache.nifi.processor.Processor;
import org.apache.nifi.reporting.ReportingTask;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ComponentTranslationUtils {

	private static final Logger logger = LoggerFactory.getLogger(ComponentTranslationUtils.class);
	public static final String DEFAULT_DOCS_I18N_COMPONENTS_DIRECTORY = "./docs/i18n/components";

	public static void translateConfigurableComponent(final ExtensionManager extensionManager,
			final ExtensionDefinition extensionDefinition, final BundleCoordinate bundleCoordinate) {
		final Class<?> extensionClass = extensionManager.getClass(extensionDefinition);
		final Class<? extends ConfigurableComponent> componentClass = extensionClass
				.asSubclass(ConfigurableComponent.class);

		final File translationDir = new File(DEFAULT_DOCS_I18N_COMPONENTS_DIRECTORY);
		final File componentFile = new File(translationDir, componentClass.getCanonicalName() + ".yaml");
		if (componentFile.exists()) {
			// 翻译组件信息
			logger.info("Translating {}", componentClass.getName());
			try {
				ComponentTranslationIntf translator = getComponentTranslator(extensionManager, componentClass);
				translator.translate(componentClass, translationDir, bundleCoordinate);
			} catch (Exception e) {
				logger.warn("Failed to translate {}", componentClass.getName());
			}
		} else {
			// 产生翻译文件
			logger.info("Exporting {}", componentClass.getName());
			try {
				translationDir.mkdirs();
				ComponentExporterIntf exporter = getComponentExporter(extensionManager, componentClass);
				exporter.export(componentClass, translationDir, bundleCoordinate);
			} catch (Exception e) {
				logger.warn("Failed to export {}", componentClass.getName());
			}
		}
	}

	protected static ComponentTranslationIntf getComponentTranslator(final ExtensionManager extensionManager,
			final Class<? extends ConfigurableComponent> componentClass) {
		final String lang = "zh";

		if (Processor.class.isAssignableFrom(componentClass)) {
			return new ProcessorComponentTranslator(extensionManager, lang);
		} else if (ControllerService.class.isAssignableFrom(componentClass)) {
			return new ConfigurableComponentTranslator(extensionManager, lang);
		} else if (ReportingTask.class.isAssignableFrom(componentClass)) {
			return new ConfigurableComponentTranslator(extensionManager, lang);
		}

		return null;
	}

	protected static ComponentExporterIntf getComponentExporter(final ExtensionManager extensionManager,
			final Class<? extends ConfigurableComponent> componentClass) {
		final String[] langs = new String[] { "en", "zh" };

		if (Processor.class.isAssignableFrom(componentClass)) {
			return new ProcessorComponentExporter(extensionManager, langs);
		} else if (ControllerService.class.isAssignableFrom(componentClass)) {
			return new ConfigurableComponentExporter(extensionManager, langs);
		} else if (ReportingTask.class.isAssignableFrom(componentClass)) {
			return new ConfigurableComponentExporter(extensionManager, langs);
		}

		return null;
	}
}
