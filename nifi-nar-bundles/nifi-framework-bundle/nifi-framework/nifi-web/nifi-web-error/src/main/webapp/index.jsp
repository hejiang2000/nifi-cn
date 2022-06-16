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
<%
    // Sanitize the contextPath to ensure it is on this server
    // rather than getting it from the header directly
    String contextPath = request.getAttribute("contextPath").toString();
%>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <link rel="shortcut icon" href="<%= contextPath %>/nifi/images/nifi16.ico"/>
    <title>NiFi 中文版</title>
    <link rel="stylesheet" href="<%= contextPath %>/nifi/assets/reset.css/reset.css" type="text/css"/>
    <link rel="stylesheet" href="<%= contextPath %>/nifi/css/common-ui.css" type="text/css"/>
    <link rel="stylesheet" href="<%= contextPath %>/nifi/fonts/flowfont/flowfont.css" type="text/css"/>
    <link rel="stylesheet" href="<%= contextPath %>/nifi/assets/font-awesome/css/font-awesome.min.css" type="text/css"/>
    <link rel="stylesheet" href="<%= contextPath %>/nifi/css/message-pane.css" type="text/css"/>
    <link rel="stylesheet" href="<%= contextPath %>/nifi/css/message-page.css" type="text/css"/>
    <meta http-equiv="Refresh" content="5; url=<%= contextPath %>/nifi/">
</head>

<body class="message-pane">
<div class="message-pane-message-box">
    <p class="message-pane-title">
        应该是这里吧: <a href="<%= contextPath %>/nifi/">/nifi</a>
    </p>
    <p class="message-pane-content">也许你输入有误... 5 秒后将会自动重定向.</p>
</div>
</body>
</html>
