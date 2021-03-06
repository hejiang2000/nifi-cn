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
package org.apache.nifi.processors.hive;

import org.apache.avro.Schema;
import org.apache.avro.file.DataFileStream;
import org.apache.avro.file.DataFileWriter;
import org.apache.avro.generic.GenericData;
import org.apache.avro.generic.GenericDatumReader;
import org.apache.avro.generic.GenericDatumWriter;
import org.apache.avro.generic.GenericRecord;
import org.apache.avro.io.DatumReader;
import org.apache.avro.io.DatumWriter;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.hive.ql.io.orc.NiFiOrcUtils;
import org.apache.hadoop.hive.ql.io.orc.OrcFile;
import org.apache.hadoop.hive.ql.io.orc.OrcStruct;
import org.apache.hadoop.hive.ql.io.orc.Reader;
import org.apache.hadoop.hive.ql.io.orc.RecordReader;
import org.apache.hadoop.hive.serde2.io.HiveDecimalWritable;
import org.apache.hadoop.hive.serde2.objectinspector.StructObjectInspector;
import org.apache.hadoop.hive.serde2.typeinfo.TypeInfo;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.nifi.flowfile.attributes.CoreAttributes;
import org.apache.nifi.util.MockFlowFile;
import org.apache.nifi.util.TestRunner;
import org.apache.nifi.util.TestRunners;
import org.apache.nifi.util.orc.TestNiFiOrcUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;


/**
 * Unit tests for ConvertAvroToORC processor
 */
public class TestConvertAvroToORC {

    private ConvertAvroToORC processor;
    private TestRunner runner;

    @BeforeEach
    public void setUp() throws Exception {
        processor = new ConvertAvroToORC();
        runner = TestRunners.newTestRunner(processor);
    }

    @Test
    public void test_onTrigger_routing_to_failure_null_type() throws Exception {
        String testString = "Hello World";
        GenericData.Record record = TestNiFiOrcUtils.buildAvroRecordWithNull(testString);

        DatumWriter<GenericData.Record> writer = new GenericDatumWriter<>(record.getSchema());
        DataFileWriter<GenericData.Record> fileWriter = new DataFileWriter<>(writer);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        fileWriter.create(record.getSchema(), out);
        fileWriter.append(record);
        fileWriter.flush();
        fileWriter.close();
        out.close();

        Map<String, String> attributes = new HashMap<String, String>() {{
            put(CoreAttributes.FILENAME.key(), "test.avro");
        }};
        runner.enqueue(out.toByteArray(), attributes);
        runner.run();

        runner.assertAllFlowFilesTransferred(ConvertAvroToORC.REL_SUCCESS, 1);
        MockFlowFile resultFlowFile = runner.getFlowFilesForRelationship(ConvertAvroToORC.REL_SUCCESS).get(0);
        assertEquals("test.orc", resultFlowFile.getAttribute(CoreAttributes.FILENAME.key()));
        assertEquals("CREATE EXTERNAL TABLE IF NOT EXISTS test_record (string STRING, null BOOLEAN) STORED AS ORC",
                resultFlowFile.getAttribute(ConvertAvroToORC.HIVE_DDL_ATTRIBUTE));
    }

    @Test
    public void test_onTrigger_routing_to_failure_empty_array_type() throws Exception {
        String testString = "Hello World";
        GenericData.Record record = TestNiFiOrcUtils.buildAvroRecordWithEmptyArray(testString);

        DatumWriter<GenericData.Record> writer = new GenericDatumWriter<>(record.getSchema());
        DataFileWriter<GenericData.Record> fileWriter = new DataFileWriter<>(writer);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        fileWriter.create(record.getSchema(), out);
        fileWriter.append(record);
        fileWriter.flush();
        fileWriter.close();
        out.close();

        Map<String, String> attributes = new HashMap<String, String>() {{
            put(CoreAttributes.FILENAME.key(), "test.avro");
        }};
        runner.enqueue(out.toByteArray(), attributes);
        runner.run();

        runner.assertAllFlowFilesTransferred(ConvertAvroToORC.REL_SUCCESS, 1);
        MockFlowFile resultFlowFile = runner.getFlowFilesForRelationship(ConvertAvroToORC.REL_SUCCESS).get(0);
        assertEquals("test.orc", resultFlowFile.getAttribute(CoreAttributes.FILENAME.key()));
        assertEquals("CREATE EXTERNAL TABLE IF NOT EXISTS test_record (string STRING, emptyArray ARRAY<BOOLEAN>) STORED AS ORC",
                resultFlowFile.getAttribute(ConvertAvroToORC.HIVE_DDL_ATTRIBUTE));
    }

    @Test
    public void test_onTrigger_routing_to_failure_fixed_type() throws Exception {
        String testString = "Hello!";
        GenericData.Record record = TestNiFiOrcUtils.buildAvroRecordWithFixed(testString);

        DatumWriter<GenericData.Record> writer = new GenericDatumWriter<>(record.getSchema());
        DataFileWriter<GenericData.Record> fileWriter = new DataFileWriter<>(writer);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        fileWriter.create(record.getSchema(), out);
        fileWriter.append(record);
        fileWriter.flush();
        fileWriter.close();
        out.close();

        Map<String, String> attributes = new HashMap<String, String>() {{
            put(CoreAttributes.FILENAME.key(), "test.avro");
        }};
        runner.enqueue(out.toByteArray(), attributes);
        runner.run();

        runner.assertAllFlowFilesTransferred(ConvertAvroToORC.REL_FAILURE, 1);
        MockFlowFile resultFlowFile = runner.getFlowFilesForRelationship(ConvertAvroToORC.REL_FAILURE).get(0);
        assertEquals("test.avro", resultFlowFile.getAttribute(CoreAttributes.FILENAME.key()));

        final InputStream in = new ByteArrayInputStream(resultFlowFile.toByteArray());
        final DatumReader<GenericRecord> datumReader = new GenericDatumReader<>();
        try (DataFileStream<GenericRecord> dataFileReader = new DataFileStream<>(in, datumReader)) {
            assertTrue(dataFileReader.hasNext());
            GenericRecord testedRecord = dataFileReader.next();

            assertNotNull(testedRecord.get("fixed"));
            assertArrayEquals(testString.getBytes(StandardCharsets.UTF_8), ((GenericData.Fixed) testedRecord.get("fixed")).bytes());
        }
    }

    @Test
    public void test_onTrigger_primitive_record() throws Exception {
        GenericData.Record record = TestNiFiOrcUtils.buildPrimitiveAvroRecord(10, 20L, true, 30.0f, 40, StandardCharsets.UTF_8.encode("Hello"), "World");

        DatumWriter<GenericData.Record> writer = new GenericDatumWriter<>(record.getSchema());
        DataFileWriter<GenericData.Record> fileWriter = new DataFileWriter<>(writer);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        fileWriter.create(record.getSchema(), out);
        fileWriter.append(record);
        // Put another record in
        record = TestNiFiOrcUtils.buildPrimitiveAvroRecord(1, 2L, false, 3.0f, 4L, StandardCharsets.UTF_8.encode("I am"), "another record");
        fileWriter.append(record);
        // And one more
        record = TestNiFiOrcUtils.buildPrimitiveAvroRecord(100, 200L, true, 300.0f, 400L, StandardCharsets.UTF_8.encode("Me"), "too!");
        fileWriter.append(record);
        fileWriter.flush();
        fileWriter.close();
        out.close();
        Map<String, String> attributes = new HashMap<String, String>() {{
            put(CoreAttributes.FILENAME.key(), "test.avro");
        }};
        runner.enqueue(out.toByteArray(), attributes);
        runner.run();

        runner.assertAllFlowFilesTransferred(ConvertAvroToORC.REL_SUCCESS, 1);

        // Write the flow file out to disk, since the ORC Reader needs a path
        MockFlowFile resultFlowFile = runner.getFlowFilesForRelationship(ConvertAvroToORC.REL_SUCCESS).get(0);
        assertEquals("CREATE EXTERNAL TABLE IF NOT EXISTS test_record (int INT, long BIGINT, boolean BOOLEAN, float FLOAT, double DOUBLE, bytes BINARY, string STRING)"
                + " STORED AS ORC", resultFlowFile.getAttribute(ConvertAvroToORC.HIVE_DDL_ATTRIBUTE));
        assertEquals("3", resultFlowFile.getAttribute(ConvertAvroToORC.RECORD_COUNT_ATTRIBUTE));
        assertEquals("test.orc", resultFlowFile.getAttribute(CoreAttributes.FILENAME.key()));
        byte[] resultContents = runner.getContentAsByteArray(resultFlowFile);
        FileOutputStream fos = new FileOutputStream("target/test1.orc");
        fos.write(resultContents);
        fos.flush();
        fos.close();

        Configuration conf = new Configuration();
        FileSystem fs = FileSystem.getLocal(conf);
        Reader reader = OrcFile.createReader(new Path("target/test1.orc"), OrcFile.readerOptions(conf).filesystem(fs));
        RecordReader rows = reader.rows();
        Object o = rows.next(null);
        assertNotNull(o);
        assertTrue(o instanceof OrcStruct);
        TypeInfo resultSchema = TestNiFiOrcUtils.buildPrimitiveOrcSchema();
        StructObjectInspector inspector = (StructObjectInspector) OrcStruct.createObjectInspector(resultSchema);

        // Check some fields in the first row
        Object intFieldObject = inspector.getStructFieldData(o, inspector.getStructFieldRef("int"));
        assertTrue(intFieldObject instanceof IntWritable);
        assertEquals(10, ((IntWritable) intFieldObject).get());
        Object stringFieldObject = inspector.getStructFieldData(o, inspector.getStructFieldRef("string"));
        assertTrue(stringFieldObject instanceof Text);
        assertEquals("World", stringFieldObject.toString());

    }

    @Test
    public void test_onTrigger_complex_record() throws Exception {

        Map<String, Double> mapData1 = new TreeMap<String, Double>() {{
            put("key1", 1.0);
            put("key2", 2.0);
        }};

        BigDecimal sampleBigDecimal = new BigDecimal("12.34");
        ByteBuffer bigDecimalAsBytes = ByteBuffer.wrap(sampleBigDecimal.unscaledValue().toByteArray());
        GenericData.Record record = TestNiFiOrcUtils.buildComplexAvroRecord(10, mapData1, "DEF", 3.0f, Arrays.asList(10, 20), bigDecimalAsBytes);

        DatumWriter<GenericData.Record> writer = new GenericDatumWriter<>(record.getSchema());
        DataFileWriter<GenericData.Record> fileWriter = new DataFileWriter<>(writer);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        fileWriter.create(record.getSchema(), out);
        fileWriter.append(record);

        // Put another record in
        Map<String, Double> mapData2 = new TreeMap<String, Double>() {{
            put("key1", 3.0);
            put("key2", 4.0);
        }};

        record = TestNiFiOrcUtils.buildComplexAvroRecord(null, mapData2, "XYZ", 4L, Arrays.asList(100, 200), bigDecimalAsBytes);
        fileWriter.append(record);

        fileWriter.flush();
        fileWriter.close();
        out.close();

        Map<String, String> attributes = new HashMap<String, String>() {{
            put(CoreAttributes.FILENAME.key(), "test");
        }};
        runner.enqueue(out.toByteArray(), attributes);
        runner.run();

        runner.assertAllFlowFilesTransferred(ConvertAvroToORC.REL_SUCCESS, 1);

        // Write the flow file out to disk, since the ORC Reader needs a path
        MockFlowFile resultFlowFile = runner.getFlowFilesForRelationship(ConvertAvroToORC.REL_SUCCESS).get(0);
        assertEquals("CREATE EXTERNAL TABLE IF NOT EXISTS complex_record " +
                "(myInt INT, myMap MAP<STRING, DOUBLE>, myEnum STRING, myLongOrFloat UNIONTYPE<BIGINT, FLOAT>, myIntList ARRAY<INT>, myDecimal DECIMAL(10,2))"
                + " STORED AS ORC", resultFlowFile.getAttribute(ConvertAvroToORC.HIVE_DDL_ATTRIBUTE));
        assertEquals("2", resultFlowFile.getAttribute(ConvertAvroToORC.RECORD_COUNT_ATTRIBUTE));
        assertEquals("test.orc", resultFlowFile.getAttribute(CoreAttributes.FILENAME.key()));
        byte[] resultContents = runner.getContentAsByteArray(resultFlowFile);
        FileOutputStream fos = new FileOutputStream("target/test1.orc");
        fos.write(resultContents);
        fos.flush();
        fos.close();

        Configuration conf = new Configuration();
        FileSystem fs = FileSystem.getLocal(conf);
        Reader reader = OrcFile.createReader(new Path("target/test1.orc"), OrcFile.readerOptions(conf).filesystem(fs));
        RecordReader rows = reader.rows();
        Object o = rows.next(null);
        assertNotNull(o);
        assertTrue(o instanceof OrcStruct);
        TypeInfo resultSchema = TestNiFiOrcUtils.buildComplexOrcSchema();
        StructObjectInspector inspector = (StructObjectInspector) OrcStruct.createObjectInspector(resultSchema);

        // Check some fields in the first row
        Object intFieldObject = inspector.getStructFieldData(o, inspector.getStructFieldRef("myInt"));
        assertTrue(intFieldObject instanceof IntWritable);
        assertEquals(10, ((IntWritable) intFieldObject).get());

        Object mapFieldObject = inspector.getStructFieldData(o, inspector.getStructFieldRef("myMap"));
        assertTrue(mapFieldObject instanceof Map);
        Map map = (Map) mapFieldObject;
        Object mapValue = map.get(new Text("key1"));
        assertNotNull(mapValue);
        assertTrue(mapValue instanceof DoubleWritable);
        assertEquals(1.0, ((DoubleWritable) mapValue).get(), Double.MIN_VALUE);

        mapValue = map.get(new Text("key2"));
        assertNotNull(mapValue);
        assertTrue(mapValue instanceof DoubleWritable);
        assertEquals(2.0, ((DoubleWritable) mapValue).get(), Double.MIN_VALUE);

        Object decimalFieldObject = inspector.getStructFieldData(o, inspector.getStructFieldRef("myDecimal"));
        assertTrue(decimalFieldObject instanceof HiveDecimalWritable);
        assertEquals(sampleBigDecimal, ((HiveDecimalWritable) decimalFieldObject).getHiveDecimal().bigDecimalValue());
    }

    @Test
    public void test_onTrigger_complex_records_with_bigdecimals() throws Exception {

        Map<String, Double> mapData1 = new TreeMap<String, Double>() {{
            put("key1", 1.0);
            put("key2", 2.0);
        }};


        BigDecimal sampleBigDecimal1 = new BigDecimal("3500.12");
        BigDecimal sampleBigDecimal2 = new BigDecimal("0.01");

        GenericData.Record record1 = TestNiFiOrcUtils.buildComplexAvroRecord(null, mapData1, "XYZ", 4L, Arrays.asList(100, 200), toByteBuffer(sampleBigDecimal1));
        DatumWriter<GenericData.Record> writer = new GenericDatumWriter<>(record1.getSchema());
        DataFileWriter<GenericData.Record> fileWriter = new DataFileWriter<>(writer);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        fileWriter.create(record1.getSchema(), out);
        fileWriter.append(record1);
        fileWriter.append(TestNiFiOrcUtils.buildComplexAvroRecord(null, mapData1, "XYZ", 4L, Arrays.asList(100, 200), toByteBuffer(sampleBigDecimal2)));
        fileWriter.flush();
        fileWriter.close();
        out.close();

        Map<String, String> attributes = new HashMap<String, String>() {{
            put(CoreAttributes.FILENAME.key(), "test");
        }};
        runner.enqueue(out.toByteArray(), attributes);
        runner.run();

        runner.assertAllFlowFilesTransferred(ConvertAvroToORC.REL_SUCCESS, 1);

        // Write the flow file out to disk, since the ORC Reader needs a path
        MockFlowFile resultFlowFile = runner.getFlowFilesForRelationship(ConvertAvroToORC.REL_SUCCESS).get(0);
        assertEquals("2", resultFlowFile.getAttribute(ConvertAvroToORC.RECORD_COUNT_ATTRIBUTE));
        assertEquals("test.orc", resultFlowFile.getAttribute(CoreAttributes.FILENAME.key()));
        byte[] resultContents = runner.getContentAsByteArray(resultFlowFile);
        FileOutputStream fos = new FileOutputStream("target/test1.orc");
        fos.write(resultContents);
        fos.flush();
        fos.close();

        Configuration conf = new Configuration();
        FileSystem fs = FileSystem.getLocal(conf);
        Reader reader = OrcFile.createReader(new Path("target/test1.orc"), OrcFile.readerOptions(conf).filesystem(fs));
        RecordReader rows = reader.rows();
        TypeInfo resultSchema = TestNiFiOrcUtils.buildComplexOrcSchema();
        StructObjectInspector inspector = (StructObjectInspector) OrcStruct.createObjectInspector(resultSchema);

        Object result1 = rows.next(null);
        assertNotNull(result1);
        Object decimalFieldObject1 = inspector.getStructFieldData(result1, inspector.getStructFieldRef("myDecimal"));
        assertEquals(sampleBigDecimal1, ((HiveDecimalWritable) decimalFieldObject1).getHiveDecimal().bigDecimalValue());

        Object result2 = rows.next(null);
        assertNotNull(result2);
        Object decimalFieldObject2 = inspector.getStructFieldData(result2, inspector.getStructFieldRef("myDecimal"));
        assertEquals(sampleBigDecimal2, ((HiveDecimalWritable) decimalFieldObject2).getHiveDecimal().bigDecimalValue());
    }

    private ByteBuffer toByteBuffer(BigDecimal sampleBigDecimal) {
        return ByteBuffer.wrap(sampleBigDecimal.unscaledValue().toByteArray());
    }

    @Test
    public void test_onTrigger_array_of_records() throws Exception {
        final Schema schema = new Schema.Parser().parse(new File("src/test/resources/array_of_records.avsc"));
        List<GenericRecord> innerRecords = new LinkedList<>();

        final GenericRecord outerRecord = new GenericData.Record(schema);

        Schema arraySchema = schema.getField("records").schema();
        Schema innerRecordSchema = arraySchema.getElementType();
        final GenericRecord innerRecord1 = new GenericData.Record(innerRecordSchema);
        innerRecord1.put("name", "Joe");
        innerRecord1.put("age", 42);

        innerRecords.add(innerRecord1);

        final GenericRecord innerRecord2 = new GenericData.Record(innerRecordSchema);
        innerRecord2.put("name", "Mary");
        innerRecord2.put("age", 28);

        innerRecords.add(innerRecord2);

        GenericData.Array<GenericRecord> array = new GenericData.Array<>(arraySchema, innerRecords);
        outerRecord.put("records", array);

        final DatumWriter<GenericRecord> datumWriter = new GenericDatumWriter<>(schema);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (DataFileWriter<GenericRecord> dataFileWriter = new DataFileWriter<>(datumWriter)) {
            dataFileWriter.create(schema, out);
            dataFileWriter.append(outerRecord);
        }
        out.close();

        // Build a flow file from the Avro record
        Map<String, String> attributes = new HashMap<String, String>() {{
            put(CoreAttributes.FILENAME.key(), "test");
        }};
        runner.enqueue(out.toByteArray(), attributes);
        runner.run();

        runner.assertAllFlowFilesTransferred(ConvertAvroToORC.REL_SUCCESS, 1);

        // Write the flow file out to disk, since the ORC Reader needs a path
        MockFlowFile resultFlowFile = runner.getFlowFilesForRelationship(ConvertAvroToORC.REL_SUCCESS).get(0);
        assertEquals("CREATE EXTERNAL TABLE IF NOT EXISTS org_apache_nifi_outer_record " +
                "(records ARRAY<STRUCT<name:STRING, age:INT>>)"
                + " STORED AS ORC", resultFlowFile.getAttribute(ConvertAvroToORC.HIVE_DDL_ATTRIBUTE));
        assertEquals("1", resultFlowFile.getAttribute(ConvertAvroToORC.RECORD_COUNT_ATTRIBUTE));
        assertEquals("test.orc", resultFlowFile.getAttribute(CoreAttributes.FILENAME.key()));
        byte[] resultContents = runner.getContentAsByteArray(resultFlowFile);
        FileOutputStream fos = new FileOutputStream("target/test1.orc");
        fos.write(resultContents);
        fos.flush();
        fos.close();

        Configuration conf = new Configuration();
        FileSystem fs = FileSystem.getLocal(conf);
        Reader reader = OrcFile.createReader(new Path("target/test1.orc"), OrcFile.readerOptions(conf).filesystem(fs));
        RecordReader rows = reader.rows();
        Object o = rows.next(null);
        assertNotNull(o);
        assertTrue(o instanceof OrcStruct);
        StructObjectInspector inspector = (StructObjectInspector) OrcStruct.createObjectInspector(NiFiOrcUtils.getOrcField(schema));

        // Verify the record contains an array
        Object arrayFieldObject = inspector.getStructFieldData(o, inspector.getStructFieldRef("records"));
        assertTrue(arrayFieldObject instanceof ArrayList);
        ArrayList<?> arrayField = (ArrayList<?>) arrayFieldObject;
        assertEquals(2, arrayField.size());

        // Verify the first element. Should be a record with two fields "name" and "age"
        Object element = arrayField.get(0);
        assertTrue(element instanceof OrcStruct);
        StructObjectInspector elementInspector = (StructObjectInspector) OrcStruct.createObjectInspector(NiFiOrcUtils.getOrcField(innerRecordSchema));
        Object nameObject = elementInspector.getStructFieldData(element, elementInspector.getStructFieldRef("name"));
        assertTrue(nameObject instanceof Text);
        assertEquals("Joe", nameObject.toString());
        Object ageObject = elementInspector.getStructFieldData(element, elementInspector.getStructFieldRef("age"));
        assertTrue(ageObject instanceof IntWritable);
        assertEquals(42, ((IntWritable) ageObject).get());

        // Verify the first element. Should be a record with two fields "name" and "age"
        element = arrayField.get(1);
        assertTrue(element instanceof OrcStruct);
        nameObject = elementInspector.getStructFieldData(element, elementInspector.getStructFieldRef("name"));
        assertTrue(nameObject instanceof Text);
        assertEquals("Mary", nameObject.toString());
        ageObject = elementInspector.getStructFieldData(element, elementInspector.getStructFieldRef("age"));
        assertTrue(ageObject instanceof IntWritable);
        assertEquals(28, ((IntWritable) ageObject).get());
    }

    @Test
    public void test_onTrigger_nested_complex_record() throws Exception {

        Map<String, List<Double>> mapData1 = new TreeMap<String, List<Double>>() {{
            put("key1", Arrays.asList(1.0, 2.0));
            put("key2", Arrays.asList(3.0, 4.0));
        }};

        Map<String, String> arrayMap11 = new TreeMap<String, String>() {{
            put("key1", "v1");
            put("key2", "v2");
        }};
        Map<String, String> arrayMap12 = new TreeMap<String, String>() {{
            put("key3", "v3");
            put("key4", "v4");
        }};

        GenericData.Record record = TestNiFiOrcUtils.buildNestedComplexAvroRecord(mapData1, Arrays.asList(arrayMap11, arrayMap12));

        DatumWriter<GenericData.Record> writer = new GenericDatumWriter<>(record.getSchema());
        DataFileWriter<GenericData.Record> fileWriter = new DataFileWriter<>(writer);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        fileWriter.create(record.getSchema(), out);
        fileWriter.append(record);

        // Put another record in
        Map<String, List<Double>> mapData2 = new TreeMap<String, List<Double>>() {{
            put("key1", Arrays.asList(-1.0, -2.0));
            put("key2", Arrays.asList(-3.0, -4.0));
        }};

        Map<String, String> arrayMap21 = new TreeMap<String, String>() {{
            put("key1", "v-1");
            put("key2", "v-2");
        }};
        Map<String, String> arrayMap22 = new TreeMap<String, String>() {{
            put("key3", "v-3");
            put("key4", "v-4");
        }};

        record = TestNiFiOrcUtils.buildNestedComplexAvroRecord(mapData2, Arrays.asList(arrayMap21, arrayMap22));
        fileWriter.append(record);

        fileWriter.flush();
        fileWriter.close();
        out.close();

        Map<String, String> attributes = new HashMap<String, String>() {{
            put(CoreAttributes.FILENAME.key(), "test");
        }};
        runner.enqueue(out.toByteArray(), attributes);
        runner.run();

        runner.assertAllFlowFilesTransferred(ConvertAvroToORC.REL_SUCCESS, 1);

        // Write the flow file out to disk, since the ORC Reader needs a path
        MockFlowFile resultFlowFile = runner.getFlowFilesForRelationship(ConvertAvroToORC.REL_SUCCESS).get(0);
        assertEquals("CREATE EXTERNAL TABLE IF NOT EXISTS nested_complex_record " +
                "(myMapOfArray MAP<STRING, ARRAY<DOUBLE>>, myArrayOfMap ARRAY<MAP<STRING, STRING>>)"
                + " STORED AS ORC", resultFlowFile.getAttribute(ConvertAvroToORC.HIVE_DDL_ATTRIBUTE));
        assertEquals("2", resultFlowFile.getAttribute(ConvertAvroToORC.RECORD_COUNT_ATTRIBUTE));
        assertEquals("test.orc", resultFlowFile.getAttribute(CoreAttributes.FILENAME.key()));
        byte[] resultContents = runner.getContentAsByteArray(resultFlowFile);
        FileOutputStream fos = new FileOutputStream("target/test1.orc");
        fos.write(resultContents);
        fos.flush();
        fos.close();

        Configuration conf = new Configuration();
        FileSystem fs = FileSystem.getLocal(conf);
        Reader reader = OrcFile.createReader(new Path("target/test1.orc"), OrcFile.readerOptions(conf).filesystem(fs));
        RecordReader rows = reader.rows();
        Object o = rows.next(null);
        assertNotNull(o);
        assertTrue(o instanceof OrcStruct);
        TypeInfo resultSchema = TestNiFiOrcUtils.buildNestedComplexOrcSchema();
        StructObjectInspector inspector = (StructObjectInspector) OrcStruct.createObjectInspector(resultSchema);


        // check values
        Object myMapOfArray = inspector.getStructFieldData(o, inspector.getStructFieldRef("myMapOfArray"));
        assertTrue(myMapOfArray instanceof Map);
        Map map = (Map) myMapOfArray;
        Object mapValue = map.get(new Text("key1"));
        assertNotNull(mapValue);
        assertTrue(mapValue instanceof List);
        assertEquals(Arrays.asList(new DoubleWritable(1.0), new DoubleWritable(2.0)), mapValue);

        Object myArrayOfMap = inspector.getStructFieldData(o, inspector.getStructFieldRef("myArrayOfMap"));
        assertTrue(myArrayOfMap instanceof List);
        List list = (List) myArrayOfMap;
        Object el0 = list.get(0);
        assertNotNull(el0);
        assertTrue(el0 instanceof Map);
        assertEquals(new Text("v1"), ((Map) el0).get(new Text("key1")));
    }
}
