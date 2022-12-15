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
<div id="settings" class="hidden">
    <div id="settings-header-text" class="settings-header-text">NiFi 系统设置</div>
    <div class="settings-container">
        <div>
            <div id="settings-tabs" class="settings-tabs tab-container"></div>
            <div class="clear"></div>
        </div>
        <div id="settings-tabs-content">
            <button id="new-service-or-task" class="add-button fa fa-plus" title="创建新报告任务控制器服务" style="display: block;"></button>
            <div id="general-settings-tab-content" class="configuration-tab">
                <div id="general-settings">
                    <div class="setting">
                        <div class="setting-name">
                            最大定时执行线程数
                            <div class="fa fa-question-circle" alt="Info" title="系统内定时驱动最大执行线程数."></div>
                        </div>
                        <div class="editable setting-field">
                            <input type="text" id="maximum-timer-driven-thread-count-field" class="setting-input"/>
                        </div>
                        <div class="read-only setting-field">
                            <span id="read-only-maximum-timer-driven-thread-count-field"></span>
                        </div>
                    </div>
                    <div class="setting">
                        <div class="setting-name">
                            最大事件执行线程数
                            <div class="fa fa-question-circle" alt="Info" title="系统内事件驱动最大执行线程数."></div>
                        </div>
                        <div class="editable setting-field">
                            <input type="text" id="maximum-event-driven-thread-count-field" class="setting-input"/>
                        </div>
                        <div class="read-only setting-field">
                            <span id="read-only-maximum-event-driven-thread-count-field"></span>
                        </div>
                    </div>
                    <div class="editable settings-buttons">
                        <div id="settings-save" class="button">应用</div>
                        <div class="clear"></div>
                    </div>
                </div>
            </div>
            <div id="controller-services-tab-content" class="configuration-tab controller-settings-table">
                <div id="controller-services-table" class="settings-table"></div>
            </div>
            <div id="reporting-tasks-tab-content" class="configuration-tab controller-settings-table">
                <div id="reporting-tasks-table" class="settings-table"></div>
            </div>
            <div id="registries-tab-content" class="configuration-tab controller-settings-table">
                <div class="registry-properties"></div>
                <div id="registries-table" class="settings-table"></div>
            </div>
            <div id="parameter-providers-tab-content" class="configuration-tab controller-settings-table">
                <div id="parameter-providers-table" class="settings-table"></div>
            </div>
        </div>
    </div>
    <div id="settings-refresh-container">
        <button id="settings-refresh-button" class="refresh-button pointer fa fa-refresh" title="刷新"></button>
        <div id="settings-last-refreshed-container" class="last-refreshed-container">
            最后更新:&nbsp;<span id="settings-last-refreshed" class="value-color"></span>
        </div>
        <div id="settings-loading-container" class="loading-container"></div>
        <div id="controller-cs-availability" class="hidden">对所有报告任务、注册库客户端、参数提供者可用的服务列表，以及定义在控制器设置中的其他服务.</div>
        <div class="clear"></div>
    </div>
</div>
