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
<div id="override-policy-dialog" class="hidden small-dialog">
    <div class="dialog-content">
        <div>您想用继承策略或空策略覆盖吗?</div>
        <div style="margin-top: 10px;">
            <label for="copy-policy-radio-button"><input id="copy-policy-radio-button" type="radio" name="emptyOrCopy" value="copy" checked="checked"/> 拷贝</label>
            <label for="empty-policy-radio-button"><input id="empty-policy-radio-button" type="radio" name="emptyOrCopy" value="policy"/> 空</label>
        </div>
    </div>
</div>