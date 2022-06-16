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
                'nf.ErrorHandler',
                'nf.Common',
                'nf.Dialog',
                'nf.Storage',
                'nf.Client',
                'nf.CanvasUtils',
                'nf.ng.Bridge',
                'nf.Processor',
                'nf.ClusterSummary',
                'nf.CustomUi',
                'nf.Verify',
                'nf.UniversalCapture',
                'nf.Connection'],
            function ($, nfErrorHandler, nfCommon, nfDialog, nfStorage, nfClient, nfCanvasUtils, nfNgBridge, nfProcessor, nfClusterSummary, nfCustomUi, nfVerify, nfUniversalCapture, nfConnection) {
                return (nf.ProcessorConfiguration = factory($, nfErrorHandler, nfCommon, nfDialog, nfStorage, nfClient, nfCanvasUtils, nfNgBridge, nfProcessor, nfClusterSummary, nfCustomUi, nfVerify, nfUniversalCapture, nfConnection));
            });
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = (nf.ProcessorConfiguration =
            factory(require('jquery'),
                require('nf.ErrorHandler'),
                require('nf.Common'),
                require('nf.Dialog'),
                require('nf.Storage'),
                require('nf.Client'),
                require('nf.CanvasUtils'),
                require('nf.ng.Bridge'),
                require('nf.Processor'),
                require('nf.ClusterSummary'),
                require('nf.CustomUi'),
                require('nf.Verify'),
                require('nf.UniversalCapture'),
                require('nf.Connection')));
    } else {
        nf.ProcessorConfiguration = factory(root.$,
            root.nf.ErrorHandler,
            root.nf.Common,
            root.nf.Dialog,
            root.nf.Storage,
            root.nf.Client,
            root.nf.CanvasUtils,
            root.nf.ng.Bridge,
            root.nf.Processor,
            root.nf.ClusterSummary,
            root.nf.CustomUi,
            root.nf.Verify,
            root.nf.UniversalCapture,
            root.nf.Connection);
    }
}(this, function ($, nfErrorHandler, nfCommon, nfDialog, nfStorage, nfClient, nfCanvasUtils, nfNgBridge, nfProcessor, nfClusterSummary, nfCustomUi, nfVerify, nfUniversalCapture, nfConnection) {
    'use strict';

    /**
     * Configuration option variable for the nfProcessorDetails dialog
     */
    var config;

    // possible values for a processor's run duration (in millis)
    var RUN_DURATION_VALUES = [0, 25, 50, 100, 250, 500, 1000, 2000];

    // key paths to the status objects
    var ACTIVE_THREAD_COUNT_KEY = 'status.aggregateSnapshot.activeThreadCount',
        RUN_STATUS_KEY = 'status.aggregateSnapshot.runStatus',
        BULLETINS_KEY = 'bulletins';

    // the last submitted referenced attributes
    var referencedAttributes = null;

    /**
     * Gets the available scheduling strategies based on the specified processor.
     *
     * @param {object} processor
     * @returns {Array}
     */
    var getSchedulingStrategies = function (processor) {
        var strategies = [{
            text: '定时驱动',
            value: 'TIMER_DRIVEN',
            description: '处理器将根据运行调度指定的间隔被调度执行.'
        }];

        // conditionally support event driven based on processor
        if (processor.supportsEventDriven === true) {
            strategies.push({
                text: '事件驱动',
                value: 'EVENT_DRIVEN',
                description: '处理器将在事件触发时被调度执行(例如一个 FlowFile 进入输入队列). 该调度策略是试验性的.'
            });
        } else if (processor.config['schedulingStrategy'] === 'EVENT_DRIVEN') {
            // the processor was once configured for event driven but no longer supports it
            strategies.push({
                text: '事件驱动',
                value: 'EVENT_DRIVEN',
                description: '处理器将在事件触发时被调度执行(例如一个 FlowFile 进入输入队列). 该调度策略是试验性的.',
                disabled: true
            });
        }

        // conditionally support event driven
        if (processor.config['schedulingStrategy'] === 'PRIMARY_NODE_ONLY') {
            strategies.push({
                text: '在主节点上',
                value: 'PRIMARY_NODE_ONLY',
                description: '处理器将会在主节点上按运行调度指定间隔调度执行. 该方式已废弃, 请使用下面的执行设置.',
                disabled: true
            });
        }

        // add an option for cron driven
        strategies.push({
            text: 'CRON 驱动',
            value: 'CRON_DRIVEN',
            description: '处理器将根据指定的 CRON 字符串被在特定的时间被调度执行.'
        });

        return strategies;
    };

    /**
     * Gets the available execution nodes based on the specified processor.
     *
     * @param {object} processor
     * @returns {Array}
     */
    var getExecutionNodeOptions = function (processor) {
        return [{
            text: '全部节点',
            value: 'ALL',
            description: '处理器将会在全部节点上被调度执行',
            disabled: processor.executionNodeRestricted === true
        }, {
            text: '主节点',
            value: 'PRIMARY',
            description: '处理器将只会在主节点上被调度执行'
        }];
    };

    /**
     * Creates an option for the specified relationship name.
     *
     * @argument {object} relationship      The relationship
     */
    var createRelationshipOption = function (relationship) {
        var relationshipValue = $('<span class="relationship-name-value hidden"></span>').text(relationship.name);

        // build terminate checkbox element
        var terminateCheckbox = $('<div class="processor-terminate-relationship nf-checkbox"></div>');
        var terminateLabel = $('<div class="relationship-name nf-checkbox-label ellipsis"></div>').text('terminate');
        if (relationship.autoTerminate === true) {
            terminateCheckbox.addClass('checkbox-checked');
        } else {
            terminateCheckbox.addClass('checkbox-unchecked');
        }
        var terminateCheckboxBundle = $('<div class="processor-terminate-relationship-container"></div>').append(terminateCheckbox).append(terminateLabel);

        // build the retry checkbox element
        var retryCheckbox = $('<div class="processor-retry-relationship nf-checkbox"></div>');
        var retryLabel = $('<div class="relationship-name nf-checkbox-label ellipsis"></div>').text('retry');
        if (relationship.retry === true) {
            retryCheckbox.addClass('checkbox-checked');
        } else {
            retryCheckbox.addClass('checkbox-unchecked');
        }
        var retryCheckboxBundle = $('<div class="processor-retry-relationship-container"></div>').append(retryCheckbox).append(retryLabel);

        // build the relationship container element
        var relationshipContainerHeading = $('<div></div>').text(relationship.name);
        var relationshipContainerElement = $('<div class="processor-relationship-container"></div>').append(relationshipContainerHeading).append(terminateCheckboxBundle).append(retryCheckboxBundle).append(relationshipValue).appendTo('#auto-action-relationship-names');
        if (!nfCommon.isBlank(relationship.description)) {
            var relationshipDescription = $('<div class="relationship-description"></div>').text(relationship.description);
            relationshipContainerElement.append(relationshipDescription);
        }

        return relationshipContainerElement;
    };

    /**
     * Determines whether the user has made any changes to the processor configuration
     * that needs to be saved.
     */
    var isSaveRequired = function () {
        var details = $('#processor-configuration').data('processorDetails');

        // determine if any processor settings have changed

        // consider auto terminated relationships
        var autoTerminatedChanged = false;
        var autoTerminated = marshalRelationships('terminate');
        $.each(details.relationships, function (i, relationship) {
            if (relationship.autoTerminate === true) {
                // relationship was auto terminated but is no longer selected
                if ($.inArray(relationship.name, autoTerminated) === -1) {
                    autoTerminatedChanged = true;
                    return false;
                }
            } else if (relationship.autoTerminate === false) {
                // relationship was not auto terminated but is now selected
                if ($.inArray(relationship.name, autoTerminated) >= 0) {
                    autoTerminatedChanged = true;
                    return false;
                }
            }
        });
        if (autoTerminatedChanged) {
            return true;
        }

        // consider retried relationships
        var retriedChanged = false;
        var retried = marshalRelationships('retry');
        $.each(details.relationships, function (i, relationship) {
            if (relationship.retry === true) {
                // relationship was retried but is no longer selected
                if ($.inArray(relationship.name, retried) === -1) {
                    retriedChanged = true;
                    return false;
                }
            } else if (relationship.retry === false) {
                // relationship was not retried but is now selected
                if ($.inArray(relationship.name, retried) >= 0) {
                    retriedChanged = true;
                    return false;
                }
            }
        });
        if (retriedChanged) {
            return true;
        }

        // consider the scheduling strategy
        var schedulingStrategy = $('#scheduling-strategy-combo').combo('getSelectedOption').value;
        if (schedulingStrategy !== (details.config['schedulingStrategy'] + '')) {
            return true;
        }

        // only consider the concurrent tasks if appropriate
        if (details.supportsParallelProcessing === true) {
            // get the appropriate concurrent tasks field
            var concurrentTasks;
            if (schedulingStrategy === 'EVENT_DRIVEN') {
                concurrentTasks = $('#event-driven-concurrently-schedulable-tasks');
            } else if (schedulingStrategy === 'CRON_DRIVEN') {
                concurrentTasks = $('#cron-driven-concurrently-schedulable-tasks');
            } else {
                concurrentTasks = $('#timer-driven-concurrently-schedulable-tasks');
            }

            // check the concurrent tasks
            if (concurrentTasks.val() !== (details.config['concurrentlySchedulableTaskCount'] + '')) {
                return true;
            }
        }

        // get the appropriate scheduling period field
        var schedulingPeriod;
        if (schedulingStrategy === 'CRON_DRIVEN') {
            schedulingPeriod = $('#cron-driven-scheduling-period');
        } else if (schedulingStrategy !== 'EVENT_DRIVEN') {
            schedulingPeriod = $('#timer-driven-scheduling-period');
        }

        // check the scheduling period
        if (nfCommon.isDefinedAndNotNull(schedulingPeriod) && schedulingPeriod.val() !== (details.config['schedulingPeriod'] + '')) {
            return true;
        }

        if ($('#execution-node-combo').combo('getSelectedOption').value !== (details.config['executionNode'] + '')) {
            return true;
        }
        if ($('#processor-name').val() !== details['name']) {
            return true;
        }
        if ($('#processor-enabled').hasClass('checkbox-checked') && details['state'] === 'DISABLED') {
            return true;
        } else if ($('#processor-enabled').hasClass('checkbox-unchecked') && (details['state'] === 'RUNNING' || details['state'] === 'STOPPED')) {
            return true;
        }
        if ($('#penalty-duration').val() !== (details.config['penaltyDuration'] + '')) {
            return true;
        }
        if ($('#yield-duration').val() !== (details.config['yieldDuration'] + '')) {
            return true;
        }
        if ($('#bulletin-level-combo').combo('getSelectedOption').value !== (details.config['bulletinLevel'] + '')) {
            return true;
        }
        if ($('#processor-comments').val() !== details.config['comments']) {
            return true;
        }

        // defer to the property and relationship grids
        return $('#processor-properties').propertytable('isSaveRequired');
    };

    /**
     * Marshals the data that will be used to update the processor's configuration.
     *
     * @param {object} processor
     */
    var marshalDetails = function (processor) {
        // create the config dto
        var processorConfigDto = {};

        // get the scheduling strategy
        var schedulingStrategy = $('#scheduling-strategy-combo').combo('getSelectedOption').value;

        // get the appropriate concurrent tasks field
        var concurrentTasks;
        if (schedulingStrategy === 'EVENT_DRIVEN') {
            concurrentTasks = $('#event-driven-concurrently-schedulable-tasks');
        } else if (schedulingStrategy === 'CRON_DRIVEN') {
            concurrentTasks = $('#cron-driven-concurrently-schedulable-tasks');
        } else {
            concurrentTasks = $('#timer-driven-concurrently-schedulable-tasks');
        }

        // get the concurrent tasks if appropriate
        if (!concurrentTasks.is(':disabled')) {
            processorConfigDto['concurrentlySchedulableTaskCount'] = concurrentTasks.val();
        }

        // get the appropriate scheduling period field
        var schedulingPeriod;
        if (schedulingStrategy === 'CRON_DRIVEN') {
            schedulingPeriod = $('#cron-driven-scheduling-period');
        } else if (schedulingStrategy !== 'EVENT_DRIVEN') {
            schedulingPeriod = $('#timer-driven-scheduling-period');
        }

        // get the scheduling period if appropriate
        if (nfCommon.isDefinedAndNotNull(schedulingPeriod)) {
            processorConfigDto['schedulingPeriod'] = schedulingPeriod.val();
        }

        processorConfigDto['executionNode'] = $('#execution-node-combo').combo('getSelectedOption').value;
        processorConfigDto['penaltyDuration'] = $('#penalty-duration').val();
        processorConfigDto['yieldDuration'] = $('#yield-duration').val();
        processorConfigDto['bulletinLevel'] = $('#bulletin-level-combo').combo('getSelectedOption').value;
        processorConfigDto['schedulingStrategy'] = schedulingStrategy;
        processorConfigDto['comments'] = $('#processor-comments').val();

        // run duration
        if (processor.supportsBatching === true) {
            var runDurationIndex = $('#run-duration-slider').slider('value');
            processorConfigDto['runDurationMillis'] = RUN_DURATION_VALUES[runDurationIndex];
        }

        // relationships
        var autoTerminatedRelationships = marshalRelationships('terminate');
        var retriedRelationships = marshalRelationships('retry');

        processorConfigDto['autoTerminatedRelationships'] = autoTerminatedRelationships;
        processorConfigDto['retriedRelationships'] = retriedRelationships;

        if (retriedRelationships.length > 0) {
            processorConfigDto['retryCount'] = $('#retry-attempt-count').val();
            processorConfigDto['backoffMechanism'] = $("input:radio[name ='backoffPolicy']:checked").val();
            processorConfigDto['maxBackoffPeriod'] = $('#max-backoff-period').val();
        }

        // properties
        var properties = $('#processor-properties').propertytable('marshalProperties');

        // set the properties
        if ($.isEmptyObject(properties) === false) {
            processorConfigDto['properties'] = properties;
        }

        // create the processor dto
        var processorDto = {};
        processorDto['id'] = $('#processor-id').text();
        processorDto['name'] = $('#processor-name').val();
        processorDto['config'] = processorConfigDto;

        // mark the processor disabled if appropriate
        if ($('#processor-enabled').hasClass('checkbox-unchecked')) {
            processorDto['state'] = 'DISABLED';
        } else if ($('#processor-enabled').hasClass('checkbox-checked')) {
            processorDto['state'] = 'STOPPED';
        }

        // create the processor entity
        var processorEntity = {};
        processorEntity['component'] = processorDto;

        // return the marshaled details
        return processorEntity;
    };

    /**
     * Marshals the relationships that will be auto terminated and retried
     *
     * @argument {string} relationshipType      The type of relationship to marshal. ie. terminate || retry
     **/
    var marshalRelationships = function(relationshipType) {
        // get all available relationships
        var availableRelationships = $('#auto-action-relationship-names');
        var selectedRelationships = [];

        // go through each relationship to determine which are selected
        $.each(availableRelationships.children(), function (i, relationshipElement) {
            var relationship = $(relationshipElement);

            // get each relationship and its corresponding checkbox
            var relationshipCheck = relationship.children('div.processor-' + relationshipType + '-relationship-container').children('div.processor-' + relationshipType + '-relationship');

            // see if this relationship has been selected
            if (relationshipCheck.hasClass('checkbox-checked')) {
                selectedRelationships.push(relationship.children('span.relationship-name-value').text());
            }
        });

        return selectedRelationships;
    }

    /**
     * Validates the specified details.
     *
     * @argument {object} details       The details to validate
     */
    var validateDetails = function (details) {
        var errors = [];
        var processor = details['component'];
        var config = processor['config'];

        // ensure numeric fields are specified correctly
        if (nfCommon.isDefinedAndNotNull(config['concurrentlySchedulableTaskCount']) && !$.isNumeric(config['concurrentlySchedulableTaskCount'])) {
            errors.push('Concurrent tasks must be an integer value');
        }
        if (nfCommon.isDefinedAndNotNull(config['schedulingPeriod']) && nfCommon.isBlank(config['schedulingPeriod'])) {
            errors.push('Run schedule must be specified');
        }
        if (nfCommon.isBlank(config['penaltyDuration'])) {
            errors.push('Penalty duration must be specified');
        }
        if (nfCommon.isBlank(config['yieldDuration'])) {
            errors.push('Yield duration must be specified');
        }

        if (errors.length > 0) {
            nfDialog.showOkDialog({
                dialogContent: nfCommon.formatUnorderedList(errors),
                headerText: '配置错误'
            });
            return false;
        } else {
            return true;
        }
    };

    /**
     * Reloads the outgoing connections for the specified processor.
     *
     * @param {object} processor
     */
    var reloadProcessorConnections = function (processor) {
        var connections = nfConnection.getComponentConnections(processor.id);
        $.each(connections, function (_, connection) {
            if (connection.permissions.canRead) {
                if (connection.sourceId === processor.id) {
                    nfConnection.reload(connection.id);
                }
            }
        });
    };

    /**
     * Goes to a service configuration from the property table.
     */
    var goToServiceFromProperty = function () {
        return $.Deferred(function (deferred) {
            // close all fields currently being edited
            $('#processor-properties').propertytable('saveRow');

            // determine if changes have been made
            if (isSaveRequired()) {
                // see if those changes should be saved
                nfDialog.showYesNoDialog({
                    headerText: '处理器配置',
                    dialogContent: '跳转到该控制器服务前保存修改?',
                    noHandler: function () {
                        deferred.resolve();
                    },
                    yesHandler: function () {
                        var processor = $('#processor-configuration').data('processorDetails');
                        saveProcessor(processor).done(function () {
                            deferred.resolve();
                        }).fail(function () {
                            deferred.reject();
                        });
                    }
                });
            } else {
                deferred.resolve();
            }
        }).promise();
    };

    /**
     *
     * @param {type} processor
     * @returns {undefined}
     */
    var saveProcessor = function (processor) {
        // marshal the settings and properties and update the processor
        var updatedProcessor = marshalDetails(processor);

        // ensure details are valid as far as we can tell
        if (validateDetails(updatedProcessor)) {
            // set the revision
            var d = nfProcessor.get(processor.id);
            updatedProcessor['revision'] = nfClient.getRevision(d);
            updatedProcessor['disconnectedNodeAcknowledged'] = nfStorage.isDisconnectionAcknowledged();

            // update the selected component
            return $.ajax({
                type: 'PUT',
                data: JSON.stringify(updatedProcessor),
                url: d.uri,
                dataType: 'json',
                contentType: 'application/json'
            }).done(function (response) {
                // set the new processor state based on the response
                nfProcessor.set(response);
            }).fail(nfErrorHandler.handleConfigurationUpdateAjaxError);
        } else {
            return $.Deferred(function (deferred) {
                deferred.reject();
            }).promise();
        }
    };

    /**
     * Handles verification results.
     */
    var handleVerificationResults = function (verificationResults, referencedAttributeMap) {
        // record the most recently submitted referenced attributes
        referencedAttributes = referencedAttributeMap;

        var verificationResultsContainer = $('#processor-properties-verification-results');

        // expand the dialog to make room for the verification result
        if (verificationResultsContainer.is(':visible') === false) {
            // show the verification results
            $('#processor-properties').css('bottom', '40%').propertytable('resetTableSize')
            verificationResultsContainer.show();
        }

        // show borders if appropriate
        var verificationResultsListing = $('#processor-properties-verification-results-listing');
        if (verificationResultsListing.get(0).scrollHeight > Math.round(verificationResultsListing.innerHeight())) {
            verificationResultsListing.css('border-width', '1px');
        }
    };

    return {
        /**
         * Initializes the processor properties tab.
         *
         * @param {options}   The configuration options object for the dialog
         */
        init: function (options) {
            //set the configuration options
            config = options;

            // initialize the properties tabs
            $('#processor-configuration-tabs').tabbs({
                tabStyle: 'tab',
                selectedTabStyle: 'selected-tab',
                scrollableTabContentStyle: 'scrollable',
                tabs: [{
                    name: '设置',
                    tabContentId: 'processor-standard-settings-tab-content'
                }, {
                    name: '调度',
                    tabContentId: 'processor-scheduling-tab-content'
                }, {
                    name: '属性',
                    tabContentId: 'processor-properties-tab-content'
                }, {
                    name: '输出数据流',
                    tabContentId: 'processor-relationships-tab-content'
                }, {
                    name: '说明',
                    tabContentId: 'processor-comments-tab-content'
                }],
                select: function () {
                    // remove all property detail dialogs
                    nfUniversalCapture.removeAllPropertyDetailDialogs();

                    // update the processor property table size in case this is the first time its rendered
                    if ($(this).text() === '属性') {
                        $('#processor-properties').propertytable('resetTableSize');
                    }

                    // close all fields currently being edited
                    $('#processor-properties').propertytable('saveRow');
                }
            });

            // initialize the processor configuration dialog
            $('#processor-configuration').modal({
                scrollableContentStyle: 'scrollable',
                headerText: '配置处理器',
                handler: {
                    close: function () {
                        // empty the relationship list
                        $('#auto-action-relationship-names').empty();

                        // cancel any active edits and clear the table
                        $('#processor-properties').propertytable('cancelEdit').propertytable('clear');

                        // removed the cached processor details
                        $('#processor-configuration').removeData('processorDetails');

                        // clean up an shown verification errors
                        $('#processor-properties-verification-results').hide();
                        $('#processor-properties-verification-results-listing').css('border-width', '0').empty();
                        $('#processor-properties').css('bottom', '0');

                        // clear most recently submitted referenced attributes
                        referencedAttributes = null;

                        //stop any synchronization
                        if (config.supportsStatusBar){
                            $('#processor-configuration-status-bar').statusbar('disconnect');
                        }
                    },
                    open: function () {
                        nfCommon.toggleScrollable($('#' + this.find('.tab-container').attr('id') + '-content').get(0));
                    }
                }
            });

            //if the status bar is supported, initialize it.
            if(config.supportsStatusBar){
                $('#processor-configuration-status-bar').statusbar();
            }

            // initialize the bulletin combo
            $('#bulletin-level-combo').combo({
                options: [{
                    text: 'DEBUG',
                    value: 'DEBUG'
                }, {
                    text: 'INFO',
                    value: 'INFO'
                }, {
                    text: 'WARN',
                    value: 'WARN'
                }, {
                    text: 'ERROR',
                    value: 'ERROR'
                }, {
                    text: '什么都没有',
                    value: 'NONE'
                }]
            });

            // initialize the run duration slider
            $('#run-duration-slider').slider({
                min: 0,
                max: RUN_DURATION_VALUES.length - 1,
                change: function (event, ui) {
                    var processor = $('#processor-configuration').data('processorDetails');
                    if (ui.value > 0 && (processor.inputRequirement === 'INPUT_FORBIDDEN' || processor.inputRequirement === 'INPUT_ALLOWED')) {
                        $('#run-duration-data-loss').show();
                    } else {
                        $('#run-duration-data-loss').hide();
                    }
                }
            });

            // initialize the property table
            $('#processor-properties').propertytable({
                readOnly: false,
                supportsGoTo: true,
                dialogContainer: '#new-processor-property-container',
                descriptorDeferred: function (propertyName) {
                    var processor = $('#processor-configuration').data('processorDetails');
                    var d = nfProcessor.get(processor.id);
                    return $.ajax({
                        type: 'GET',
                        url: d.uri + '/descriptors',
                        data: {
                            propertyName: propertyName
                        },
                        dataType: 'json'
                    }).fail(nfErrorHandler.handleAjaxError);
                },
                parameterDeferred: function (propertyDescriptor, groupId) {
                    return $.Deferred(function (deferred) {
                        if (nfCommon.isDefinedAndNotNull(groupId)) {
                            // processors being configured must be in the current group
                            var parameterContext = nfCanvasUtils.getParameterContext();

                            if (nfCommon.isDefinedAndNotNull(parameterContext)) {
                                $.ajax({
                                    type: 'GET',
                                    url: '../nifi-api/parameter-contexts/' + encodeURIComponent(parameterContext.id),
                                    data: {
                                        includeInheritedParameters: 'true'
                                    },
                                    dataType: 'json'
                                }).done(function (response) {
                                    var sensitive = nfCommon.isSensitiveProperty(propertyDescriptor);

                                    deferred.resolve(response.component.parameters.map(function (parameterEntity) {
                                        return parameterEntity.parameter;
                                    }).filter(function (parameter) {
                                        return parameter.sensitive === sensitive;
                                    }));
                                }).fail(function () {
                                    deferred.resolve([]);
                                });
                            } else {
                                deferred.resolve([]);
                            }
                        } else {
                            deferred.resolve([]);
                        }
                    }).promise();
                },
                goToServiceDeferred: goToServiceFromProperty,
                getParameterContext: function (groupId) {
                    // processors being configured must be in the current group
                    return nfCanvasUtils.getParameterContext();
                }
            });
        },

        /**
         * Shows the configuration dialog for the specified processor.
         *
         * @argument {selection} selection      The selection
         * @argument {cb} callback              The callback function to execute after the dialog is displayed
         */
        showConfiguration: function (selection, cb) {
            if (nfCanvasUtils.isProcessor(selection)) {
                var selectionData = selection.datum();

                // get the processor details
                var processor = selectionData.component;

                var requests = [];

                // reload the processor in case an property descriptors have updated
                requests.push(nfProcessor.reload(processor.id));

                // get the processor history
                requests.push($.ajax({
                    type: 'GET',
                    url: '../nifi-api/flow/history/components/' + encodeURIComponent(processor.id),
                    dataType: 'json'
                }));

                // once everything is loaded, show the dialog
                $.when.apply(window, requests).done(function (processorResult, historyResult) {
                    // get the updated processor'
                    var processorResponse = processorResult[0];
                    processor = processorResponse.component;

                    // get the processor history
                    var processorHistory = historyResult[0].componentHistory;

                    // record the processor details
                    $('#processor-configuration').data('processorDetails', processor);

                    // determine if the enabled checkbox is checked or not
                    var processorEnableStyle = 'checkbox-checked';
                    if (processor['state'] === 'DISABLED') {
                        processorEnableStyle = 'checkbox-unchecked';
                    }

                    // populate the processor settings
                    $('#processor-id').text(processor['id']);

                    $('#processor-type').text(nfCommon.formatType(processor));
                    $('#processor-configuration').modal('setSubtitle', nfCommon.formatType(processor));

                    $('#processor-bundle').text(nfCommon.formatBundle(processor['bundle']));
                    $('#processor-name').val(processor['name']);
                    $('#processor-enabled').removeClass('checkbox-unchecked checkbox-checked').addClass(processorEnableStyle);
                    $('#penalty-duration').val(processor.config['penaltyDuration']);
                    $('#yield-duration').val(processor.config['yieldDuration']);
                    $('#processor-comments').val(processor.config['comments']);

                    // set the run duration if applicable
                    if (processor.supportsBatching === true) {
                        $('#run-duration-setting-container').show();

                        // set the run duration slider value
                        var runDuration = RUN_DURATION_VALUES.indexOf(processor.config['runDurationMillis']);
                        $('#run-duration-slider').slider('value', runDuration);
                    } else {
                        $('#run-duration-setting-container').hide();
                    }

                    // select the appropriate bulletin level
                    $('#bulletin-level-combo').combo('setSelectedOption', {
                        value: processor.config['bulletinLevel']
                    });

                    var schedulingStrategy = processor.config['schedulingStrategy'];

                    // initialize the scheduling strategy
                    $('#scheduling-strategy-combo').combo({
                        options: getSchedulingStrategies(processor),
                        selectedOption: {
                            value: schedulingStrategy
                        },
                        select: function (selectedOption) {
                            // show the appropriate panel
                            if (selectedOption.value === 'EVENT_DRIVEN') {
                                $('#event-driven-warning').show();

                                $('#timer-driven-options').hide();
                                $('#event-driven-options').show();
                                $('#cron-driven-options').hide();
                            } else {
                                $('#event-driven-warning').hide();

                                if (selectedOption.value === 'CRON_DRIVEN') {
                                    $('#timer-driven-options').hide();
                                    $('#event-driven-options').hide();
                                    $('#cron-driven-options').show();
                                } else {
                                    $('#timer-driven-options').show();
                                    $('#event-driven-options').hide();
                                    $('#cron-driven-options').hide();
                                }
                            }
                        }
                    });

                    var executionNode = processor.config['executionNode'];

                    // initialize the execution node combo
                    $('#execution-node-combo').combo({
                        options: getExecutionNodeOptions(processor),
                        selectedOption: {
                            value: executionNode
                        }
                    });

                    $('#execution-node-options').show();

                    // initialize the concurrentTasks
                    var defaultConcurrentTasks = processor.config['defaultConcurrentTasks'];
                    $('#timer-driven-concurrently-schedulable-tasks').val(defaultConcurrentTasks['TIMER_DRIVEN']);
                    $('#event-driven-concurrently-schedulable-tasks').val(defaultConcurrentTasks['EVENT_DRIVEN']);
                    $('#cron-driven-concurrently-schedulable-tasks').val(defaultConcurrentTasks['CRON_DRIVEN']);

                    // get the appropriate concurrent tasks field
                    var concurrentTasks;
                    if (schedulingStrategy === 'EVENT_DRIVEN') {
                        concurrentTasks = $('#event-driven-concurrently-schedulable-tasks').val(processor.config['concurrentlySchedulableTaskCount']);
                    } else if (schedulingStrategy === 'CRON_DRIVEN') {
                        concurrentTasks = $('#cron-driven-concurrently-schedulable-tasks').val(processor.config['concurrentlySchedulableTaskCount']);
                    } else {
                        concurrentTasks = $('#timer-driven-concurrently-schedulable-tasks').val(processor.config['concurrentlySchedulableTaskCount']);
                    }

                    // conditionally allow the user to specify the concurrent tasks
                    if (nfCommon.isDefinedAndNotNull(concurrentTasks)) {
                        if (processor.supportsParallelProcessing === true) {
                            concurrentTasks.prop('disabled', false);
                        } else {
                            concurrentTasks.prop('disabled', true);
                        }
                    }

                    // initialize the schedulingStrategy
                    var defaultSchedulingPeriod = processor.config['defaultSchedulingPeriod'];
                    $('#cron-driven-scheduling-period').val(defaultSchedulingPeriod['CRON_DRIVEN']);
                    $('#timer-driven-scheduling-period').val(defaultSchedulingPeriod['TIMER_DRIVEN']);

                    // set the scheduling period as appropriate
                    if (processor.config['schedulingStrategy'] === 'CRON_DRIVEN') {
                        $('#cron-driven-scheduling-period').val(processor.config['schedulingPeriod']);
                    } else if (processor.config['schedulingStrategy'] !== 'EVENT_DRIVEN') {
                        $('#timer-driven-scheduling-period').val(processor.config['schedulingPeriod']);
                    }

                    // load the relationship list
                    if (!nfCommon.isEmpty(processor.relationships)) {
                        $.each(processor.relationships, function (i, relationship) {
                            createRelationshipOption(relationship);
                        });

                        // set initial disabled value for retry controls
                        var setRetryControlsDisabledState = (function() {
                            var isEnabled = $('#auto-action-relationship-names').find('div.nf-checkbox.processor-retry-relationship.checkbox-checked').length ? true : false;
                            if (isEnabled) {
                                $('#processor-relationships-tab-content .settings-right').show();
                            } else {
                                $('#processor-relationships-tab-content .settings-right').hide();
                            }
                        });
                        setRetryControlsDisabledState();

                        // disble retry controls if no retry checkboxes are checked
                        $('#auto-action-relationship-names').on('change', 'div.nf-checkbox.processor-retry-relationship', function () {
                            setRetryControlsDisabledState();
                        });
                    } else {
                        $('#auto-action-relationship-names').append('<div class="unset">该处理器无输出数据流.</div>');
                    }

                    if (nfCommon.isDefinedAndNotNull(processor.config.backoffMechanism)) {
                        if (processor.config.backoffMechanism === 'PENALIZE_FLOWFILE') {
                            $('.backoff-policy-setting #penalizeFlowFile').prop("checked", true);
                        } else if (processor.config.backoffMechanism === 'YIELD_PROCESSOR') {
                            $('.backoff-policy-setting #yieldEntireProcessor').prop("checked", true);
                        }
                    }

                    if (nfCommon.isDefinedAndNotNull(processor.config.maxBackoffPeriod)) {
                        $('.max-backoff-setting #max-backoff-period').val(processor.config.maxBackoffPeriod);
                    }

                    if (nfCommon.isDefinedAndNotNull(processor.config.retryCount)) {
                        $('.retry-count-setting #retry-attempt-count').val(processor.config.retryCount);
                    }

                    var buttons = [{
                        buttonText: '应用',
                        color: {
                            base: '#728E9B',
                            hover: '#004849',
                            text: '#ffffff'
                        },
                        disabled : function() {
                            return !nfCanvasUtils.supportsModification(selection);
                        },
                        handler: {
                            click: function () {
                                // close all fields currently being edited
                                $('#processor-properties').propertytable('saveRow');

                                // save the processor
                                saveProcessor(processor).done(function (response) {
                                    // reload the processor's outgoing connections
                                    reloadProcessorConnections(processor);

                                    // close the details panel
                                    $('#processor-configuration').modal('hide');

                                    // inform Angular app values have changed
                                    nfNgBridge.digest();
                                });
                            }
                        }
                    },
                    {
                        buttonText: '取消',
                        color: {
                            base: '#E3E8EB',
                            hover: '#C7D2D7',
                            text: '#004849'
                        },
                        handler: {
                            click: function () {
                                $('#processor-configuration').modal('hide');
                            }
                        }
                    }];

                    // determine if we should show the advanced button
                    if (nfCommon.isDefinedAndNotNull(processor.config.customUiUrl) && processor.config.customUiUrl !== '') {
                        buttons.push({
                            buttonText: '高级',
                            clazz: 'fa fa-cog button-icon',
                            color: {
                                base: '#E3E8EB',
                                hover: '#C7D2D7',
                                text: '#004849'
                            },
                            handler: {
                                click: function () {
                                    var openCustomUi = function () {
                                        // reset state and close the dialog manually to avoid hiding the faded background
                                        $('#processor-configuration').modal('hide');

                                        // show the custom ui
                                        nfCustomUi.showCustomUi(processorResponse, processor.config.customUiUrl, true).done(function () {
                                            // once the custom ui is closed, reload the processor
                                            nfProcessor.reload(processor.id);

                                            // and reload the processor's outgoing connections
                                            reloadProcessorConnections(processor);
                                        });
                                    };

                                    // close all fields currently being edited
                                    $('#processor-properties').propertytable('saveRow');

                                    // determine if changes have been made
                                    if (isSaveRequired()) {
                                        // see if those changes should be saved
                                        nfDialog.showYesNoDialog({
                                            headerText: '保存',
                                            dialogContent: '打开高级配置前保存修改?',
                                            noHandler: openCustomUi,
                                            yesHandler: function () {
                                                saveProcessor(processor).done(function (deferred) {
                                                    // open the custom ui
                                                    openCustomUi();
                                                });
                                            }
                                        });
                                    } else {
                                        // if there were no changes, simply open the custom ui
                                        openCustomUi();
                                    }
                                }
                            }
                        });
                    }

                    //Synchronize the current component canvas attributes in the status bar
                    if(config.supportsStatusBar){

                        //initialize the canvas synchronization
                        $("#processor-configuration-status-bar").statusbar('observe',processor.id, function(){
                            $('#processor-configuration').modal('refreshButtons');
                        });

                        //if there are active threads, add the terminate button to the status bar
                        if(nfCommon.isDefinedAndNotNull(config.nfActions) &&
                            nfCommon.getKeyValue(processorResponse,ACTIVE_THREAD_COUNT_KEY) != 0){

                            $("#processor-configuration-status-bar").statusbar('buttons',[{
                                buttonText: '终止',
                                clazz: 'fa fa-hourglass-end button-icon',
                                color: {
                                    hover: '#C7D2D7',
                                    base: 'transparent',
                                    text: '#004849'
                                },
                                disabled : function() {
                                    return nfCanvasUtils.supportsModification(selection);
                                },
                                handler: {
                                    click: function() {
                                        var cb = function(){
                                            var p = nfProcessor.get(processor.id);
                                            if(nfCommon.getKeyValue(p,ACTIVE_THREAD_COUNT_KEY) != 0){
                                                nfDialog.showOkDialog({
                                                    dialogContent: '终止线程请求已处理, 但活跃线程仍然在运行. 请稍后再试.',
                                                    headerText: '未能终止'
                                                });
                                            }
                                            else {
                                                //refresh the dialog
                                                $('#processor-configuration-status-bar').statusbar('refreshButtons');
                                                $('#processor-configuration').modal('refreshButtons');
                                            }
                                            $('#processor-configuration-status-bar').statusbar('showButtons');
                                        };

                                        //execute the terminate call
                                        $('#processor-configuration-status-bar').statusbar('hideButtons');
                                        config.nfActions.terminate(selection,cb);
                                    }
                                }
                            }]);
                        }
                    }
                    // set the button model
                    $('#processor-configuration').modal('setButtonModel', buttons);

                    // load the property table
                    $('#processor-properties')
                        .propertytable('setGroupId', processor.parentGroupId)
                        .propertytable('loadProperties', processor.config.properties, processor.config.descriptors, processorHistory.propertyHistory)
                        .propertytable('setPropertyVerificationCallback', function (proposedProperties) {
                            nfVerify.verify(processor['id'], processorResponse['uri'], proposedProperties, referencedAttributes, handleVerificationResults, $('#processor-properties-verification-results-listing'));
                        });

                    // show the details
                    $('#processor-configuration').modal('show');

                    // add ellipsis if necessary
                    $('#processor-configuration div.relationship-name').ellipsis();

                    // Ensure the properties table has rendered correctly if initially selected
                    if ($('#processor-configuration-tabs').find('.selected-tab').text() === '属性') {
                        $('#processor-properties').propertytable('resetTableSize');
                    }

                    // execute the callback if one was provided
                    if (typeof cb == 'function'){
                        cb();
                    }
                }).fail(nfErrorHandler.handleAjaxError);
            }
        }
    };
}));
