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
<div id="component-state-dialog" layout="column" class="hidden large-dialog">
    <div class="dialog-content">
        <div class="setting">
            <div class="setting-name">名称</div>
            <div class="setting-field">
                <div id="component-state-name"></div>
            </div>
        </div>
        <div class="setting">
            <div class="setting-name">描述</div>
            <div id="component-state-description" class="ellipsis multiline"></div>
        </div>
        <div>
            <div id="component-state-partial-results-container" class="hidden">
                显示部分结果
            </div>
            <div id="component-state-filter-controls">
                <div id="component-state-filter-status" class="filter-status">
                    显示&nbsp;<span id="displayed-component-state-entries"></span>,&nbsp;共&nbsp;<span id="total-component-state-entries"></span>
                </div>
                <div id="component-state-filter-container">
                    <input type="text" id="component-state-filter" placeholder="Filter"/>
                </div>
            </div>
            <div class="clear"></div>
        </div>
        <div id="component-state-table"></div>
        <div id="clear-link-container">
            <span id="clear-link" class="link">清除状态</span>
        </div>
    </div>
</div>