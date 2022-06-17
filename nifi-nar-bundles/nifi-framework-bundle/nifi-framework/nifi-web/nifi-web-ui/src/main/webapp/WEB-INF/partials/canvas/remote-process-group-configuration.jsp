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
<div id="remote-process-group-configuration" class="hidden large-dialog">
    <div class="dialog-content">
        <div class="setting">
            <div class="setting-name">名称</div>
            <div class="setting-field">
                <span id="remote-process-group-name"></span>
            </div>
        </div>
        <div class="setting">
            <div class="setting-name">Id</div>
            <div class="setting-field">
                <span id="remote-process-group-id"></span>
            </div>
        </div>
        <div class="setting">
            <div class="setting-name">URLs</div>
            <div class="setting-field">
                <input type="text" id="remote-process-group-urls" class="setting-input"/>
            </div>
        </div>
        <div class="setting">
            <div class="remote-process-group-setting-left">
                <div class="setting-name">
                    传输协议
                    <div class="fa fa-question-circle" alt="Info" title="指定该远程处理组所用的传输协议."></div>
                </div>
                <div class="setting-field">
                    <div id="remote-process-group-transport-protocol-combo"></div>
                </div>
            </div>
            <div class="remote-process-group-setting-right">
                <div class="setting-name">
                    本地网络接口
                    <div class="fa fa-question-circle" alt="Info" title="发送/接收数据的本地网络接口. 如果未指定, 将使用任意本地地址. 对于集群, 所有节点必须存在这里指定的网络接口."></div>
                </div>
                <div class="setting-field">
                    <input type="text" class="small-setting-input" id="remote-process-group-local-network-interface"/>
                </div>
            </div>
            <div class="clear"></div>
        </div>
        <div class="setting">
            <div class="remote-process-group-setting-left">
                <div class="setting-name">
                    HTTP 代理服务器主机
                    <div class="fa fa-question-circle" alt="Info" title="指定代理服务器主机. 如果未指定, 将会直接与 NiFi 实例通信."></div>
                </div>
                <div class="setting-field">
                    <input type="text" class="small-setting-input" id="remote-process-group-proxy-host"/>
                </div>
            </div>
            <div class="remote-process-group-setting-right">
                <div class="setting-name">
                    HTTP 代理服务器端口
                    <div class="fa fa-question-circle" alt="Info" title="指定代理服务器端口, 可选. 如果未指定, 将使用默认的 80 端口."></div>
                </div>
                <div class="setting-field">
                    <input type="text" class="small-setting-input" id="remote-process-group-proxy-port"/>
                </div>
            </div>
            <div class="clear"></div>
        </div>
        <div class="setting">
            <div class="remote-process-group-setting-left">
                <div class="setting-name">
                    HTTP 代理用户
                    <div class="fa fa-question-circle" alt="Info" title="指定连接到代理服务器的用户名, 可选."></div>
                </div>
                <div class="setting-field">
                    <input type="text" class="small-setting-input" id="remote-process-group-proxy-user"/>
                </div>
            </div>
            <div class="remote-process-group-setting-right">
                <div class="setting-name">
                    HTTP 代理密码
                    <div class="fa fa-question-circle" alt="Info" title="指定连接到服务器的密码, 可选."></div>
                </div>
                <div class="setting-field">
                    <input type="password" class="small-setting-input" id="remote-process-group-proxy-password"/>
                </div>
            </div>
            <div class="clear"></div>
        </div>
        <div class="setting">
            <div class="remote-process-group-setting-left">
                <div class="setting-name">
                    通信超时
                    <div class="fa fa-question-circle" alt="Info" title="与该远程处理组通信超过该指定时间阈值, 将被视为超时."></div>
                </div>
                <div class="setting-field">
                    <input type="text" class="small-setting-input" id="remote-process-group-timeout"/>
                </div>
            </div>
            <div class="remote-process-group-setting-right">
                <div class="setting-name">
                    调度间隔
                    <div class="fa fa-question-circle" alt="Info" title="当与该远程处理组通信失败后, 在该指定时间阈值到达前, 不会被再次调度执行."></div>
                </div>
                <div class="setting-field">
                    <input type="text" class="small-setting-input" id="remote-process-group-yield-duration"/>
                </div>
            </div>
            <div class="clear"></div>
        </div>
    </div>
</div>