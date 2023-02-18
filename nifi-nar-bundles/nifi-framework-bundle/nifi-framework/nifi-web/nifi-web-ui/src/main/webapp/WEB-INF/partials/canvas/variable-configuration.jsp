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
<div id="variable-registry-dialog" class="hidden">
    <div class="dialog-content">
        <div class="settings-left">
            <div class="setting">
                <div style="float: left;">
                    <div class="setting-name">处理组</div>
                    <div class="setting-field">
                        <span id="process-group-variable-registry"></span>
                        <span id="variable-registry-process-group-id" class="hidden"></span>
                    </div>
                </div>
                <div id="add-variable"><button class="button fa fa-plus"></button></div>
                <div class="clear"></div>
            </div>
            <div id="variable-registry-table"></div>
            <div id="variable-update-status" class="hidden">
                <div class="setting">
                    <div class="setting-name">
                        更新变量步骤
                    </div>
                    <div class="setting-field">
                        <ol id="variable-update-steps"></ol>
                    </div>
                </div>
            </div>
        </div>
        <div class="spacer">&nbsp;</div>
        <div class="settings-right">
            <div class="setting">
                <div class="setting-name">
                    变量
                    <div class="referencing-components-loading"></div>
                </div>
                <div class="setting-field">
                    <div id="variable-affected-components-context"></div>
                </div>
            </div>
            <div class="setting">
                <div class="setting-name">
                    引用处理器
                    <div class="fa fa-question-circle" alt="Info" title="引用该变量的处理器."></div>
            </div>
                <div class="setting-field">
                    <ul id="variable-registry-affected-processors"></ul>
                </div>
            </div>
            <div class="setting">
                <div class="setting-name">
                    引用控制器服务
                    <div class="fa fa-question-circle" alt="Info" title="引用该变量的控制器服务."></div>
                </div>
                <div class="setting-field">
                    <ul id="variable-registry-affected-controller-services"></ul>
                </div>
            </div>
            <div class="setting">
                <div class="setting-name">
                    未授权的组件引用
                    <div class="fa fa-question-circle" alt="Info" title="没有引用组件的读写权限."></div>
                </div>
                <div class="setting-field">
                    <ul id="variable-registry-affected-unauthorized-components"></ul>
                </div>
            </div>
        </div>
    </div>
    <div id="variable-message" class="ellipsis" title="参数是可替换变量. 了解更多关于参数的安全性和强大功能的详情.">
        参数是可替换变量. <span id="parameters-documentation-link" class="link" title="了解关于参数的更多信息">了解更多信息</span> 关于参数的安全性和强大功能.
    </div>
</div>
<div id="new-variable-dialog" class="dialog cancellable small-dialog hidden">
    <div class="dialog-content">
        <div>
            <div class="setting-name">变量名称</div>
            <div class="setting-field new-variable-name-container">
                <input id="new-variable-name" type="text"/>
            </div>
        </div>
    </div>
</div>
