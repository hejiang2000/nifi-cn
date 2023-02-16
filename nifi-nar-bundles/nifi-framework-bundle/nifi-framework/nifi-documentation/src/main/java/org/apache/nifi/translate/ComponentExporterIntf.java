package org.apache.nifi.translate;

import java.io.File;
import java.io.IOException;

import org.apache.nifi.bundle.BundleCoordinate;
import org.apache.nifi.components.ConfigurableComponent;

public interface ComponentExporterIntf {

	void export(final Class<? extends ConfigurableComponent> componentClass, final File translationDir,
			final BundleCoordinate bundleCoordinate) throws IOException;
}
