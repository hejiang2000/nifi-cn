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
package org.apache.nifi.schema.access;

import org.apache.nifi.serialization.record.RecordSchema;
import org.apache.nifi.serialization.record.SchemaIdentifier;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.when;

public class TestHortonworksEncodedSchemaReferenceStrategy extends AbstractSchemaAccessStrategyTest {

    @Test
    public void testGetSchemaWithValidEncoding() throws IOException, SchemaNotFoundException {
        final SchemaAccessStrategy schemaAccessStrategy = new HortonworksEncodedSchemaReferenceStrategy(schemaRegistry);

        final int protocol = 1;
        final long schemaId = 123456;
        final int version = 2;

        try (final ByteArrayOutputStream bytesOut = new ByteArrayOutputStream();
             final DataOutputStream out = new DataOutputStream(bytesOut)) {
            out.write(protocol);
            out.writeLong(schemaId);
            out.writeInt(version);
            out.flush();

            try (final ByteArrayInputStream in = new ByteArrayInputStream(bytesOut.toByteArray())) {

                // the confluent strategy will read the id from the input stream and use '1' as the version
                final SchemaIdentifier expectedSchemaIdentifier = SchemaIdentifier.builder()
                        .id(schemaId)
                        .version(version)
                        .build();

                when(schemaRegistry.retrieveSchema(argThat(new SchemaIdentifierMatcher(expectedSchemaIdentifier))))
                        .thenReturn(recordSchema);

                final RecordSchema retrievedSchema = schemaAccessStrategy.getSchema(Collections.emptyMap(), in, recordSchema);
                assertNotNull(retrievedSchema);
            }
        }
    }

    @Test
    public void testGetSchemaWithInvalidProtocol() throws IOException {
        final SchemaAccessStrategy schemaAccessStrategy = new HortonworksEncodedSchemaReferenceStrategy(schemaRegistry);

        final int protocol = 0; // use an invalid protocol
        final long schemaId = 123456;
        final int version = 2;

        try (final ByteArrayOutputStream bytesOut = new ByteArrayOutputStream();
             final DataOutputStream out = new DataOutputStream(bytesOut)) {
            out.write(protocol);
            out.writeLong(schemaId);
            out.writeInt(version);
            out.flush();

            try (final ByteArrayInputStream in = new ByteArrayInputStream(bytesOut.toByteArray())) {
                assertThrows(SchemaNotFoundException.class, () -> schemaAccessStrategy.getSchema(Collections.emptyMap(), in, recordSchema));
            }
        }
    }
}
