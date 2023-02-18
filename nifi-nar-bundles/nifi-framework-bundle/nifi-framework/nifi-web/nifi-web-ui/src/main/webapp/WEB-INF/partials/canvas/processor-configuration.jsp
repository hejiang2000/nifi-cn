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
<div id="processor-configuration" layout="column" class="hidden large-dialog">
    <div id="processor-configuration-status-bar"></div>
    <div class="processor-configuration-tab-container dialog-content">
        <div id="processor-configuration-tabs" class="tab-container"></div>
        <div id="processor-configuration-tabs-content">
            <div id="processor-standard-settings-tab-content" class="configuration-tab">
                <div class="settings-left">
                    <div class="setting">
                        <div class="setting-name">名称</div>
                        <div id="processor-name-container" class="setting-field">
                            <input type="text" id="processor-name" name="processor-name"/>
                            <div class="processor-enabled-container">
                                <div id="processor-enabled" class="nf-checkbox checkbox-unchecked"></div>
                                <span class="nf-checkbox-label"> 启用</span>
                            </div>
                        </div>
                    </div>
                    <div class="setting">
                        <div class="setting-name">Id</div>
                        <div class="setting-field">
                            <span id="processor-id"></span>
                        </div>
                    </div>
                    <div class="setting">
                        <div class="setting-name">类型</div>
                        <div class="setting-field">
                            <span id="processor-type"></span>
                        </div>
                    </div>
                    <div class="setting">
                        <div class="setting-name">扩展包</div>
                        <div id="processor-bundle" class="setting-field"></div>
                    </div>
                    <div class="setting">
                        <div class="penalty-duration-setting">
                            <div class="setting-name">
                                惩罚处理间隔
                                <div class="fa fa-question-circle" alt="Info" title="该处理器惩罚一个 FlowFile 的时间长度."></div>
                            </div>
                            <div class="setting-field">
                                <input type="text" id="penalty-duration" name="penalty-duration" class="small-setting-input"/>
                            </div>
                        </div>
                        <div class="yield-duration-setting">
                            <div class="setting-name">
                                放弃时长
                                <div class="fa fa-question-circle" alt="Info" title="当处理器放弃调度后, 该时间之前不会被再次调度."></div>
                            </div>
                            <div class="setting-field">
                                <input type="text" id="yield-duration" name="yield-duration" class="small-setting-input"/>
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
                                <div id="bulletin-level-combo"></div>
                            </div>
                        </div>
                        <div class="clear"></div>
                    </div>
                </div>
                <div class="spacer">&nbsp;</div>
            </div>
            <div id="processor-scheduling-tab-content" class="configuration-tab">
                <div class="settings-left">
                    <div class="setting">
                        <div class="scheduling-strategy-setting">
                            <div class="setting-name">
                                调度策略
                                <div class="fa fa-question-circle" alt="Info" title="调度该处理器的策略."></div>
                            </div>
                            <div class="setting-field">
                                <div type="text" id="scheduling-strategy-combo"></div>
                            </div>
                        </div>
                        <div id="event-driven-warning" class="hidden">
                            <div class="processor-configuration-warning-icon"></div>
                            该策略尚在试用阶段
                        </div>
                        <div class="clear"></div>
                    </div>
                    <div id="timer-driven-options" class="setting">
                        <div class="concurrently-schedulable-tasks-setting">
                            <div class="setting-name">
                                并行任务
                                <div class="fa fa-question-circle" alt="Info" title="该处理器应该被并行调度的任务数量."></div>
                            </div>
                            <div class="setting-field">
                                <input type="text" id="timer-driven-concurrently-schedulable-tasks" name="timer-driven-concurrently-schedulable-tasks" class="small-setting-input"/>
                            </div>
                        </div>
                        <div class="scheduling-period-setting">
                            <div class="setting-name">
                                调度间隔
                                <div class="fa fa-question-circle" alt="Info" title="任务两次执行之间的间隔时间长度."></div>
                            </div>
                            <div class="setting-field">
                                <input type="text" id="timer-driven-scheduling-period" name="timer-driven-scheduling-period" class="small-setting-input"/>
                            </div>
                        </div>
                        <div class="clear"></div>
                    </div>
                    <div id="event-driven-options" class="setting">
                        <div class="concurrently-schedulable-tasks-setting">
                            <div class="setting-name">
                                并行任务
                                <div class="fa fa-question-circle" alt="Info" title="该处理器应该被并行调度的任务数量."></div>
                            </div>
                            <div class="setting-field">
                                <input type="text" id="event-driven-concurrently-schedulable-tasks" name="event-driven-concurrently-schedulable-tasks" class="small-setting-input"/>
                            </div>
                        </div>
                        <div class="clear"></div>
                    </div>
                    <div id="cron-driven-options" class="setting">
                        <div class="concurrently-schedulable-tasks-setting">
                            <div class="setting-name">
                                并行任务
                                <div class="fa fa-question-circle" alt="Info" title="该处理器应该被并行调度的任务数量."></div>
                            </div>
                            <div class="setting-field">
                                <input type="text" id="cron-driven-concurrently-schedulable-tasks" name="cron-driven-concurrently-schedulable-tasks" class="small-setting-input"/>
                            </div>
                        </div>
                        <div class="scheduling-period-setting">
                            <div class="setting-name">
                                调度间隔
                                <div class="fa fa-question-circle" alt="Info" title="定义处理器运行的 CRON 表达式."></div>
                            </div>
                            <div class="setting-field">
                                <input type="text" id="cron-driven-scheduling-period" name="cron-driven-scheduling-period" class="small-setting-input"/>
                            </div>
                        </div>
                        <div class="clear"></div>
                    </div>
                    <div id="execution-node-options" class="setting">
                        <div class="execution-node-setting">
                            <div class="setting-name">
                                执行节点
                                <div class="fa fa-question-circle" alt="Info" title="集群模式下处理器被调度执行的节点."></div>
                            </div>
                            <div class="setting-field">
                                <div id="execution-node-combo"></div>
                            </div>
                        </div>
                        <div class="clear"></div>
                    </div>
                </div>
                <div class="spacer">&nbsp;</div>
                <div id="run-duration-setting-container" class="settings-right">
                    <div class="setting">
                        <div class="setting-name">
                            运行时长
                            <div class="fa fa-question-circle" alt="Info"
                                 title="被调度之后, 该处理器将会连续运行, 直到达到运行时长. 运行时长设置为 0ms 时, 处理器一旦被调度, 将会一直运行."></div>
                        </div>
                        <div class="setting-field" style="overflow: visible;">
                            <div id="run-duration-container">
                                <div id="run-duration-labels">
                                    <div id="run-duration-zero">0ms</div>
                                    <div id="run-duration-one">25ms</div>
                                    <div id="run-duration-two">50ms</div>
                                    <div id="run-duration-three">100ms</div>
                                    <div id="run-duration-four">250ms</div>
                                    <div id="run-duration-five">500ms</div>
                                    <div id="run-duration-six">1s</div>
                                    <div id="run-duration-seven">2s</div>
                                    <div class="clear"></div>
                                </div>
                                <div id="run-duration-slider"></div>
                                <div id="run-duration-explanation">
                                    <div id="min-run-duration-explanation">较低延时</div>
                                    <div id="max-run-duration-explanation">较高吞吐</div>
                                    <div class="clear"></div>
                                </div>
                                <div id="run-duration-data-loss" class="hidden">
                                    <div class="processor-configuration-warning-icon"></div>
                                    当 NiFi 关闭时, 运行时长设置为大于 0ms, 同时没有输入数据流的源处理器可能会丢失数据.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="processor-properties-tab-content" class="configuration-tab">
                <div id="processor-properties"></div>
                <div id="processor-properties-verification-results" class="verification-results">
                    <div class="verification-results-header">校验结果</div>
                    <div id="processor-properties-verification-results-listing" class="verification-results-listing"></div>
                </div>
            </div>
            <div id="processor-relationships-tab-content" class="configuration-tab">
                <div class="settings-left">
                    <div class="setting">
                        <div class="setting-name">
                            自动终止/重试输出数据流
                            <div class="fa fa-question-circle" alt="Info" title="如果没有输出连接，发送到指定输出数据流的 FlowFile 将会终止或重试. 如果同时选中终止和重试, 将会先重试, 然后终止."></div>
                        </div>
                        <div class="setting-field">
                            <div id="auto-action-relationship-names"></div>
                        </div>
                    </div>
                </div>
                <div class="settings-right">
                    <div class="retry-count-setting setting">
                        <div class="setting-name">
                            重试次数
                            <div class="fa fa-question-circle" alt="Info" title="对设置为重试的输出数据流, 该数值指定一个 FlowFile 被路由到其他地方前, 允许重新处理的次数."></div>
                        </div>
                        <div class="setting-field">
                            <input type="text" id="retry-attempt-count" class="small-setting-input">
                        </div>
                    </div>
                    <div class="backoff-policy-setting setting">
                        <div class="setting-name">
                            重试背压策略
                            <div class="fa fa-question-circle" alt="Info" title="惩罚: 系统会及时重试, 但处理器回继续处理其他 FlowFile.&#013;&#013;放弃: 在重试之前, 不会处理任何 FlowFile."></div>
                        </div>
                        <div class="setting-field">
                            <input type="radio" id="penalizeFlowFile" name="backoffPolicy" value="PENALIZE_FLOWFILE">
                            <label for="penalizeFlowFile">惩罚</label>

                            <input type="radio" class="yield-radio" id="yieldEntireProcessor" name="backoffPolicy" value="YIELD_PROCESSOR">
                            <label for="yieldEntireProcessor">放弃</label>
                        </div>
                    </div>
                    <div class="max-backoff-setting setting">
                        <div class="setting-name">
                            重试最大背压间隔
                            <div class="fa fa-question-circle" alt="Info" title="首次重试时间根据惩罚/放弃时间设置计算. 每一次重试后时间加倍. 该数值指定重试前允许的最大时间."></div>
                        </div>
                        <div class="setting-field">
                            <input type="text" id="max-backoff-period" class="small-setting-input">
                        </div>
                    </div>
                </div>
            </div>
            <div id="processor-comments-tab-content" class="configuration-tab">
                <textarea cols="30" rows="4" id="processor-comments" name="processor-comments" class="setting-input"></textarea>
            </div>
        </div>
    </div>
</div>
<div id="new-processor-property-container"></div>
