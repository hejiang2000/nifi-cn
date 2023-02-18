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
<html lang="en" xml:lang="en" xmlns="http://www.w3.org/1999/xhtml">
<%
    // Sanitize the contextPath to ensure it is on this server
    // rather than getting it from the header directly
    String contextPath = request.getAttribute("contextPath").toString();
%>
    <head>
        <title><%= request.getAttribute("title") == null ? "" : org.apache.nifi.util.EscapeUtils.escapeHtml(request.getAttribute("title").toString()) %></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <link rel="shortcut icon" href="<%= contextPath %>/images/nifi16.ico"/>
        <link rel="stylesheet" href="<%= contextPath %>/nifi/assets/reset.css/reset.css" type="text/css" />
        <link rel="stylesheet" href="<%= contextPath %>/nifi/css/common-ui.css" type="text/css" />
        <link rel="stylesheet" href="<%= contextPath %>/nifi/fonts/flowfont/flowfont.css" type="text/css" />
        <link rel="stylesheet" href="<%= contextPath %>/nifi/assets/font-awesome/css/font-awesome.min.css" type="text/css" />
        <link rel="stylesheet" href="<%= contextPath %>/nifi/css/message-pane.css" type="text/css" />
        <link rel="stylesheet" href="<%= contextPath %>/nifi/css/message-page.css" type="text/css" />
        <script type="text/javascript" src="<%= contextPath %>/nifi/assets/jquery/dist/jquery.min.js"></script>
        <script type="text/javascript">
            $(document).ready(function () {
                $('#user-home').on('mouseenter', function () {
                    $(this).addClass('link-over');
                }).on('mouseleave', function () {
                    $(this).removeClass('link-over');
                }).on('click', function () {
                    window.location = '<%= contextPath %>/nifi/';
                });
            });
        </script>
    </head>

    <body class="message-pane">
        <div class="message-pane-message-box">
            <div class="message-pane-title"><%= request.getAttribute("title") == null ? "" : org.apache.nifi.util.EscapeUtils.escapeHtml(request.getAttribute("title").toString()) %></div>
            <div id="user-links-container" style="margin-left: 20px; float: left;">
                <ul class="links">
                    <li>
                        <span id="user-home" class="link">首页</span>
                    </li>
                </ul>
            </div>
            <div class="message-pane-content"><%= request.getAttribute("messages") == null ? "" : org.apache.nifi.util.EscapeUtils.escapeHtml(request.getAttribute("messages").toString()) %></div>
        </div>
    </body>
</html>
