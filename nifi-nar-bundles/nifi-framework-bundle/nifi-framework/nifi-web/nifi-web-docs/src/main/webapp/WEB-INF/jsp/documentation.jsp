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
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <link rel="shortcut icon" href="../nifi/images/nifi16.ico"/>
        <title>NiFi 文档</title>
        <script type="text/javascript" src="../nifi/assets/jquery/dist/jquery.min.js"></script>
        <script type="text/javascript" src="js/application.js"></script>
        <link href="css/main.css" rel="stylesheet" type="text/css" />
        <link href="css/component-usage.css" rel="stylesheet" type="text/css" />
    </head>
    <body id="documentation-body">
        <div id="banner-header" class="main-banner-header"></div>
        <span id="initial-selection-type" style="display: none;">
            <%= request.getParameter("select") == null ? "" : org.apache.nifi.util.EscapeUtils.escapeHtml(request.getParameter("select")) %>
        </span>
        <span id="initial-selection-bundle-group" style="display: none;">
            <%= request.getParameter("group") == null ? "" : org.apache.nifi.util.EscapeUtils.escapeHtml(request.getParameter("group")) %>
        </span>
        <span id="initial-selection-bundle-artifact" style="display: none;">
            <%= request.getParameter("artifact") == null ? "" : org.apache.nifi.util.EscapeUtils.escapeHtml(request.getParameter("artifact")) %>
        </span>
        <span id="initial-selection-bundle-version" style="display: none;">
            <%= request.getParameter("version") == null ? "" : org.apache.nifi.util.EscapeUtils.escapeHtml(request.getParameter("version")) %>
        </span>
        <div id="documentation-header" class="documentation-header">
            <div id="component-list-toggle-link">-</div>
            <div id="header-contents">
                <div id="nf-title">NiFi 文档</div>
                <div id="nf-version" class="version"></div>
                <div id="selected-component"></div>
            </div>
        </div>
        <div id="component-root-container">
            <div id="component-listing-container">
                <div id="component-listing" class="component-listing">
                    <div class="section">
                        <div class="header">通用</div>
                        <div id="general-links" class="component-links">
                            <ul>
                                <li class="component-item"><a class="document-link overview" href="html/overview.html" target="component-usage">总览</a></li>
                                <li class="component-item"><a class="document-link getting-started" href="html/getting-started.html" target="component-usage">快速入门</a></li>
                                <li class="component-item"><a class="document-link user-guide" href="html/user-guide.html" target="component-usage">用户指南</a></li>
                                <li class="component-item"><a class="document-link expression-language-guide" href="html/expression-language-guide.html" target="component-usage">表达式语言指南</a></li>
                                <li class="component-item"><a class="document-link record-path-guide" href="html/record-path-guide.html" target="component-usage">RecordPath 指南</a></li>
                                <li class="component-item"><a class="document-link admin-guide" href="html/administration-guide.html" target="component-usage">管理人员指南</a></li>
                                <li class="component-item"><a class="document-link toolkit-guide" href="html/toolkit-guide.html" target="component-usage">Toolkit 指南</a></li>
                                <li class="component-item"><a class="document-link walkthroughs" href="html/walkthroughs.html" target="component-usage">引导教程</a></li>
                            </ul>
                            <span class="no-matching no-components hidden">没有匹配的指南文档</span>
                        </div>
                    </div>
                    <div class="section">
                        <div class="header">开发人员</div>
                        <div id="developer-links" class="component-links">
                            <ul>
                                <li class="component-item"><a class="document-link rest-api" href="rest-api/index.html" target="component-usage">REST API 接口</a></li>
                                <li class="component-item"><a class="document-link developer-guide" href="html/developer-guide.html" target="component-usage">开发人员指南</a></li>
                                <li class="component-item"><a class="document-link apache-nifi-in-depth" href="html/nifi-in-depth.html" target="component-usage">Apache NiFi 深度理解</a></li>
                            </ul>
                            <span class="no-matching no-components hidden">没有匹配的开发指南</span>
                        </div>
                    </div>
                    <div class="section">
                        <div class="header">处理器</div>
                        <div id="processor-links" class="component-links">
                            <c:choose>
                                <c:when test="${not empty processors}">
                                    <ul>
                                    <c:forEach var="entry" items="${processors}">
                                        <c:forEach var="bundleEntry" items="${processorBundleLookup[entry.value]}">
                                            <li class="component-item">
                                                <span class="bundle-group hidden">${bundleEntry.group}</span>
                                                <span class="bundle-artifact hidden">${bundleEntry.id}</span>
                                                <span class="bundle-version hidden">${bundleEntry.version}</span>
                                                <span class="extension-class hidden">${entry.value}</span>
                                                <a class="component-link" href="components/${bundleEntry.group}/${bundleEntry.id}/${bundleEntry.version}/${entry.value}/index.html" target="component-usage">
                                                    <c:choose>
                                                        <c:when test="${bundleEntry.version == 'unversioned'}">
                                                            ${entry.key}
                                                        </c:when>
                                                        <c:otherwise>
                                                            ${entry.key} <span class="version">${bundleEntry.version}</span>
                                                        </c:otherwise>
                                                    </c:choose>
                                                </a>
                                            </li>
                                        </c:forEach>
                                    </c:forEach>
                                    </ul>
                                    <span class="no-matching no-components hidden">没有匹配的处理器</span>
                                </c:when>
                                <c:otherwise>
                                    <span class="no-components">未发现处理器文档</span>
                                </c:otherwise>
                            </c:choose>
                        </div>
                    </div>
                    <div class="section">
                        <div class="header">控制器服务</div>
                        <div id="controller-service-links" class="component-links">
                            <c:choose>
                                <c:when test="${not empty controllerServices}">
                                    <ul>
                                    <c:forEach var="entry" items="${controllerServices}">
                                        <c:forEach var="bundleEntry" items="${controllerServiceBundleLookup[entry.value]}">
                                            <li class="component-item">
                                                <span class="bundle-group hidden">${bundleEntry.group}</span>
                                                <span class="bundle-artifact hidden">${bundleEntry.id}</span>
                                                <span class="bundle-version hidden">${bundleEntry.version}</span>
                                                <span class="extension-class hidden">${entry.value}</span>
                                                <a class="component-link"
                                                   href="components/${bundleEntry.group}/${bundleEntry.id}/${bundleEntry.version}/${entry.value}/index.html" target="component-usage">
                                                    <c:choose>
                                                        <c:when test="${bundleEntry.version == 'unversioned'}">
                                                            ${entry.key}
                                                        </c:when>
                                                        <c:otherwise>
                                                            ${entry.key} <span class="version">${bundleEntry.version}</span>
                                                        </c:otherwise>
                                                    </c:choose>
                                                </a>
                                            </li>
                                        </c:forEach>
                                    </c:forEach>
                                    </ul>
                                    <span class="no-matching no-components hidden">没有匹配的控制器服务</span>
                                </c:when>
                                <c:otherwise>
                                    <span class="no-components">未发现控制器服务文档</span>
                                </c:otherwise>
                            </c:choose>
                        </div>
                    </div>
                    <div class="section">
                        <div class="header">报告任务</div>
                        <div id="reporting-task-links" class="component-links">
                            <c:choose>
                                <c:when test="${not empty reportingTasks}">
                                    <ul>
                                    <c:forEach var="entry" items="${reportingTasks}">
                                        <c:forEach var="bundleEntry" items="${reportingTaskBundleLookup[entry.value]}">
                                            <li class="component-item">
                                                <span class="bundle-group hidden">${bundleEntry.group}</span>
                                                <span class="bundle-artifact hidden">${bundleEntry.id}</span>
                                                <span class="bundle-version hidden">${bundleEntry.version}</span>
                                                <span class="extension-class hidden">${entry.value}</span>
                                                <a class="component-link" href="components/${bundleEntry.group}/${bundleEntry.id}/${bundleEntry.version}/${entry.value}/index.html" target="component-usage">
                                                    <c:choose>
                                                        <c:when test="${bundleEntry.version == 'unversioned'}">
                                                            ${entry.key}
                                                        </c:when>
                                                        <c:otherwise>
                                                            ${entry.key} <span class="version">${bundleEntry.version}</span>
                                                        </c:otherwise>
                                                    </c:choose>
                                                </a>
                                            </li>
                                        </c:forEach>
                                    </c:forEach>
                                    </ul>
                                    <span class="no-matching no-components hidden">没有匹配的报告任务</span>
                                </c:when>
                                <c:otherwise>
                                    <span class="no-components">未发现报告任务文档</span>
                                </c:otherwise>
                            </c:choose>
                        </div>
                    </div>
                </div>
                <div id="component-filter-controls">
                    <div id="component-filter-container">
                        <input type="text" id="component-filter"/>
                    </div>
                    <div id="component-filter-stats">
                        显示&nbsp;<span id="displayed-components">${totalComponents}</span>&nbsp;of&nbsp;${totalComponents}
                    </div>
                </div>
            </div>
            <div id="component-usage-container">
                <iframe id="component-usage" name="component-usage" frameborder="0" class="component-usage"></iframe>
            </div>
        </div>
        <div id="banner-footer" class="main-banner-footer"></div>
    </body>
</html>
