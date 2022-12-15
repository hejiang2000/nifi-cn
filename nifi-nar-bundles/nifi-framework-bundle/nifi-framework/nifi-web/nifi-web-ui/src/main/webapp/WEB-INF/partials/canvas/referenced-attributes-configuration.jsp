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
<div id="referenced-attributes-dialog" class="hidden medium-dialog">
    <div class="dialog-content">
        <div class="setting">
            <div id="referenced-attributes-header">
                <div id="referenced-attributes-title" class="setting-name">
                    输入属性值
                    <div class="fa fa-question-circle" alt="Info"
                         title="提供需要被验证的属性值."></div>
                </div>
                <div id="add-referenced-attribute">
                    <button class="button fa fa-plus"></button>
                </div>
                <div class="clear"></div>
            </div>
            <div class="setting-field">
                <div id="referenced-attributes-table"></div>
            </div>
        </div>
    </div>
</div>
<div id="new-referenced-attribute-dialog" class="dialog cancellable small-dialog hidden">
    <div class="dialog-content">
        <div>
            <div class="setting-name">属性名称</div>
            <div class="setting-field">
                <input id="new-referenced-attribute-name" type="text"/>
            </div>
        </div>
    </div>
</div>
