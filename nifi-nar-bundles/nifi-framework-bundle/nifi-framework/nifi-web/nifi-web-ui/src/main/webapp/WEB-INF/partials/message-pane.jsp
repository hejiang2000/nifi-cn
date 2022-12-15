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
<div id="message-pane" class="message-pane hidden">
    <div class="message-pane-message-box">
        <div id="message-title" class="message-pane-title"></div>
        <div id="user-links-container">
            <ul class="links">
                <li id="user-logout-container" style="display: none;">
                    <span id="user-logout" class="link">退出</span>
                </li>
                <li>
                    <span id="user-home" class="link">首页</span>
                </li>
            </ul>
        </div>
        <div id="message-content" class="message-pane-content"></div>
    </div>
</div>