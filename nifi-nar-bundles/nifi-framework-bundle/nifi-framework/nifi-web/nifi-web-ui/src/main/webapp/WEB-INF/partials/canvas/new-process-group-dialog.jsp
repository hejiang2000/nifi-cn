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
<div id="new-process-group-dialog" class="hidden medium-short-dialog">
    <div class="dialog-content">
        <div class="setting">
            <div class="setting-name">处理组名称</div>
            <div class="setting-field">
                <div id="select-file-button">
                    <button class="icon icon-template-import" id="upload-file-field-button" title="浏览"></button>
                    <form id="file-upload-form" enctype="multipart/form-data" method="post">
                        <input type="file" name="file" id="upload-file-field"/>
                    </form>
                </div>
                <input id="new-process-group-name" type="text" placeholder="Enter a name or select a file to upload"/>
            </div>
        </div>
        <div id="file-cancel-button-container">
            <button class="icon" id="file-cancel-button" aria-hidden="true" title="取消选中 file">
                <i class="fa fa-times"></i>
            </button>
        </div>
        <div class="setting">
            <div id="submit-file-container">
                <div class="setting-name">
                    <span id="file-to-upload" title="上传文件">
                        上传文件:
                    </span>
                </div>
                <div id="selected-file-name"></div>
            </div>
        </div>
    </div>
    <div class="setting">
        <span id="import-process-group-link" class="link" title="从数据库导入流程">
            <i class="fa fa-cloud-download" aria-hidden="true" style="margin-left: 5px; margin-right: 5px;"></i>
            从数据流程版本注册库导入...
        </span>
    </div>
</div>