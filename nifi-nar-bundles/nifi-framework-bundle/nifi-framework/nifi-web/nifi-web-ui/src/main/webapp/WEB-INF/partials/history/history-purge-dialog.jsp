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
<div id="history-purge-dialog" class="hidden medium-dialog">
    <div class="dialog-content">
        <div class="setting" style="margin-bottom: 0px;">
            <div class="end-date-setting">
                <div class="setting-name">
                    结束日期
                    <div class="fa fa-question-circle" alt="Info" title="清理结束日期格式为 'mm/dd/yyyy'. 您必须同时指定结束时间."></div>
                </div>
                <div class="setting-field">
                    <input type="text" id="history-purge-end-date" class="history-small-input"/>
                </div>
            </div>
            <div class="end-time-setting">
                <div class="setting-name">
                    结束时间 (<span class="timezone"></span>)
                    <div class="fa fa-question-circle" id="purge-end-time-info" alt="Info" title="结束时间格式为 'hh:mm:ss'. 您必须同时指定结束日期."></div>
                </div>
                <div class="setting-field">
                    <input type="text" id="history-purge-end-time" class="history-small-input"/>
                </div>
            </div>
            <div class="clear"></div>
        </div>
    </div>
</div>
