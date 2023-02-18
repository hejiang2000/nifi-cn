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
<div id="fetch-parameters-dialog" layout="column" class="hidden large-dialog">
    <div id="fetch-parameters-status-bar"></div>
    <div class="dialog-content">
        <%--settings-left--%>
        <div class="settings-left">
            <div id="fetch-parameters-provider-groups-container" class="setting">
                <div class="setting-name">名称</div>
                <div class="setting-field">
                    <span id="fetch-parameters-id" class="hidden"></span>
                    <div id="fetch-parameters-name"></div>
                    <div class="clear"></div>
                </div>
            </div>
            <div id="fetch-parameters-usage-container" class="setting">
                <div class="setting-name">
                    选择一个参数组开始配置
                    <div class="fa fa-question-circle" alt="Info" title="从该参数提供者发现的参数组. 选择一个组以创建参数上下文, 然后配置其参数敏感性."></div>
                </div>
                <div id="parameter-groups-table"></div>
            </div>
            <div id="apply-groups-container" class="setting hidden">
                <div class="setting-name">参数组</div>
                <div class="setting-field">
                    <div id="apply-groups-list"></div>
                </div>
            </div>
        </div>
        <%--end settings-left--%>

        <div class="spacer">&nbsp;</div>

        <%--settings-center--%>
        <div class="settings-center">
            <div id="parameters-container" class="setting">
                <div id="create-parameter-context-checkbox-container" class="setting-field"></div>
                <div id="fetched-parameters-container" class="setting">
                    <div class="setting-name">
                        获取到的参数
                        <div class="fa fa-question-circle" alt="Info" title="从选定参数组发现的参数."></div>
                    </div>
                    <div id="fetched-parameters-listing-container" class="setting-field">
                        <ol id="fetched-parameters-listing"></ol>
                    </div>
                </div>
                <div id="selectable-parameters-container" class="setting">
                    <div class="setting-name">
                        选择设置为敏感信息的参数
                        <div class="fa fa-question-circle" alt="Info" title="仅可修改未被引用的参数."></div>
                    </div>
                    <div id="selectable-parameters-buttons">
                        <button id="select-all-fetched-parameters" class="selectable-parameters-buttons">
                            <div class="fa fa-check-square-o"></div>
                            <span>Select all</span>
                        </button>
                        <button id="deselect-all-fetched-parameters" class="selectable-parameters-buttons">
                            <div class="fa fa-minus-square-o"></div>
                            <span>全不选中</span>
                        </button>
                        <div class="clear"></div>
                    </div>
                    <div id="selectable-parameters-table" class="setting-field"></div>
                </div>
            </div>
            <div id="fetch-parameters-update-status-container" class="setting">
                <div id="fetch-parameters-update-status" class="hidden">
                    <div class="setting">
                        <div class="setting-name">
                            更新参数步骤
                        </div>
                        <div class="setting-field">
                            <ol id="fetch-parameters-update-steps"></ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <%--end settings-center--%>

        <div class="spacer">&nbsp;</div>

        <%--settings-right--%>
        <div class="settings-right">
            <div class="setting">
                <div class="setting-name">
                    待创建的参数上下文
                    <div class="fa fa-question-circle" alt="Info" title="参数组集合待创建为参数上下文, 尚未生效."></div>
                </div>
                <div class="setting-field">
                    <div id="parameter-contexts-to-create-container" class="ellipsis"></div>
                </div>
            </div>
            <div class="setting">
                <div class="setting-name">
                    待更新的参数上下文
                    <div class="fa fa-question-circle" alt="Info" title="已同步参数上下文待更新, 尚未生效."></div>
                    <div class="referencing-components-loading"></div>
                </div>
                <div class="setting-field">
                    <div id="parameter-contexts-to-update-container" class="ellipsis"></div>
                </div>
            </div>

            <div id="fetch-parameters-referencing-components-container" class="setting hidden">
                <div class="setting-name">
                    引用组件
                    <div class="fa fa-question-circle" alt="Info" title="引用选定参数的组件."></div>
                    <div class="referencing-components-loading"></div>
                </div>
                <div id="fetch-parameter-referencing-components-container" class="setting-field">
                </div>
            </div>
            <div id="fetch-parameters-referencing-components-template" class="fetch-parameters-referencing-components-template hidden clear">
                <div class="setting">
                    <div class="setting-name">引用处理器
                    </div>
                    <div class="setting-field">
                        <ul class="fetch-parameters-referencing-processors"></ul>
                    </div>
                </div>
                <div class="setting">
                    <div class="setting-name">
                        引用控制器服务
                    </div>
                    <div class="setting-field">
                        <ul class="fetch-parameters-referencing-controller-services"></ul>
                    </div>
                </div>
                <div class="setting">
                    <div class="setting-name">
                        未授权的组件引用
                    </div>
                    <div class="setting-field">
                        <ul class="fetch-parameters-referencing-unauthorized-components"></ul>
                    </div>
                </div>
            </div>

            <div id="fetch-parameters-affected-referencing-components-container" class="setting">
                <div class="setting-name">
                    受影响的引用到的组件
                    <div class="fa fa-question-circle" alt="Info" title="受影响的引用到的参数提供者."></div>
                    <div class="referencing-components-loading"></div>
                </div>
                <div id="affected-referencing-components-container" class="setting-field">
                </div>
            </div>
            <div id="affected-referencing-components-template" class="affected-referencing-components-template hidden clear">
                <div class="setting">
                    <div class="setting-name">引用处理器
                    </div>
                    <div class="setting-field">
                        <ul class="fetch-parameters-referencing-processors"></ul>
                    </div>
                </div>
                <div class="setting">
                    <div class="setting-name">
                        引用控制器服务
                    </div>
                    <div class="setting-field">
                        <ul class="fetch-parameters-referencing-controller-services"></ul>
                    </div>
                </div>
                <div class="setting">
                    <div class="setting-name">
                        未授权的组件引用
                    </div>
                    <div class="setting-field">
                        <ul class="fetch-parameters-referencing-unauthorized-components"></ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <%--end settings-right--%>
    <div id="fetch-parameters-permissions-parameter-contexts-message" class="ellipsis fetch-parameters-dialog-message hidden">
        你没有权限修改部分已同步参数上下文.
    </div>
    <div id="fetch-parameters-permissions-affected-components-message" class="ellipsis fetch-parameters-dialog-message hidden">
        你没有权限修改部分受影响组件.
    </div>
    <div id="fetch-parameters-missing-context-name-message" class="ellipsis fetch-parameters-dialog-message hidden">
        没有参数上下文名称.
    </div>
    <div class="fetch-parameters-canceling hidden unset">
        正在取消...
    </div>
</div>
