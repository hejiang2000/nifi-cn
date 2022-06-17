<%--
 Licensed to the Apache Software Foundation (ASF) under one or more
  contributor license agreements.  See the NOTICE file distributed with
  this work for additional information regarding copyright ownership.
  The ASF licenses this file to You under the Apache License, Version 2.0
  (the "License"); you may not use this file except in compliance with
  the License.  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
--%>
<%@ page contentType="text/html" pageEncoding="UTF-8" session="false" %>
<div id="provenance-search-dialog" class="hidden medium-dialog">
    <div class="dialog-content">
        <div class="setting">
            <div class="setting-field">
                <div id="searchable-fields-container">
                    <div id="no-searchable-fields" class="unset">未配置可搜索字段.</div>
                </div>
            </div>
        </div>
        <div class="setting">
            <div class="start-date-setting">
                <div class="setting-name">
                    启动日期
                    <div class="fa fa-question-circle" title="起始日期格式为 'mm/dd/yyyy'. 您必须同时指定起始时间."></div>
                </div>
                <div class="setting-field">
                    <input type="text" id="provenance-search-start-date" class="provenance-small-input"/>
                </div>
            </div>
            <div class="start-time-setting">
                <div class="setting-name">
                    启动时间 (<span class="timezone"></span>)
                    <div class="fa fa-question-circle" title="起始时间格式为 'hh:mm:ss'. 您必须同时指定起始日期."></div>
                </div>
                <div class="setting-field">
                    <input type="text" id="provenance-search-start-time" class="provenance-time-input"/>
                </div>
            </div>
            <div class="clear"></div>
        </div>
        <div class="setting">
            <div class="end-date-setting">
                <div class="setting-name">
                    结束日期
                    <div class="fa fa-question-circle" title="结束日期格式为 'mm/dd/yyyy'. 您必须同时指定结束时间."></div>
                </div>
                <div class="setting-field">
                    <input type="text" id="provenance-search-end-date" class="provenance-small-input"/>
                </div>
            </div>
            <div class="end-time-setting">
                <div class="setting-name">
                    结束时间 (<span class="timezone"></span>)
                    <div class="fa fa-question-circle" title="结束时间格式为 'hh:mm:ss'. 您必须同时指定结束日期."></div>
                </div>
                <div class="setting-field">
                    <input type="text" id="provenance-search-end-time" class="provenance-time-input"/>
                </div>
            </div>
            <div class="clear"></div>
        </div>
        <div class="setting">
            <div class="end-date-setting">
                <div class="setting-name">
                    最小文件大小
                    <div class="fa fa-question-circle" title="最小文件大小 (例如 2 KB)."></div>
                </div>
                <div class="setting-field">
                    <input type="text" id="provenance-search-minimum-file-size" class="provenance-small-input"/>
                </div>
            </div>
            <div class="end-time-setting">
                <div class="setting-name">
                    最大文件大小
                    <div class="fa fa-question-circle" title="最大文件大小 (例如 4 GB)."></div>
                </div>
                <div class="setting-field">
                    <input type="text" id="provenance-search-maximum-file-size" class="provenance-time-input"/>
                </div>
            </div>
            <div class="clear"></div>
        </div>
        <div id="provenance-search-location-container" class="setting">
            <div class="setting-name">
                搜索位置
            </div>
            <div class="setting-field">
                <div id="provenance-search-location"></div>
            </div>
            <div class="clear"></div>
        </div>
    </div>
</div>
