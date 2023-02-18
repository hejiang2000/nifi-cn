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
<div id="cluster-output-port-summary-dialog" class="hidden large-dialog">
    <div class="dialog-content">
        <div id="cluster-output-port-summary-header">
            <div id="cluster-output-port-details-container">
                <div id="cluster-output-port-icon"></div>
                <div id="cluster-output-port-details">
                    <div id="cluster-output-port-name"></div>
                    <div id="cluster-output-port-type"></div>
                    <div id="cluster-output-port-group-id" class="hidden"></div>
                </div>
                <div id="cluster-output-port-id"></div>
            </div>
        </div>
        <div id="cluster-output-port-summary-table"></div>
    </div>
    <button id="cluster-output-port-refresh-button" class="refresh-button pointer fa fa-refresh" title="刷新"></button>
    <div id="cluster-output-port-summary-last-refreshed-container" class="last-refreshed-container">
        最后更新:&nbsp;<span id="cluster-output-port-summary-last-refreshed" class="value-color"></span>
    </div>
    <div id="cluster-output-port-summary-loading-container" class="loading-container"></div>
</div>
