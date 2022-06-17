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
<div id="shell-dialog" class="hidden cancellable">
    <div id="shell-container" class="dialog-content">
        <div id="shell-close-container">
            <button id="shell-undock-button" class="undock-normal pointer " title="在新窗口中打开">
                <div class="fa fa-external-link-square"></div>
            </button>
            <button id="shell-close-button" class="close-normal pointer" title="关闭">
                <div class="fa fa-times"></div>
            </button>
            <div class="clear"></div>
        </div>
        <div id="shell"></div>
    </div>
</div>