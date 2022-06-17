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
<div id="processor-details" class="hidden large-dialog">
    <div id="processor-details-status-bar"></div>
    <div class="dialog-content">
        <div id="processor-details-tabs" class="tab-container"></div>
        <div id="processor-details-tabs-content">
            <div id="details-standard-settings-tab-content" class="details-tab">
                <div class="settings-left">
                    <div class="setting">
                        <div class="setting-name">名称</div>
                        <div class="setting-field">
                            <span id="read-only-processor-name"></span>
                        </div>
                        <div class="clear"></div>
                    </div>
                    <div class="setting">
                        <div class="setting-name">Id</div>
                        <div class="setting-field">
                            <span id="read-only-processor-id"></span>
                        </div>
                    </div>
                    <div class="setting">
                        <div class="setting-name">类型</div>
                        <div id="read-only-processor-type" class="setting-field"></div>
                        <div class="clear"></div>
                    </div>
                    <div class="setting">
                        <div class="setting-name">扩展包</div>
                        <div id="read-only-processor-bundle" class="setting-field"></div>
                        <div class="clear"></div>
                    </div>
                    <div class="setting">
                        <div class="penalty-duration-setting">
                            <div class="setting-name">
                                惩罚处理间隔
                                <div class="fa fa-question-circle" alt="Info" title="该处理器惩罚一个 FlowFile 的时间长度."></div>
                            </div>
                            <div class="setting-field">
                                <span id="read-only-penalty-duration"></span>
                            </div>
                        </div>
                        <div class="yield-duration-setting">
                            <div class="setting-name">
                                调度间隔
                                <div class="fa fa-question-circle" alt="Info" title="当处理器放弃调度后, 该时间之前不会被再次调度."></div>
                            </div>
                            <div class="setting-field">
                                <span id="read-only-yield-duration"></span>
                            </div>
                        </div>
                        <div class="clear"></div>
                    </div>
                    <div class="setting">
                        <div class="bulletin-setting">
                            <div class="setting-name">
                                公告级别
                                <div class="fa fa-question-circle" alt="Info" title="处理器该级别以上的日志将会产生公告."></div>
                            </div>
                            <div class="setting-field">
                                <span id="read-only-bulletin-level"></span>
                            </div>
                        </div>
                        <div class="clear"></div>
                    </div>
                </div>
                <div class="spacer">&nbsp;</div>
                <div class="settings-right">
                    <div class="setting">
                        <div class="setting-name">
                            自动终止输出数据流
                            <div class="fa fa-question-circle" alt="Info" title="发送到以下黑体字输出数据流的 FlowFile 将会自动终止."></div>
                        </div>
                        <div class="setting-field">
                            <div id="read-only-auto-terminate-relationship-names"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="details-scheduling-tab-content" class="details-tab">
                <div class="settings-left">
                    <div class="setting">
                        <div class="scheduling-strategy-setting">
                            <div class="setting-name">
                                调度策略
                                <div class="fa fa-question-circle" alt="Info" title="调度该处理器的策略."></div>
                            </div>
                            <div class="setting-field">
                                <span id="read-only-scheduling-strategy"></span>
                            </div>
                        </div>
                        <div class="clear"></div>
                    </div>
                    <div class="setting">
                        <div class="concurrently-schedulable-tasks-setting">
                            <div class="setting-name">
                                并行任务
                                <div class="fa fa-question-circle" alt="Info" title="该处理器应该被并行调度的任务数量."></div>
                            </div>
                            <div class="setting-field">
                                <span id="read-only-concurrently-schedulable-tasks"></span>
                            </div>
                        </div>
                        <div id="read-only-run-schedule" class="scheduling-period-setting">
                            <div class="setting-name">
                                调度间隔
                                <div class="fa fa-question-circle" alt="Info" title="任务两次执行之间的最小间隔秒数."></div>
                            </div>
                            <div class="setting-field">
                                <span id="read-only-scheduling-period"></span>
                            </div>
                        </div>
                        <div class="clear"></div>
                    </div>
                    <div id="read-only-execution-node-options" class="setting">
                        <div class="execution-node-setting">
                            <div class="setting-name">
                                执行节点
                                <div class="fa fa-question-circle" alt="Info" title="集群模式下处理器被调度执行的节点."></div>
                            </div>
                            <div class="setting-field">
                                <span id="read-only-execution-node"></span>
                            </div>
                        </div>
                        <div class="clear"></div>
                    </div>
                </div>
                <div class="spacer">&nbsp;</div>
                <div class="settings-right">
                    <div class="setting">
                        <div class="setting-name">
                            运行时长
                            <div class="fa fa-question-circle" alt="Info" title="被调度之后, 该处理器将会连续运行, 直到达到运行时长. 运行时长设置为 0ms 时, 处理器一旦被调度, 将会一直运行."></div>
                        </div>
                        <div class="setting-field">
                            <span id="read-only-run-duration"></span>
                        </div>
                    </div>
                </div>
            </div>
            <div id="details-processor-properties-tab-content" class="details-tab">
                <div id="read-only-processor-properties"></div>
            </div>
            <div id="details-processor-comments-tab-content" class="details-tab">
                <div class="setting">
                    <div class="setting-name">说明</div>
                    <div class="setting-field">
                        <div id="read-only-processor-comments"></div>
                    </div>
                    <div class="clear"></div>
                </div>
            </div>
        </div>
    </div>
</div>
