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
<div id="new-processor-dialog" layout="column" class="hidden">
    <div class="dialog-content">
        <div layout="row" style="padding-bottom:0">
            <div flex="25" layout="row" layout-align="start center">
                <div class="setting-name" style="margin-top: 10px;">源组件</div>
            </div>
            <div flex layout="row" layout-align="space-between center" id="processor-type-filter-controls">
                <div id="processor-type-filter-status" class="filter-status">
                    显示&nbsp;<span id="displayed-processor-types"></span>,&nbsp;共&nbsp;<span
                        id="total-processor-types"></span>
                </div>
                <div id="processor-type-filter-container">
                    <input type="text" placeholder="Filter" id="processor-type-filter"/>
                </div>
            </div>
        </div>
        <div flex layout="row" style="padding-top:0;height: 90%;">
            <div flex="25" id="processor-tag-cloud-container">
                <div class="setting">
                    <div class="setting-field">
                        <div id="processor-bundle-group-combo"></div>
                    </div>
                </div>
                <div class="setting">
                    <div class="setting-field">
                        <div id="processor-tag-cloud"></div>
                    </div>
                </div>
            </div>
            <div layout="column" flex id="processor-types-container">
                <div id="processor-types-table" class="unselectable"></div>
                <div id="processor-type-container">
                    <div id="processor-type-name"></div>
                    <div id="processor-type-bundle"></div>
                </div>
                <div id="processor-description-container">
                    <div id="processor-type-description" class="ellipsis multiline"></div>
                    <span class="hidden" id="selected-processor-name"></span>
                    <span class="hidden" id="selected-processor-type"></span>
                </div>
            </div>
        </div>
    </div>
</div>
