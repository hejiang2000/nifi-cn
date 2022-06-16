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
<div id="connection-configuration" layout="column" class="hidden large-dialog">
    <div class="connection-configuration-tab-container dialog-content">
        <div id="connection-configuration-tabs" class="tab-container"></div>
        <div id="connection-configuration-tabs-content">
            <div id="connection-settings-tab-content" class="configuration-tab">
                <div class="settings-left">
                    <div class="setting">
                        <div class="setting-name">名称</div>
                        <div class="setting-field">
                            <input type="text" id="connection-name" name="connection-name" class="setting-input"/>
                        </div>
                    </div>
                    <div class="setting">
                        <div class="setting-name">Id</div>
                        <div class="setting-field">
                            <span type="text" id="connection-id"></span>
                        </div>
                    </div>
                    <div class="setting">
                        <div class="setting-name">
                            FlowFile 过期时长
                            <div class="fa fa-question-circle" alt="Info" title="被自动过期丢弃到数据流程之外前，一个对象可以在数据流程中存在的最大时长."></div>
                        </div>
                        <div class="setting-field">
                            <input type="text" id="flow-file-expiration" name="flow-file-expiration" class="setting-input"/>
                        </div>
                    </div>
                    <div class="multi-column-settings">
                        <div class="setting">
                            <div class="setting-name">
                                背压<br/>对象数量阈值
                                <div class="fa fa-question-circle" alt="Info" title="背压应用之前, 可排队的对象数量."></div>
                            </div>
                            <div class="setting-field">
                                <input type="text" id="back-pressure-object-threshold" name="back-pressure-object-threshold" class="setting-input"/>
                            </div>
                        </div>
                        <div class="separator">&nbsp;</div>
                        <div class="setting">
                            <div class="setting-name">
                                &nbsp;<br/>大小阈值
                                <div class="fa fa-question-circle" alt="Info" title=".背压应用之前, 可排队的对象存储大小."></div>
                            </div>
                            <div class="setting-field">
                                <input type="text" id="back-pressure-data-size-threshold" name="back-pressure-data-size-threshold" class="setting-input"/>
                            </div>
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
                                    <div id="load-balance-strategy-combo"></div>
                                </div>
                            </div>
                            <div id="load-balance-partition-attribute-setting-separator" class="separator">&nbsp;</div>
                            <div id="load-balance-partition-attribute-setting" class="setting">
                                <div class="setting-name">
                                    属性名称
                                    <div class="fa fa-question-circle" alt="Info" title="用以决定一个 FlowFile 应该到哪个节点的 FlowFile 属性."></div>
                                </div>
                                <div class="setting-field">
                                    <input type="text" id="load-balance-partition-attribute" name="load-balance-partition-attribute" class="setting-input"/>
                                </div>
                            </div>
                        </div>
                        <div id="load-balance-compression-setting" class="setting">
                            <div class="setting-name">
                                负载均衡传输压缩
                                <div class="fa fa-question-circle" alt="Info" title="在集群中节点间传输时数据是否应该被压缩."></div>
                            </div>
                            <div class="setting-field">
                                <div id="load-balance-compression-combo"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="spacer">&nbsp;</div>
                <div class="settings-right">
                    <div class="setting">
                        <div class="setting-name">
                            可用优先器
                            <div class="fa fa-question-circle" alt="Info" title="在该处理器工作队列中用来设置 FlowFile 优先级别的可选优先器."></div>
                        </div>
                        <div class="setting-field">
                            <ol id="prioritizer-available"></ol>
                        </div>
                    </div>
                    <div class="setting">
                        <div class="setting-name">
                            选中的优先器
                            <div class="fa fa-question-circle" alt="Info" title="在该处理器工作队列中用来设置 FlowFile 优先级别的优先器."></div>
                        </div>
                        <div class="setting-field">
                            <ul id="prioritizer-selected"></ul>
                        </div>
                    </div>
                </div>
                <input type="hidden" id="connection-uri" name="connection-uri"/>
                <input type="hidden" id="connection-source-component-id" name="connection-source-component-id"/>
                <input type="hidden" id="connection-source-id" name="connection-source-id"/>
                <input type="hidden" id="connection-source-group-id" name="connection-source-group-id"/>
                <input type="hidden" id="connection-destination-component-id" name="connection-destination-component-id"/>
                <input type="hidden" id="connection-destination-id" name="connection-destination-id"/>
                <input type="hidden" id="connection-destination-group-id" name="connection-destination-group-id"/>
            </div>
            <div id="connection-details-tab-content" class="configuration-tab">
                <div class="settings-left">
                    <div id="read-only-output-port-source" class="setting hidden">
                        <div class="setting-name">从以下输出端口</div>
                        <div class="setting-field connection-terminal-label">
                            <div id="read-only-output-port-name" class="ellipsis"></div>
                        </div>
                    </div>
                    <div id="output-port-source" class="setting hidden">
                        <div class="setting-name">从以下输出端口</div>
                        <div class="setting-field connection-terminal-label">
                            <div id="output-port-options"></div>
                        </div>
                    </div>
                    <div id="input-port-source" class="setting hidden">
                        <div class="setting-name">从以下输入端口</div>
                        <div class="setting-field connection-terminal-label">
                            <div id="input-port-source-name" class="label ellipsis"></div>
                        </div>
                    </div>
                    <div id="funnel-source" class="setting hidden">
                        <div class="setting-name">从以下漏斗</div>
                        <div class="setting-field connection-terminal-label">
                            <div id="funnel-source-name" class="label ellipsis" title="漏斗">漏斗</div>
                        </div>
                    </div>
                    <div id="processor-source" class="setting hidden">
                        <div class="setting-name">从以下处理器</div>
                        <div class="setting-field connection-terminal-label">
                            <div id="processor-source-details">
                                <div id="processor-source-name" class="label ellipsis"></div>
                                <div id="processor-source-type" class="ellipsis"></div>
                            </div>
                        </div>
                    </div>
                    <div id="connection-source-group" class="setting">
                        <div class="setting-name">所属处理组</div>
                        <div class="setting-field">
                            <div id="connection-source-group-name"></div>
                        </div>
                        <div class="setting-field">
                            <div id="connection-remote-source-url" class="hidden"></div>
                        </div>
                    </div>
                    <div id="relationship-names-container" class="hidden">
                        <div class="setting-name">输出数据流</div>
                        <div class="setting-field">
                            <div id="relationship-names"></div>
                        </div>
                    </div>
                </div>
                <div class="spacer">&nbsp;</div>
                <div class="settings-right">
                    <div id="input-port-destination" class="setting hidden">
                        <div class="setting-name">到以下输入端口</div>
                        <div class="setting-field connection-terminal-label">
                            <div id="input-port-options"></div>
                        </div>
                    </div>
                    <div id="output-port-destination" class="setting hidden">
                        <div class="setting-name">到以下输出端口</div>
                        <div class="setting-field connection-terminal-label">
                            <div id="output-port-destination-name" class="label ellipsis"></div>
                        </div>
                    </div>
                    <div id="funnel-destination" class="setting hidden">
                        <div class="setting-name">到以下漏斗</div>
                        <div class="setting-field connection-terminal-label">
                            <div id="funnel-destination-name" class="label ellipsis" title="漏斗">漏斗</div>
                        </div>
                    </div>
                    <div id="processor-destination" class="setting hidden">
                        <div class="setting-name">到以下处理器</div>
                        <div class="setting-field connection-terminal-label">
                            <div id="processor-destination-details">
                                <div id="processor-destination-name" class="label ellipsis"></div>
                                <div id="processor-destination-type" class="ellipsis"></div>
                            </div>
                        </div>
                    </div>
                    <div id="connection-destination-group" class="setting">
                        <div class="setting-name">所属处理组</div>
                        <div class="setting-field">
                            <div id="connection-destination-group-name"></div>
                        </div>
                        <div class="setting-field">
                            <div id="connection-remote-destination-url" class="hidden"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>