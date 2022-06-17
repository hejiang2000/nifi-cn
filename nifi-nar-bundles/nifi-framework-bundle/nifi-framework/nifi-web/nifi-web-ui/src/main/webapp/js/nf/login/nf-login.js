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

/* global top, define, module, require, exports */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery',
                'nf.Common',
                'nf.Dialog',
                'nf.AuthorizationStorage',
                'nf.Storage'],
            function ($, nfCommon, nfDialog, nfAuthorizationStorage, nfStorage) {
                return (nf.Login = factory($, nfCommon, nfDialog, nfAuthorizationStorage, nfStorage));
            });
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = (nf.Login =
            factory(require('jquery'),
                require('nf.Common'),
                require('nf.Dialog'),
                require('nf.AuthorizationStorage'),
                require('nf.Storage')));
    } else {
        nf.Login = factory(root.$,
            root.nf.Common,
            root.nf.Dialog,
            root.nf.AuthorizationStorage,
            root.nf.Storage);
    }
}(this, function ($, nfCommon, nfDialog, nfAuthorizationStorage, nfStorage) {
    'use strict';

    $(document).ready(function () {
        nfLogin.init();
    });

    var config = {
        urls: {
            token: '../nifi-api/access/token',
            accessStatus: '../nifi-api/access',
            accessConfig: '../nifi-api/access/config'
        }
    };

    var initializeMessage = function () {
        $('#login-message-container').show();
    };

    var showLogin = function () {
        // reset the forms
        $('#username').val('');
        $('#password').val('');
        $('#login-submission-button').text('登录');

        // update the form visibility
        $('#login-container').show();
        $('#nifi-registration-container').hide();

        // set the focus
        $('#username').focus();
    };

    var initializeSubmission = function () {
        $('#login-submission-button').on('click', function () {
            if ($('#login-container').is(':visible')) {
                login();
            }
        });

        $('#login-submission-container').show();
    };

    var login = function () {
        // remove focus
        $('#username, #password').blur();

        // show the logging message...
        $('#login-progress-label').text('正在登录...');
        $('#login-progress-container').show();
        $('#login-submission-container').hide();

        // login submit
        $.ajax({
            type: 'POST',
            url: config.urls.token,
            data: {
                'username': $('#username').val(),
                'password': $('#password').val()
            }
        }).done(function (jwt) {
            var sessionExpiration = nfCommon.getSessionExpiration(jwt);
            if (sessionExpiration) {
                nfAuthorizationStorage.setToken(sessionExpiration);
            }

            // check to see if they actually have access now
            $.ajax({
                type: 'GET',
                url: config.urls.accessStatus,
                dataType: 'json'
            }).done(function (response) {
                var accessStatus = response.accessStatus;

                // update according to the access status
                if (accessStatus.status === 'ACTIVE') {
                    // reload as appropriate - no need to schedule token refresh as the page is reloading
                    if (top !== window) {
                        parent.window.location = '../nifi/';
                    } else {
                        window.location = '../nifi/';
                    }
                } else {
                    $('#login-message-title').text('登录失败');
                    $('#login-message').text(accessStatus.message);

                    // update visibility
                    $('#login-container').hide();
                    $('#login-submission-container').hide();
                    $('#login-progress-container').hide();
                    $('#login-message-container').show();
                }
            }).fail(function (xhr, status, error) {
                $('#login-message-title').text('登录失败');
                $('#login-message').text(xhr.responseText);

                // update visibility
                $('#login-container').hide();
                $('#login-submission-container').hide();
                $('#login-progress-container').hide();
                $('#login-message-container').show();
            });
        }).fail(function (xhr, status, error) {
            nfDialog.showOkDialog({
                headerText: '登录',
                dialogContent: nfCommon.escapeHtml(xhr.responseText)
            });

            // update the form visibility
            $('#login-submission-container').show();
            $('#login-progress-container').hide();
        });
    };

    var nfLogin = {
        /**
         * Initializes the login page.
         */
        init: function () {
            nfStorage.init();

            nfCommon.updateLogoutLink();

            // supporting logging in via enter press
            $('#username, #password').on('keyup', function (e) {
                var code = e.keyCode ? e.keyCode : e.which;
                if (code === $.ui.keyCode.ENTER) {
                    login();
                }
            });

            // access status
            var accessStatus = $.ajax({
                type: 'GET',
                url: config.urls.accessStatus,
                dataType: 'json'
            }).fail(function (xhr, status, error) {
                $('#login-message-title').text('检查访问状态失败');
                $('#login-message').text(xhr.responseText);
                initializeMessage();
            });

            // access config
            var accessConfigXhr = $.ajax({
                type: 'GET',
                url: config.urls.accessConfig,
                dataType: 'json'
            });

            $.when(accessStatus, accessConfigXhr).done(function (accessStatusResult, accessConfigResult) {
                var accessStatusResponse = accessStatusResult[0];
                var accessStatus = accessStatusResponse.accessStatus;

                var accessConfigResponse = accessConfigResult[0];
                var accessConfig = accessConfigResponse.config;

                // possible login states
                var needsLogin = true;
                var showMessage = false;

                // handle the status appropriately
                if (accessStatus.status === 'UNKNOWN') {
                    needsLogin = true;
                } else if (accessStatus.status === 'ACTIVE') {
                    showMessage = true;
                    needsLogin = false;

                    $('#login-message-title').text('成功');
                    $('#login-message').text(accessStatus.message);
                }

                // if login is required, verify its supported
                if (accessConfig.supportsLogin === false && needsLogin === true) {
                    $('#login-message-title').text('拒绝访问');
                    $('#login-message').text('该 NiFi 并未配置为支持用户名/密码登录.');
                    showMessage = true;
                    needsLogin = false;
                }

                // initialize the page as appropriate
                if (showMessage === true) {
                    initializeMessage();
                } else if (needsLogin === true) {
                    showLogin();
                    initializeSubmission();
                }
            });
        }
    };

    return nfLogin;
}));