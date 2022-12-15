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
<div id="save-flow-version-dialog" layout="column" class="hidden large-dialog">
    <div class="dialog-content">
        <div class="setting">
            <div class="setting-name">数据流程版本注册库</div>
            <div class="setting-field">
                <div id="save-flow-version-registry-combo" class="hidden"></div>
                <div id="save-flow-version-registry" class="hidden"></div>
            </div>
        </div>
        <div class="setting">
            <div class="setting-name">Bucket</div>
            <div class="setting-field">
                <div id="save-flow-version-bucket-combo" class="hidden"></div>
                <div id="save-flow-version-bucket" class="hidden"></div>
            </div>
        </div>
        <div class="setting">
            <div class="setting-name">流程名称</div>
            <div id="save-flow-version-registry-container" class="setting-field">
                <span id="save-flow-version-process-group-id" class="hidden"></span>
                <span id="save-flow-version-action" class="hidden"></span>
                <input type="text" id="save-flow-version-name-field" class="setting-input hidden"/>
                <div id="save-flow-version-name" class="hidden"></div>
                <div id="save-flow-version-label"></div>
            </div>
        </div>
        <div class="setting">
            <div class="setting-name">流程描述</div>
            <div class="setting-field">
                <textarea id="save-flow-version-description-field" class="setting-input hidden"></textarea>
                <div id="save-flow-version-description" class="hidden"></div>
            </div>
        </div>
        <div class="setting">
            <div class="setting-name">版本说明</div>
            <div class="setting-field">
                <textarea id="save-flow-version-change-comments" class="setting-input"></textarea>
            </div>
        </div>
    </div>
</div>