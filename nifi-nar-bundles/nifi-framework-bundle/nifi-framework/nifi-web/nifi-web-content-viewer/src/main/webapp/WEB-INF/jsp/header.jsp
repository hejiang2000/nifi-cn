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
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <link rel="shortcut icon" href="../nifi/images/nifi16.ico"/>
        <title>NiFi 中文版</title>
        <link rel="stylesheet" href="../nifi/assets/reset.css/reset.css" type="text/css" />
        <link rel="stylesheet" href="css/main.css" type="text/css" />
        <link rel="stylesheet" href="../nifi/css/common-ui.css" type="text/css" />
        <link rel="stylesheet" href="../nifi/fonts/flowfont/flowfont.css" type="text/css" />
        <link rel="stylesheet" href="../nifi/assets/font-awesome/css/font-awesome.min.css" type="text/css" />
        <link rel="stylesheet" href="../nifi/css/message-pane.css" type="text/css" />
        <link rel="stylesheet" href="../nifi/css/message-page.css" type="text/css" />
        <link rel="stylesheet" href="../nifi/js/jquery/combo/jquery.combo.css" type="text/css" />
        <link rel="stylesheet" href="../nifi/js/jquery/modal/jquery.modal.css" type="text/css" />
        <script type="text/javascript" src="../nifi/assets/jquery/dist/jquery.min.js"></script>
        <script type="text/javascript" src="../nifi/js/jquery/jquery.center.js"></script>
        <script type="text/javascript" src="../nifi/js/jquery/combo/jquery.combo.js"></script>
        <script type="text/javascript" src="../nifi/js/jquery/modal/jquery.modal.js"></script>
        <script type="text/javascript" src="../nifi/js/nf/nf-namespace.js"></script>
        <script type="text/javascript" src="../nifi/js/nf/nf-authorization-storage.js"></script>
        <script type="text/javascript" src="../nifi/js/nf/nf-storage.js"></script>
        <script type="text/javascript" src="../nifi/js/nf/nf-ajax-setup.js"></script>
        <script type="text/javascript" src="../nifi/js/nf/nf-universal-capture.js"></script>
        <script type="text/javascript">
            var $$ = $.noConflict(true);
            $$(document).ready(function () {
                // initialize the dialog
                $$('#content-viewer-message-dialog').modal({
                    overlayBackground: false,
                    buttons: [{
                        buttonText: 'Ok',
                        color: {
                            base: '#728E9B',
                            hover: '#004849',
                            text: '#ffffff'
                        },
                        handler: {
                            click: function () {
                                $$('#content-viewer-message-dialog').modal('hide');
                            }
                        }
                    }],
                    handler: {
                        close: function () {
                            $$('#content-viewer-message').text('');
                        }
                    }
                });

                var ref = $$('#ref').text();
                
                // create the parameters
                var params = {
                    ref: ref
                };
                
                // include the cluster node if appropriate
                var clusterNodeId = $$('#clusterNodeId').text();
                if (clusterNodeId !== '') {
                    params['clusterNodeId'] = clusterNodeId;
                }
                
                // determine the appropriate mode to select initially
                var initialMode = $$('#mode').text();
                if (initialMode === '') {
                    initialMode = 'Original';
                }
                
                var currentLocation = null;
                $$('#view-as').combo({
                    options: [{
                            text: 'original',
                            value: 'Original'
                        }, {
                            text: 'formatted',
                            value: 'Formatted'
                        }, {
                            text: 'hex',
                            value: 'Hex'
                        }],
                    selectedOption: {
                        value: initialMode
                    },
                    select: function (option) {
                        // just record the selection during creation
                        if (currentLocation === null) {
                            currentLocation = option.value;
                            return;
                        }

                        // if the selection has changesd, reload the page
                        if (currentLocation !== option.value) {
                            var contentParameter = {
                                mode: option.value
                            };

                            var url = window.location.origin + window.location.pathname;
                            window.location.href = url + '?' + $$.param($$.extend(contentParameter, params));
                        }
                    }
                });
            });
        </script>
    </head>
    <body class="message-pane">
        <span id="ref" class="hidden"><%= org.apache.nifi.util.EscapeUtils.escapeHtml(request.getParameter("ref")) %></span>
        <span id="clusterNodeId" class="hidden"><%= request.getParameter("clusterNodeId") == null ? "" : org.apache.nifi.util.EscapeUtils.escapeHtml(request.getParameter("clusterNodeId")) %></span>
        <span id="mode" class="hidden"><%= request.getParameter("mode") == null ? "" : org.apache.nifi.util.EscapeUtils.escapeHtml(request.getParameter("mode")) %></span>
        <div id="content-viewer-message-dialog">
            <div class="dialog-content" style="margin-top: -20px;">
                <div id="content-viewer-message"></div>
            </div>
        </div>
        <div id="view-as-label">查看方式:</div>
        <div id="view-as" class="pointer button-normal"></div>
        <div id="content-filename"><span class="content-label">文件名称:</span><%= request.getAttribute("filename") == null ? "" : org.apache.nifi.util.EscapeUtils.escapeHtml(request.getAttribute("filename").toString()) %></div>
        <div id="content-type"><span class="content-label">正文类型:</span><%= request.getAttribute("contentType") == null ? "" : org.apache.nifi.util.EscapeUtils.escapeHtml(request.getAttribute("contentType").toString()) %></div>
        <div class="message-pane-message-box">
