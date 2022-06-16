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
<div id="parameter-context-dialog" layout="column" class="hidden read-only">
    <div id="parameter-context-status-bar"></div>
    <div class="parameter-context-tab-container dialog-content">
        <div id="parameter-context-tabs" class="tab-container"></div>
        <div id="parameter-context-tabs-content">
            <div id="parameter-context-standard-settings-tab-content" class="split-65-35 configuration-tab">
                <div class="settings-left">
                    <div id="parameter-context-id-setting" class="setting hidden">
                        <div class="setting-name">Id</div>
                        <div class="setting-field">
                            <div id="parameter-context-id-field" class="ellipsis"></div>
                        </div>
                    </div>
                    <div class="setting">
                        <div class="setting-name">名称</div>
                        <div id="parameter-context-name-container" class="setting-field">
                            <input type="text" id="parameter-context-name" class="edit-mode" name="parameter-context-name"/>
                            <div id="parameter-context-name-read-only" class="read-only ellipsis"></div>
                        </div>
                    </div>
                    <div class="setting">
                        <div class="setting-name">描述</div>
                        <div class="setting-field parameter-context-description-container">
                            <textarea id="parameter-context-description-field" class="edit-mode" rows="6"></textarea>
                            <div id="parameter-context-description-read-only" class="read-only"></div>
                        </div>
                        <div class="clear"></div>
                    </div>
                </div>
                <div class="spacer">&nbsp;</div>
                <div class="settings-right">
                    <div class="setting">
                        <div class="setting-name">
                            引用组件
                            <div class="fa fa-question-circle" alt="Info" title="引用该参数上下文的其他组件."></div>
                        </div>
                        <div class="setting-field">
                            <div id="parameter-context-referencing-components"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="parameter-context-parameters-tab-content" class="split-65-35 configuration-tab">
                <div class="settings-left">
                    <div class="edit-mode">
                        <div id="add-parameter"><button class="button fa fa-plus"></button></div>
                        <div class="clear"></div>
                    </div>
                    <div id="parameter-table"></div>
                    <div id="parameter-context-update-status" class="hidden">
                        <div class="setting">
                            <div class="setting-name">
                                更新参数步骤
                            </div>
                            <div class="setting-field">
                                <ol id="parameter-context-update-steps"></ol>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="spacer">&nbsp;</div>
                <div id="parameter-context-usage" class="settings-right">
                    <div class="setting">
                        <div class="setting-name">
                            参数
                            <div class="referencing-components-loading"></div>
                        </div>
                        <div class="setting-field">
                            <div id="parameter-referencing-components-context" class="ellipsis"></div>
                        </div>
                    </div>
                    <div class="setting">
                        <div class="setting-name">
                            引用组件
                            <div class="fa fa-question-circle" alt="Info" title="处理组内引用该参数的组件."></div>
                        </div>
                        <div id="parameter-referencing-components-container" class="setting-field">
                        </div>
                    </div>
                </div>
            </div>
            <div id="parameter-context-inheritance-tab-content" class="configuration-tab">
                <div id="parameter-context-inheritance-container">
                    <div class="settings-left">
                        <div class="setting">
                            <div class="setting-name">
                                可用参数上下文
                                <div class="fa fa-question-circle" alt="Info" title="可被继承的参数上下文."></div>
                            </div>
                            <div class="setting-field">
                                <ol id="parameter-context-available"></ol>
                            </div>
                        </div>
                    </div>
                    <div class="spacer">&nbsp;</div>
                    <div class="settings-right">
                        <div class="setting">
                            <div class="setting-name">
                                选中的参数上下文
                                <div class="fa fa-question-circle" alt="Info" title="选中的用于继承的参数上下文."></div>
                            </div>
                            <div class="setting-field">
                                <ol id="parameter-context-selected"></ol>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="parameter-context-inheritance-container-read-only" style="display: none;">
                    <div class="settings-left">
                        <div class="setting">
                            <div class="setting-name">
                                选中的参数上下文
                                <div class="fa fa-question-circle" alt="Info" title="选中的用于继承的参数上下文."></div>
                            </div>
                            <div class="setting-field">
                                <ol id="parameter-context-selected-read-only"></ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="inherited-parameter-contexts-message" class="ellipsis hidden">
        继承来的参数上下文已被修改. 已更新的参数列表尚未被使用.
    </div>
</div>
<div id="parameter-dialog" class="dialog cancellable hidden">
    <div class="dialog-content">
        <div class="setting">
            <div class="setting-name">名称</div>
            <div class="setting-field new-parameter-name-container">
                <input id="parameter-name" type="text"/>
            </div>
            <div class="clear"></div>
        </div>
        <div class="setting">
            <div class="setting-name">
                值
                <div class="fa fa-question-circle" alt="Info" title="参数值不支持表达式语言或嵌入参数引用."></div>
            </div>
            <div class="setting-field new-parameter-value-container">
                <textarea id="parameter-value-field"></textarea>
                <div class="string-check-container">
                    <div id="parameter-set-empty-string-field" class="nf-checkbox string-check checkbox-unchecked"></div>
                    <span class="string-check-label nf-checkbox-label">设置为空字符串</span>
                </div>
            </div>
            <div class="clear"></div>
        </div>
        <div class="setting">
            <div class="setting-field new-parameter-sensitive-value-container">
                <div class="setting-name">敏感信息</div>
                <input id="parameter-sensitive-radio-button" type="radio" name="sensitive" value="sensitive"/> 是
                <input id="parameter-not-sensitive-radio-button" type="radio" name="sensitive" value="plain" checked="checked" style="margin-left: 20px;"/> 否
            </div>
            <div class="clear"></div>
        </div>
        <div class="setting">
            <div class="setting-name">描述</div>
            <div class="setting-field new-parameter-description-container">
                <textarea id="parameter-description-field" rows="6"></textarea>
            </div>
            <div class="clear"></div>
        </div>
    </div>
    <div id="parameter-context-updating-status">
        <div class='parameter-context-step ajax-loading'></div>
        <div class='status-message ellipsis'>正在更新参数上下文</div>
    </div>
</div>
<div id="referencing-components-template" class="referencing-components-template hidden clear">
    <div class="setting">
        <div class="setting-name">
            引用处理器
        </div>
        <div class="setting-field">
            <ul class="parameter-context-referencing-processors"></ul>
        </div>
    </div>
    <div class="setting">
        <div class="setting-name">
            引用控制器服务
        </div>
        <div class="setting-field">
            <ul class="parameter-context-referencing-controller-services"></ul>
        </div>
    </div>
    <div class="setting">
        <div class="setting-name">
            未授权的组件引用
        </div>
        <div class="setting-field">
            <ul class="parameter-context-referencing-unauthorized-components"></ul>
        </div>
    </div>
</div>
