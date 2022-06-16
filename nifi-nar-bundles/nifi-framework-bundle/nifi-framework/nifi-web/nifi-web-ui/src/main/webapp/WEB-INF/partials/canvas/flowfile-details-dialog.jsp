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
<div id="flowfile-details-dialog" layout="column" class="hidden large-dialog">
    <div id="flowfile-details-dialog-content" class="dialog-content">
        <div id="flowfile-details-tabs" class="tab-container"></div>
        <div id="flowfile-details-tabs-content">
            <div id="flowfile-details-tab-content" class="details-tab">
                <span id="flowfile-uri" class="hidden"></span>
                <span id="flowfile-cluster-node-id" class="hidden"></span>
                <div class="settings-left">
                    <div id="flowfile-details">
                        <div class="flowfile-header">FlowFile 详细信息</div>
                        <div class="flowfile-detail">
                            <div class="detail-name">UUID</div>
                            <div id="flowfile-uuid" class="detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="flowfile-detail">
                            <div class="detail-name">文件名称</div>
                            <div id="flowfile-filename" class="detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="flowfile-detail">
                            <div class="detail-name">文件大小</div>
                            <div id="flowfile-file-size" class="detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="flowfile-detail">
                            <div class="detail-name">队列位置</div>
                            <div id="flowfile-queue-position" class="detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="flowfile-detail">
                            <div class="detail-name">排队持续时间</div>
                            <div id="flowfile-queued-duration" class="detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="flowfile-detail">
                            <div class="detail-name">血缘持续时间</div>
                            <div id="flowfile-lineage-duration" class="detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="flowfile-detail">
                            <div class="detail-name">Penalized</div>
                            <div id="flowfile-penalized" class="detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div id="additional-flowfile-details"></div>
                    </div>
                </div>
                <div class="spacer">&nbsp;</div>
                <div class="settings-right">
                    <div id="flowfile-with-no-content" class="content-details">
                        <div class="flowfile-header">正文申索</div>
                        <div class="flowfile-info unset">无正文</div>
                    </div>
                    <div id="flowfile-content-details" class="content-details">
                        <div class="flowfile-header">正文申索</div>
                        <div class="flowfile-detail">
                            <div class="content-detail-name">容器</div>
                            <div id="content-container" class="content-detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="flowfile-detail">
                            <div class="content-detail-name">Section</div>
                            <div id="content-section" class="content-detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="flowfile-detail">
                            <div class="content-detail-name">标识</div>
                            <div id="content-identifier" class="content-detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="flowfile-detail">
                            <div class="content-detail-name">偏移量</div>
                            <div id="content-offset" class="content-detail-value"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="flowfile-detail">
                            <div class="content-detail-name">大小</div>
                            <div id="content-size" class="content-detail-value"></div>
                            <div id="content-bytes" class="content-detail-value hidden"></div>
                            <div class="clear"></div>
                        </div>
                        <div class="flowfile-detail">
                            <div id="content-download" class="secondary-button fa fa-download button-icon"><span>下载</span></div>
                            <div id="content-view" class="secondary-button fa fa-eye button-icon hidden"><span>查看</span></div>
                            <div class="clear"></div>
                        </div>
                    </div>
                </div>
                <div class="clear"></div>
            </div>
            <div id="flowfile-attributes-tab-content" class="details-tab">
                <div id="flowfile-attributes-details">
                    <div id="flowfile-attributes-header" class="flowfile-header">属性值</div>
                    <div class="clear"></div>
                    <div id="flowfile-attributes-container"></div>
                </div>
            </div>
        </div>
    </div>
</div>
