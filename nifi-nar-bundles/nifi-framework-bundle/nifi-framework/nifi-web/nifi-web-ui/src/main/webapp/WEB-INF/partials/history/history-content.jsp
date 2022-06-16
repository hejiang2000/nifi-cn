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
<div id="history">
    <div id="history-header-text">NiFi 历史记录</div>
    <div id="history-filter-container">
        <div id="cluster-history-message" class="hidden">
            仅查看当前节点历史. 请浏览到另一个节点查看其历史.
        </div>
        <div style="float: right">
            <div id="history-filter-overview">
                一个过虑器已被使用.&nbsp;
                <span id="clear-history-filter" class="link">清除过滤</span>
            </div>
            <button id="history-filter-button" title="过滤历史" class="fa fa-filter"></button>
            <button id="history-purge-button" title="清除历史" class="fa fa-eraser hidden"></button>
        </div>
        <div class="clear"></div>
    </div>
    <div id="history-table"></div>
</div>
<div id="history-refresh-container">
    <button id="refresh-button" class="refresh-button pointer fa fa-refresh" title="刷新"></button>
    <div id="history-last-refreshed-container" class="last-refreshed-container">
        最后更新:&nbsp;<span id="history-last-refreshed" class="value-color"></span>
    </div>
    <div id="history-loading-container" class="loading-container"></div>
</div>