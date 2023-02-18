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
<div id="event-details-dialog" class="hidden large-dialog">
    <div id="event-details-dialog-content"class="dialog-content">
        <div id="event-details-tabs" class="tab-container"></div>
        <div id="event-details-tabs-content">
            <div id="event-details-tab-content" class="details-tab">
                <span id="provenance-event-id" class="hidden"></span>
                <span id="provenance-event-cluster-node-id" class="hidden"></span>
                <div class="settings-left">
                    <div id="event-details">
                        <div class="event-detail">
                            <div class="detail-name">时间</div>
                            <div id="provenance-event-time" class="detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="event-detail">
                            <div class="detail-name">事件持续时间</div>
                            <div id="provenance-event-duration" class="detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="event-detail">
                            <div class="detail-name">血缘持续时间</div>
                            <div id="provenance-lineage-duration" class="detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="event-detail">
                            <div class="detail-name">类型</div>
                            <div id="provenance-event-type" class="detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="event-detail">
                            <div class="detail-name">FlowFile Uuid</div>
                            <div id="provenance-event-flowfile-uuid" class="detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="event-detail">
                            <div class="detail-name">文件大小</div>
                            <div id="provenance-event-file-size" class="detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="event-detail">
                            <div class="detail-name">组件 Id</div>
                            <div id="provenance-event-component-id" class="detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="event-detail">
                            <div class="detail-name">组件名称</div>
                            <div id="provenance-event-component-name" class="detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="event-detail">
                            <div class="detail-name">组件类型</div>
                            <div id="provenance-event-component-type" class="detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div id="additional-provenance-details"></div>
                        <div class="event-detail">
                            <div class="detail-name">详细信息</div>
                            <div id="provenance-event-details" class="detail-value"></div>
                            <div class="clear"></div>
                        </div>
                    </div>
                </div>
                <div class="spacer">&nbsp;</div>
                <div class="settings-right">
                    <div id="parent-flowfiles">
                        <div class="event-header">父 FlowFiles (<span id="parent-flowfile-count"></span>)</div>
                        <div id="parent-flowfiles-container" class="flowfile-container"></div>
                    </div>
                    <div id="child-flowfiles">
                        <div class="event-header">子 FlowFiles (<span id="child-flowfile-count"></span>)</div>
                        <div id="child-flowfiles-container"class="flowfile-container"></div>
                    </div>
                </div>
                <div class="clear"></div>
            </div>
            <div id="attributes-tab-content" class="details-tab">
                <div id="attributes-details">
                    <div id="attributes-header" class="event-header">属性值</div>
                    <div id="modified-attribute-toggle-container">
                        <div id="modified-attribute-toggle" class="nf-checkbox checkbox-unchecked"></div>
                        <div id="modified-attribute-toggle-label" class="nf-checkbox-label">只显示修改过的属性</div>
                        <div class="clear"></div>
                    </div>
                    <div class="clear"></div>
                    <div id="attributes-container"></div>
                </div>
            </div>
            <div id="content-tab-content" class="details-tab">
                <div class="settings-left">
                    <div id="input-content-details" class="content-details">
                        <div id="input-content-header" class="event-header">输入申索</div>
                        <div class="event-detail">
                            <div class="content-detail-name">容器</div>
                            <div id="input-content-container" class="content-detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="event-detail">
                            <div class="content-detail-name">Section</div>
                            <div id="input-content-section" class="content-detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="event-detail">
                            <div class="content-detail-name">标识</div>
                            <div id="input-content-identifier" class="content-detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="event-detail">
                            <div class="content-detail-name">偏移量</div>
                            <div id="input-content-offset" class="content-detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="event-detail">
                            <div class="content-detail-name">大小</div>
                            <div id="input-content-size" class="content-detail-value"></div>
                            <div id="input-content-bytes" class="content-detail-value hidden"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="event-detail">
                            <div id="input-content-download" class="secondary-button hidden fa fa-download button-icon"><span>下载</span></div>
                            <div id="input-content-view" class="secondary-button fa fa-eye button-icon hidden"><span>查看</span></div>
                            <div class="clear"></div>
                        </div>
                    </div>
                </div>
                <div class="spacer">&nbsp;</div>
                <div class="settings-right">
                    <div id="output-content-details" class="content-details">
                        <div class="event-header">输出申索</div>
                        <div class="event-detail">
                            <div class="content-detail-name">容器</div>
                            <div id="output-content-container" class="content-detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="event-detail">
                            <div class="content-detail-name">Section</div>
                            <div id="output-content-section" class="content-detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="event-detail">
                            <div class="content-detail-name">标识</div>
                            <div id="output-content-identifier" class="content-detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="event-detail">
                            <div class="content-detail-name">偏移量</div>
                            <div id="output-content-offset" class="content-detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="event-detail">
                            <div class="content-detail-name">大小</div>
                            <div id="output-content-size" class="content-detail-value"></div>
                            <div id="output-content-bytes" class="content-detail-value hidden"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="event-detail">
                            <div id="output-content-download" class="secondary-button fa fa-download button-icon hidden"><span>下载</span></div>
                            <div id="output-content-view" class="secondary-button fa fa-eye button-icon hidden"><span>查看</span></div>
                            <div class="clear"></div>
                        </div>
                    </div>
                </div>
                <div class="clear"></div>
                <div id="replay-details" class="content-details hidden">
                    <div class="event-header">重放</div>
                    <div id="replay-content-connection" class="event-detail">
                        <div class="content-detail-name">连接 Id</div>
                        <div id="replay-connection-id" class="content-detail-value"></div>
                        <div class="clear"></div>
                    </div>
                    <div id="replay-content-message" class="hidden"></div>
                    <div class="event-detail">
                        <div id="replay-content" class="secondary-button fa fa-repeat button-icon"><span>重放</span></div>
                        <div class="clear"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
