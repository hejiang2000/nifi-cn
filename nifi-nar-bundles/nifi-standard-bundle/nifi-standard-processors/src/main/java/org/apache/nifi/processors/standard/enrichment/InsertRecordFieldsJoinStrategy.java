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

package org.apache.nifi.processors.standard.enrichment;

import org.apache.nifi.logging.ComponentLog;
import org.apache.nifi.record.path.FieldValue;
import org.apache.nifi.record.path.RecordPath;
import org.apache.nifi.record.path.RecordPathResult;
import org.apache.nifi.record.path.util.RecordPathCache;
import org.apache.nifi.serialization.record.Record;
import org.apache.nifi.serialization.record.RecordSchema;

import java.util.List;
import java.util.stream.Collectors;

public class InsertRecordFieldsJoinStrategy extends IndexCorrelatedJoinStrategy {
    private static final RecordPathCache recordPathCache = new RecordPathCache(100);
    private final RecordPath recordPath;

    public InsertRecordFieldsJoinStrategy(final ComponentLog logger, final String insertionRecordPath) {
        super(logger);
        recordPath = recordPathCache.getCompiled(insertionRecordPath);
    }

    @Override
    protected Record combineRecords(final Record originalRecord, final Record enrichmentRecord, final RecordSchema resultSchema) {
        if (originalRecord == null) {
            return null;
        }

        if (enrichmentRecord == null) {
            return originalRecord;
        }

        final RecordPathResult result = recordPath.evaluate(originalRecord);
        final List<FieldValue> fieldValues = result.getSelectedFields().collect(Collectors.toList());
        for (final FieldValue fieldValue : fieldValues) {
            final Object value = fieldValue.getValue();
            if (!(value instanceof Record)) {
                getLogger().debug("Did not find a Record after evaluating RecordPath {} but found {} instead", recordPath.getPath(), value);
                continue;
            }

            final Record parentRecord = (Record) value;
            enrichmentRecord.toMap().forEach(parentRecord::setValue);

            parentRecord.incorporateInactiveFields();
        }

        return originalRecord;
    }

    @Override
    protected RecordSchema createResultSchema(final Record firstOriginalRecord, final Record firstEnrichmentRecord) {
        final Record combined = combineRecords(firstOriginalRecord, firstEnrichmentRecord, firstOriginalRecord.getSchema());
        combined.incorporateInactiveFields();
        return combined.getSchema();
    }
}
