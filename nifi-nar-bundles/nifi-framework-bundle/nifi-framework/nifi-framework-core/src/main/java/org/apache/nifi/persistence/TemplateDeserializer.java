/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.nifi.persistence;

import org.apache.nifi.controller.serialization.FlowSerializationException;
import org.apache.nifi.web.api.dto.TemplateDTO;
import org.apache.nifi.xml.processing.ProcessingException;
import org.apache.nifi.xml.processing.stream.StandardXMLStreamReaderProvider;
import org.apache.nifi.xml.processing.stream.XMLStreamReaderProvider;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBElement;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;
import javax.xml.stream.XMLStreamReader;
import javax.xml.transform.stream.StreamSource;
import java.io.InputStream;

public class TemplateDeserializer {

    private static final JAXBContext jaxbContext;

    static {
        try {
            jaxbContext = JAXBContext.newInstance(TemplateDTO.class);
        } catch (final JAXBException e) {
            throw new RuntimeException("Cannot create JAXBContext for serializing templates", e);
        }
    }

    public static TemplateDTO deserialize(final InputStream inStream) {
       return deserialize(new StreamSource(inStream));
    }

    public static TemplateDTO deserialize(final StreamSource source) {
        final XMLStreamReaderProvider provider = new StandardXMLStreamReaderProvider();

        try {
            final XMLStreamReader xsr = provider.getStreamReader(source);
            final Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
            final JAXBElement<TemplateDTO> templateElement = unmarshaller.unmarshal(xsr, TemplateDTO.class);
            final TemplateDTO templateDto = templateElement.getValue();

            return templateDto;
        } catch (final JAXBException | ProcessingException e) {
            throw new FlowSerializationException(e);
        }
    }


}
