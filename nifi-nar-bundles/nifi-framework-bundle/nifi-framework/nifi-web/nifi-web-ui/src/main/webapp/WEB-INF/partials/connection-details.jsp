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
<div id="connection-details">
    <div class="connection-details-tab-container dialog-content">
        <div id="connection-details-tabs" class="tab-container"></div>
        <div id="connection-details-tabs-content">
            <div id="read-only-connection-details-tab-content" class="configuration-tab">
                <div class="settings-left">
                    <div class="setting">
                        <div id="read-only-connection-source-label" class="setting-name"></div>
                        <div class="setting-field connection-terminal-label">
                            <div id="read-only-connection-source" class="ellipsis"></div>
                        </div>
                    </div>
                    <div id="read-only-connection-source-group" class="setting">
                        <div class="setting-name">所属处理组</div>
                        <div class="setting-field">
                            <div id="read-only-connection-source-group-name"></div>
                        </div>
                        <div class="setting-field">
                            <div id="read-only-connection-remote-source-url" class="hidden"></div>
                        </div>
                    </div>
                    <div id="read-only-relationship-names-container" class="setting">
                        <div class="setting-name">
                            输出数据流
                            <div class="fa fa-question-circle" alt="Info" title="选中的输出数据流用黑体显示."></div>
                        </div>
                        <div class="setting-field">
                            <div id="read-only-relationship-names"></div>
                        </div>
                    </div>
                </div>
                <div class="spacer">&nbsp;</div>
                <div class="settings-right">
                    <div class="setting">
                        <div id="read-only-connection-target-label" class="setting-name"></div>
                        <div class="setting-field connection-terminal-label">
                            <div id="read-only-connection-target" class="ellipsis"></div>
                        </div>
                    </div>
                    <div id="read-only-connection-target-group" class="setting">
                        <div class="setting-name">所属处理组</div>
                        <div class="setting-field">
                            <div id="read-only-connection-target-group-name"></div>
                        </div>
                        <div class="setting-field">
                            <div id="read-only-connection-remote-target-url" class="hidden"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="read-only-connection-settings-tab-content" class="configuration-tab">
                <div class="settings-left">
                    <div class="setting">
                        <div class="setting-name">名称</div>
                        <div class="setting-field">
                            <span id="read-only-connection-name"></span>
                        </div>
                    </div>
                    <div class="setting">
                        <div class="setting-name">Id</div>
                        <div class="setting-field">
                            <span id="read-only-connection-id"></span>
                        </div>
                    </div>
                    <div class="setting">
                        <div class="setting-name">
                            FlowFile 过期时长
                            <div class="fa fa-question-circle" alt="Info" title="被自动过期丢弃到数据流程之外前，一个对象可以在数据流程中存在的最大时长."></div>
                        </div>
                        <div class="setting-field">
                            <span id="read-only-flow-file-expiration"></span>
                        </div>
                        <div class="clear"></div>
                    </div>
                    <div class="multi-column-settings">
                        <div class="setting">
                            <div class="setting-name">
                                背压<br/>对象数量阈值
                                <div class="fa fa-question-circle" alt="Info" title="背压应用之前, 可排队的对象数量."></div>
                            </div>
                            <div class="setting-field">
                                <span id="read-only-back-pressure-object-threshold"></span>
                            </div>
                            <div class="clear"></div>
                        </div>
                        <div class="separator">&nbsp;</div>
                        <div class="setting">
                            <div class="setting-name">
                                &nbsp;<br/>大小阈值
                                <div class="fa fa-question-circle" alt="Info" title=".背压应用之前, 可排队的对象存储大小."></div>
                            </div>
                            <div class="setting-field">
                                <span id="read-only-back-pressure-data-size-threshold"></span>
                            </div>
                            <div class="clear"></div>
                        </div>
                    </div>
                    <div>
                        <div class="multi-column-settings">
                            <div class="setting">
                                <div class="setting-name">
                                    负载均衡策略
                                    <div class="fa fa-question-circle" alt="Info" title="该连接在集群中节点间如何进行数据的负载均衡."></div>
                                </div>
                                <div class="setting-field">
                                    <div id="read-only-load-balance-strategy"></div>
                                </div>
                            </div>
                            <div class="separator">&nbsp;</div>
                            <div id="read-only-load-balance-partition-attribute-setting" class="setting">
                                <div class="setting-name">
                                    属性名称
                                    <div class="fa fa-question-circle" alt="Info" title="用以决定一个 FlowFile 应该到哪个节点的 FlowFile 属性."></div>
                                </div>
                                <div class="setting-field">
                                    <span id="read-only-load-balance-partition-attribute"></span>
                                </div>
                            </div>
                        </div>
                        <div id="read-only-load-balance-compression-setting" class="setting">
                            <div class="setting-name">
                                负载均衡传输压缩
                                <div class="fa fa-question-circle" alt="Info" title="在集群中节点间传输时数据是否应该被压缩."></div>
                            </div>
                            <div class="setting-field">
                                <div id="read-only-load-balance-compression"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="spacer">&nbsp;</div>
                <div class="settings-right">
                    <div class="setting">
                        <div class="setting-name">
                            优先器
                            <div class="fa fa-question-circle" alt="Info" title="在该处理器工作队列中用来设置 FlowFile 优先级别的优先器."></div>
                        </div>
                        <div class="setting-field">
                            <div id="read-only-prioritizers"></div>
                        </div>
                        <div class="clear"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>