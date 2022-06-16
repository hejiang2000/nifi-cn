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
                'nf.CountersTable',
                'nf.ErrorHandler',
                'nf.Storage'],
            function ($, nfCommon, nfCountersTable, nfErrorHandler, nfStorage) {
                return (nf.Counters = factory($, nfCommon, nfCountersTable, nfErrorHandler, nfStorage));
            });
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = (nf.Counters =
            factory(require('jquery'),
                require('nf.Common'),
                require('nf.CountersTable'),
                require('nf.ErrorHandler'),
                require('nf.Storage')));
    } else {
        nf.Counters = factory(root.$,
            root.nf.Common,
            root.nf.CountersTable,
            root.nf.ErrorHandler,
            root.nf.Storage);
    }
}(this, function ($, nfCommon, nfCountersTable, nfErrorHandler, nfStorage) {
    'use strict';

    $(document).ready(function () {
        // initialize the counters page
        nfCounters.init();
    });

    /**
     * Configuration object used to hold a number of configuration items.
     */
    var config = {
        urls: {
            banners: '../nifi-api/flow/banners',
            about: '../nifi-api/flow/about',
            currentUser: '../nifi-api/flow/current-user'
        }
    };

    /**
     * Loads the current user.
     */
    var loadCurrentUser = function () {
        return $.ajax({
            type: 'GET',
            url: config.urls.currentUser,
            dataType: 'json'
        }).done(function (currentUser) {
            nfCommon.setCurrentUser(currentUser);

        }).fail(nfErrorHandler.handleAjaxError);
    };

    /**
     * Initializes the counters page.
     */
    var initializeCountersPage = function () {
        // define mouse over event for the refresh button
        $('#refresh-button').click(function () {
            nfCountersTable.loadCountersTable();
        });

        // return a deferred for page initialization
        return $.Deferred(function (deferred) {
            // get the banners if we're not in the shell
            if (top === window) {
                $.ajax({
                    type: 'GET',
                    url: config.urls.banners,
                    dataType: 'json'
                }).done(function (response) {
                    // ensure the banners response is specified
                    if (nfCommon.isDefinedAndNotNull(response.banners)) {
                        if (nfCommon.isDefinedAndNotNull(response.banners.headerText) && response.banners.headerText !== '') {
                            // update the header text
                            var bannerHeader = $('#banner-header').text(response.banners.headerText).show();

                            // show the banner
                            var updateTop = function (elementId) {
                                var element = $('#' + elementId);
                                element.css('top', (parseInt(bannerHeader.css('height'), 10) + parseInt(element.css('top'), 10)) + 'px');
                            };

                            // update the position of elements affected by top banners
                            updateTop('counters');
                        }

                        if (nfCommon.isDefinedAndNotNull(response.banners.footerText) && response.banners.footerText !== '') {
                            // update the footer text and show it
                            var bannerFooter = $('#banner-footer').text(response.banners.footerText).show();

                            var updateBottom = function (elementId) {
                                var element = $('#' + elementId);
                                element.css('bottom', parseInt(bannerFooter.css('height'), 10) + 'px');
                            };

                            // update the position of elements affected by bottom banners
                            updateBottom('counters');
                        }
                    }

                    deferred.resolve();
                }).fail(function (xhr, status, error) {
                    nfErrorHandler.handleAjaxError(xhr, status, error);
                    deferred.reject();
                });
            } else {
                deferred.resolve();
            }
        }).promise();
    };

    var nfCounters = {
        /**
         * Initializes the counters page.
         */
        init: function () {
            nfStorage.init();

            // load the current user
            loadCurrentUser().done(function () {
                // create the counters table
                nfCountersTable.init();

                // load the table
                nfCountersTable.loadCountersTable().done(function () {
                    // once the table is initialized, finish initializing the page
                    initializeCountersPage().done(function () {
                        var setBodySize = function () {
                            //alter styles if we're not in the shell
                            if (top === window) {
                                $('body').css({
                                    'height': $(window).height() + 'px',
                                    'width': $(window).width() + 'px'
                                });

                                $('#counters').css('margin', 40);
                                $('#counters-table').css('bottom', 127);
                                $('#counters-refresh-container').css('margin', 40);
                            }

                            // configure the initial grid height
                            nfCountersTable.resetTableSize();
                        };

                        // get the about details
                        $.ajax({
                            type: 'GET',
                            url: config.urls.about,
                            dataType: 'json'
                        }).done(function (response) {
                            var aboutDetails = response.about;
                            var countersTitle = aboutDetails.title + ' 计数器';

                            // set the document title and the about title
                            document.title = countersTitle;
                            $('#counters-header-text').text(countersTitle);

                            // set the initial size
                            setBodySize();
                        }).fail(nfErrorHandler.handleAjaxError);

                        $(window).on('resize', function (e) {
                            setBodySize();
                            // resize dialogs when appropriate
                            var dialogs = $('.dialog');
                            for (var i = 0, len = dialogs.length; i < len; i++) {
                                if ($(dialogs[i]).is(':visible')) {
                                    setTimeout(function (dialog) {
                                        dialog.modal('resize');
                                    }, 50, $(dialogs[i]));
                                }
                            }

                            // resize grids when appropriate
                            var gridElements = $('*[class*="slickgrid_"]');
                            for (var j = 0, len = gridElements.length; j < len; j++) {
                                if ($(gridElements[j]).is(':visible')) {
                                    setTimeout(function (gridElement) {
                                        gridElement.data('gridInstance').resizeCanvas();
                                    }, 50, $(gridElements[j]));
                                }
                            }

                            // toggle tabs .scrollable when appropriate
                            var tabsContainers = $('.tab-container');
                            var tabsContents = [];
                            for (var k = 0, len = tabsContainers.length; k < len; k++) {
                                if ($(tabsContainers[k]).is(':visible')) {
                                    tabsContents.push($('#' + $(tabsContainers[k]).attr('id') + '-content'));
                                }
                            }
                            $.each(tabsContents, function (index, tabsContent) {
                                nfCommon.toggleScrollable(tabsContent.get(0));
                            });
                        });
                    });
                });
            });
        }
    };

    return nfCounters;
}));