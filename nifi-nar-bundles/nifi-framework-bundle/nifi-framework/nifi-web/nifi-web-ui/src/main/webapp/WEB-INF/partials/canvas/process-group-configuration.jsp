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
<div id="process-group-configuration">
    <div id="process-group-configuration-header-text" class="settings-header-text">处理组配置</div>
    <div class="settings-container">
        <div>
            <div id="process-group-configuration-tabs" class="settings-tabs tab-container"></div>
            <div class="clear"></div>
        </div>
        <div id="process-group-configuration-tabs-content">
            <button id="add-process-group-configuration-controller-service" class="add-button fa fa-plus" title="创建新控制器服务"></button>
            <div id="general-process-group-configuration-tab-content" class="configuration-tab">
                <div id="general-process-group-configuration">
                    <div class="setting">
                        <div class="setting-name">处理组名称</div>
                        <span id="process-group-id" class="hidden"></span>
                        <div class="editable setting-field">
                            <input type="text" id="process-group-name" class="setting-input"/>
                        </div>
                        <div class="read-only setting-field">
                            <span id="read-only-process-group-name" class="unset"></span>
                        </div>
                    </div>
                    <div class="setting">
                        <div class="setting-name">处理组参数上下文</div>
                        <div class="editable setting-field">
                            <div id="process-group-parameter-context-combo"></div>
                        </div>
                        <div class="read-only setting-field">
                            <span id="read-only-process-group-parameter-context" class="unset">未授权</span>
                        </div>
                    </div>
                    <div class="setting">
                        <div class="setting-name">处理组说明</div>
                        <div class="editable setting-field">
                            <textarea id="process-group-comments" class="setting-input"></textarea>
                        </div>
                        <div class="read-only setting-field">
                            <span id="read-only-process-group-comments" class="unset"></span>
                        </div>
                    </div>
                    <div class="setting">
                        <div class="setting-name">处理组 FlowFile 并行</div>
                        <div class="editable setting-field">
                            <div id="process-group-flowfile-concurrency-combo"></div>
                        </div>
                        <div class="read-only setting-field">
                            <span id="read-only-process-group-flowfile-concurrency" class="unset"></span>
                        </div>
                    </div>
                    <div class="setting">
                        <div class="setting-name">处理组数据输出策略</div>
                        <div class="editable setting-field">
                            <div id="process-group-outbound-policy-combo"></div>
                        </div>
                        <div class="read-only setting-field">
                            <span id="read-only-process-group-outbound-policy" class="unset"></span>
                        </div>
                    </div>
                    <div class="setting">
                        <div class="setting-name">默认 FlowFile 过期</div>
                        <div class="editable setting-field">
                            <input type="text" id="process-group-default-flowfile-expiration" class="setting-input"/>
                        </div>
                        <div class="read-only setting-field">
                            <span id="read-only-process-group-default-flowfile-expiration" class="unset"></span>
                        </div>
                    </div>
                    <div class="setting">
                        <div class="setting-name">默认背压对象数量阈值</div>
                        <div class="editable setting-field">
                            <input type="text" id="process-group-default-back-pressure-object-threshold" class="setting-input"/>
                        </div>
                        <div class="read-only setting-field">
                            <span id="read-only-process-group-default-back-pressure-object-threshold" class="unset"></span>
                        </div>
                    </div>
                    <div class="setting">
                        <div class="setting-name">默认背压数据量阈值</div>
                        <div class="editable setting-field">
                            <input type="text" id="process-group-default-back-pressure-data-size-threshold" class="setting-input"/>
                        </div>
                        <div class="read-only setting-field">
                            <span id="read-only-process-group-default-back-pressure-data-size-threshold" class="unset"></span>
                        </div>
                    </div>

                    <div class="editable settings-buttons">
                        <div id="process-group-configuration-save" class="button">应用</div>
                        <div class="clear"></div>
                    </div>
                </div>
            </div>
            <div id="process-group-controller-services-tab-content" class="configuration-tab">
                <div id="process-group-controller-services-table" class="settings-table"></div>
            </div>
        </div>
    </div>
    <div id="process-group-refresh-container">
        <button id="process-group-configuration-refresh-button" class="refresh-button pointer fa fa-refresh" title="刷新"></button>
        <div class="last-refreshed-container">
            最后更新:&nbsp;<span id="process-group-configuration-last-refreshed" class="last-refreshed"></span>
        </div>
        <div id="process-group-configuration-loading-container" class="loading-container"></div>
        <div id="flow-cs-availability" class="hidden">所列服务可被处理组内所有处理器和服务使用.</div>
        <div class="clear"></div>
    </div>
</div>
