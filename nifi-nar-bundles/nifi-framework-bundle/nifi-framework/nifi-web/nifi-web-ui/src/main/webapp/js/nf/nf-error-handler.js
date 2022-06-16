/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global define, module, require, exports */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery',
                'nf.Dialog',
                'nf.Common'],
            function ($, nfDialog, nfCommon) {
                return (nf.ErrorHandler = factory($, nfDialog, nfCommon));
            });
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = (nf.ErrorHandler = factory(require('jquery'),
            require('nf.Dialog'),
            require('nf.Common')));
    } else {
        nf.ErrorHandler = factory(root.$,
            root.nf.Dialog,
            root.nf.Common);
    }
}(this, function ($, nfDialog, nfCommon) {
    'use strict';

    var self = {
        /**
         * Method for handling ajax errors.
         *
         * @argument {object} xhr       The XmlHttpRequest
         * @argument {string} status    The status of the request
         * @argument {string} error     The error
         */
        handleAjaxError: function (xhr, status, error) {
            if (status === 'canceled') {
                if ($('#splash').is(':visible')) {
                    $('#message-title').text('会话已过期');
                    $('#message-content').text('你的会话已过期. 请重新加载页面进行登录.');

                    // show the error pane
                    $('#message-pane').show();
                } else {
                    nfDialog.showOkDialog({
                        headerText: '会话已过期',
                        dialogContent: '你的会话已过期. 请点击确定重新登录.',
                        okHandler: function () {
                            window.location = '../nifi/';
                        }
                    });
                }
                return;
            }

            // if an error occurs while the splash screen is visible close the canvas show the error message
            if ($('#splash').is(':visible')) {
                if (xhr.status === 401) {
                    $('#message-title').text('未授权');
                } else if (xhr.status === 403) {
                    $('#message-title').text('权限不足');
                } else if (xhr.status === 409) {
                    $('#message-title').text('无效状态');
                } else if (xhr.status === 413) {
                    $('#message-title').text('负荷太大');
                } else {
                    $('#message-title').text('发生未知错误');
                }

                if ($.trim(xhr.responseText) === '') {
                    $('#message-content').text('请检查日志.');
                } else {
                    $('#message-content').text(xhr.responseText);
                }

                // show the error pane
                $('#message-pane').show();
                return;
            }

            // status code 400, 404, 409, and 413 are expected response codes for nfCommon errors.
            if (xhr.status === 400 || xhr.status === 404 || xhr.status === 409 || xhr.status == 413 || xhr.status === 503) {
                nfDialog.showOkDialog({
                    headerText: '错误',
                    dialogContent: nfCommon.escapeHtml(xhr.responseText)
                });
            } else if (xhr.status === 403) {
                nfDialog.showOkDialog({
                    headerText: '权限不足',
                    dialogContent: nfCommon.escapeHtml(xhr.responseText)
                });
            } else {
                if (xhr.status < 99 || xhr.status === 12007 || xhr.status === 12029) {
                    var content = '请确认应用程序运行正常并检查日志中的错误信息.';
                    if (nfCommon.isDefinedAndNotNull(status)) {
                        if (status === 'timeout') {
                            content = '请求超时. 请确认应用程序运行正常并检查日志中的错误信息.';
                        } else if (status === 'abort') {
                            content = '请求已失败.';
                        } else if (status === 'No Transport') {
                            content = '请求传输机制失败. 请检查应用程序所在主机通信正常.';
                        }
                    }
                    $('#message-title').text('与 NiFi 通信失败');
                    $('#message-content').text(content);
                } else if (xhr.status === 401) {
                    $('#message-title').text('未授权');
                    if ($.trim(xhr.responseText) === '') {
                        $('#message-content').text('使用该 NiFi 需要登录认证.');
                    } else {
                        $('#message-content').text(xhr.responseText);
                    }
                } else if (xhr.status === 500) {
                    $('#message-title').text('发生未知错误');
                    if ($.trim(xhr.responseText) === '') {
                        $('#message-content').text('与应用内核通信时发生错误. 请检查日志, 解决任何配置问题, 然后重新启动.');
                    } else {
                        $('#message-content').text(xhr.responseText);
                    }
                } else if (xhr.status === 200 || xhr.status === 201) {
                    $('#message-title').text('解析错误');
                    if ($.trim(xhr.responseText) === '') {
                        $('#message-content').text('解释来自 NiFi 的响应出错.');
                    } else {
                        $('#message-content').text(xhr.responseText);
                    }
                } else {
                    $('#message-title').text(xhr.status + ': Unexpected Response');
                    $('#message-content').text('发生未知错误. 请检查日志.');
                }

                // show the error pane
                $('#message-pane').show();
            }
        },

        /**
         * Method for handling ajax errors when submitting configuration update (PUT/POST) requests.
         * In addition to what handleAjaxError does, this function splits
         * the error message text to display them as an unordered list.
         *
         * @argument {object} xhr       The XmlHttpRequest
         * @argument {string} status    The status of the request
         * @argument {string} error     The error
         */
        handleConfigurationUpdateAjaxError: function (xhr, status, error) {
            if (xhr.status === 400) {
                var errors = xhr.responseText.split('\n');

                var content;
                if (errors.length === 1) {
                    content = $('<span></span>').text(errors[0]);
                } else {
                    content = nfCommon.formatUnorderedList(errors);
                }

                nfDialog.showOkDialog({
                    dialogContent: content,
                    headerText: '配置错误'
                });
            } else {
                self.handleAjaxError(xhr, status, error);
            }
        }
    };
    return self;
}));