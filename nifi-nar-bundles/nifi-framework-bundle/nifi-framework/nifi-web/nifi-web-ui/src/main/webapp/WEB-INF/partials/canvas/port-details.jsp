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
<div id="port-details" class="hidden medium-dialog">
    <div class="dialog-content">
        <div class="port-setting">
            <div class="setting-name">端口名称</div>
            <div class="setting-field">
                <span id="read-only-port-name"></span>
            </div>
        </div>
        <div class="port-setting">
            <div class="setting-name">Id</div>
            <div class="setting-field">
                <span id="read-only-port-id"></span>
            </div>
        </div>
        <div class="port-setting">
            <div class="setting-name">允许远程访问
                <div class="fa fa-question-circle" alt="Info" title="是否该端口可以作为远程处理组端口, 经由 Site-to-Site 协议被访问."></div>
            </div>
            <div class="setting-field">
                <span id="read-only-port-allow-remote-access"></span>
            </div>
        </div>
        <div class="port-setting">
            <div class="setting-name">并行任务
                <div class="fa fa-question-circle" alt="Info" title="该端口应该被并行调度的任务数量."></div>
            </div>
            <div class="setting-field">
                <span id="read-only-port-concurrent-tasks"></span>
            </div>
        </div>
        <div class="port-setting">
            <div class="setting-name">说明</div>
            <div class="setting-field">
                <div id="read-only-port-comments"></div>
            </div>
        </div>
    </div>
</div>