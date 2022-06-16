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
                'Slick',
                'd3',
                'nf.Client',
                'nf.Dialog',
                'nf.Storage',
                'nf.Common',
                'nf.CanvasUtils',
                'nf.ng.Bridge',
                'nf.ErrorHandler',
                'nf.FilteredDialogCommon',
                'nf.Shell',
                'nf.ComponentState',
                'nf.ComponentVersion',
                'nf.PolicyManagement',
                'nf.Processor',
                'nf.ProcessGroup',
                'nf.ProcessGroupConfiguration',
                'lodash'],
            function ($, Slick, d3, nfClient, nfDialog, nfStorage, nfCommon, nfCanvasUtils, nfNgBridge, nfErrorHandler, nfFilteredDialogCommon, nfShell, nfComponentState, nfComponentVersion, nfPolicyManagement, nfProcessor, nfProcessGroup, nfProcessGroupConfiguration, _) {
                return (nf.ParameterContexts = factory($, Slick, d3, nfClient, nfDialog, nfStorage, nfCommon, nfCanvasUtils, nfNgBridge, nfErrorHandler, nfFilteredDialogCommon, nfShell, nfComponentState, nfComponentVersion, nfPolicyManagement, nfProcessor, nfProcessGroup, nfProcessGroupConfiguration, _));
            });
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = (nf.ParameterContexts =
            factory(require('jquery'),
                require('Slick'),
                require('d3'),
                require('nf.Client'),
                require('nf.Dialog'),
                require('nf.Storage'),
                require('nf.Common'),
                require('nf.CanvasUtils'),
                require('nf.ng.Bridge'),
                require('nf.ErrorHandler'),
                require('nf.FilteredDialogCommon'),
                require('nf.Shell'),
                require('nf.ComponentState'),
                require('nf.ComponentVersion'),
                require('nf.PolicyManagement'),
                require('nf.Processor'),
                require('nf.ProcessGroup'),
                require('nf.ProcessGroupConfiguration'),
                require('lodash')));
    } else {
        nf.ParameterContexts = factory(root.$,
            root.Slick,
            root.d3,
            root.nf.Client,
            root.nf.Dialog,
            root.nf.Storage,
            root.nf.Common,
            root.nf.CanvasUtils,
            root.nf.ng.Bridge,
            root.nf.ErrorHandler,
            root.nf.FilteredDialogCommon,
            root.nf.Shell,
            root.nf.ComponentState,
            root.nf.ComponentVersion,
            root.nf.PolicyManagement,
            root.nf.Processor,
            root.nf.ProcessGroup,
            root.nf.ProcessGroupConfiguration,
            root._);
    }
}(this, function ($, Slick, d3, nfClient, nfDialog, nfStorage, nfCommon, nfCanvasUtils, nfNgBridge, nfErrorHandler, nfFilteredDialogCommon, nfShell, nfComponentState, nfComponentVersion, nfPolicyManagement, nfProcessor, nfProcessGroup, nfProcessGroupConfiguration, _) {
    'use strict';

    var config = {
        urls: {
            parameterContexts: '../nifi-api/parameter-contexts'
        }
    };

    var parameterContextsGridOptions = {
        autosizeColsMode: Slick.GridAutosizeColsMode.LegacyForceFit,
        enableTextSelectionOnCells: true,
        enableCellNavigation: true,
        enableColumnReorder: false,
        autoEdit: false,
        multiSelect: false,
        rowHeight: 24
    };

    var parametersGridOptions = {
        autosizeColsMode: Slick.GridAutosizeColsMode.LegacyForceFit,
        enableTextSelectionOnCells: true,
        enableCellNavigation: true,
        enableColumnReorder: false,
        editable: false,
        enableAddRow: false,
        autoEdit: false,
        multiSelect: false,
        rowHeight: 24
    };

    /**
     * Formatter for the name column.
     *
     * @param {type} row
     * @param {type} cell
     * @param {type} value
     * @param {type} columnDef
     * @param {type} dataContext
     * @returns {String}
     */
    var nameFormatter = function (row, cell, value, columnDef, dataContext) {
        if (!dataContext.permissions.canRead) {
            return '<span class="blank">' + nfCommon.escapeHtml(dataContext.id) + '</span>';
        }

        return nfCommon.escapeHtml(dataContext.component.name);
    };

    /**
     * Sorts the specified data using the specified sort details.
     *
     * @param {object} sortDetails
     * @param {object} data
     */
    var sort = function (sortDetails, data) {
        // defines a function for sorting
        var comparer = function (a, b) {
            if (a.permissions.canRead && b.permissions.canRead) {

                // use _.get to try to access the piece of the object you want, but provide a default value it it is not there
                var aString = _.get(a, 'component[' + sortDetails.columnId + ']', '');
                var bString = _.get(b, 'component[' + sortDetails.columnId + ']', '');
                return aString === bString ? 0 : aString > bString ? 1 : -1;
            } else {
                if (!a.permissions.canRead && !b.permissions.canRead) {
                    return 0;
                }
                if (a.permissions.canRead) {
                    return 1;
                } else {
                    return -1;
                }
            }
        };

        // perform the sort
        data.sort(comparer, sortDetails.sortAsc);
    };

    var lastSelectedId = null;

    /**
     * Sorts the specified data using the specified sort details.
     *
     * @param {object} sortDetails
     * @param {object} data
     */
    var sortParameters = function (sortDetails, data) {
        // defines a function for sorting
        var comparer = function (a, b) {
            // direct parameters always come above inherited ones
            if (a.isInherited === false && b.isInherited === true) {
                return -1;
            }
            if (a.isInherited === true && b.isInherited === false) {
                return 1;
            }
            if (sortDetails.columnId === 'name') {
                var aString = _.get(a, '[' + sortDetails.columnId + ']', '');
                var bString = _.get(b, '[' + sortDetails.columnId + ']', '');
                return aString === bString ? 0 : aString > bString ? 1 : -1;
            }
        };

        // perform the sort
        data.sort(comparer, sortDetails.sortAsc);
    };

    /**
     * Reset the dialog.
     */
    var resetDialog = function () {
        // clean up any tooltips that may have been generated
        nfCommon.cleanUpTooltips($('#parameter-table'), 'div.fa-question-circle, div.fa-info');

        $('#parameter-context-name').val('');
        $('#parameter-context-name-read-only').text('');

        $('#parameter-context-description-field').val('');
        $('#parameter-context-description-read-only').text('');

        $('#parameter-context-referencing-components').empty();

        $('#parameter-table, #add-parameter').show();
        $('#parameter-context-tabs').show();
        $('#parameter-context-tabs').find('.tab')[0].click();
        $('#parameter-context-update-status').hide();

        $('#process-group-parameter').text('');
        $('#parameter-process-group-id').text('').removeData('revision');
        $('#parameter-referencing-components-context').removeClass('unset').attr('title', '').text('');

        var parameterGrid = $('#parameter-table').data('gridInstance');
        var parameterData = parameterGrid.getData();
        parameterGrid.setSelectedRows([]);
        parameterData.setItems([]);

        resetUsage();
        resetInheritance();

        // reset the last selected parameter
        lastSelectedId = null;
        parameterIndex = 0;

        // reset the current parameter context
        currentParameterContextEntity = null;
    };

    /**
     * Resets all of the fields in the add/edit parameter dialog
     */
    var resetParameterDialog = function () {
        $('#parameter-name').val('');
        $('#parameter-value-field').val('');
        $('#parameter-description-field').val('');
        $('#parameter-sensitive-radio-button').prop('checked', false);
        $('#parameter-not-sensitive-radio-button').prop('checked', false);
        $('#parameter-name').prop('disabled', false);
        $('#parameter-sensitive-radio-button').prop('disabled', false);
        $('#parameter-not-sensitive-radio-button').prop('disabled', false);
        $('#parameter-set-empty-string-field').removeClass('checkbox-checked').addClass('checkbox-unchecked');
        $('#parameter-value-field').prop('disabled', false);
    };

    /**
     * Marshals the parameters in the table.
     */
    var marshalParameters = function () {
        var parameters = [];
        var table = $('#parameter-table');
        var parameterGrid = table.data('gridInstance');
        var parameterData = parameterGrid.getData();
        $.each(parameterData.getItems(), function () {
            var parameter = {
                'name': this.name
            };

            // if the parameter has been deleted
            if (this.hidden === true && this.isNew !== true) {
                // hidden parameters were removed by the user, clear the value
                parameters.push({
                    'parameter': parameter
                });
            } else if (this.isNew === true) {
                parameter['value'] = this.value;
                parameter['sensitive'] = this.sensitive;
                parameter['description'] = this.description;

                parameters.push({
                    'parameter': parameter
                });
            } else if (this.isModified === true) {
                parameter['sensitive'] = this.sensitive;

                // if modified grab what's changed
                if (this.hasValueChanged) {
                    parameter['value'] = this.value;

                    if (_.isEmpty(this.value) && !this.isEmptyStringSet) {
                        // No value is set, and the 'Set empty string' checkbox was not set. The value is expected to be null.
                        // Because sensitive parameter values are not known, when a sensitive parameter is updated, its value is send back as null.
                        // To disambiguate between a value explicitly being null, an empty string, and a value not be provided, we need to set the 'valueRemoved' flag.
                        parameter['valueRemoved'] = true;
                    }
                }

                parameter['description'] = this.description;

                parameters.push({
                    'parameter': parameter
                });
            }
        });

        return parameters;
    };

    /**
     * Marshals the inherited parameter contexts.
     */
    var marshalInheritedParameterContexts = function () {
        var inheritedParameterContextIds = $('#parameter-context-selected').sortable('toArray');

        return inheritedParameterContextIds.map(function (id) {
            var name = $('#parameter-context-selected').find('li#' + id + ' span').text();
            return {
                id: id,
                component: {
                    id: id,
                    name: name
                }
            }
        });
    };

    /**
     * Handles outstanding changes.
     *
     * @returns {deferred}
     */
    var handleOutstandingChanges = function () {
        if (!$('#parameter-dialog').hasClass('hidden')) {
            // commit the current edit
            addNewParameter();
        }

        return $.Deferred(function (deferred) {
            if ($('#parameter-context-update-status').is(':visible')) {
                close();
                deferred.resolve();
            } else {
                var parameters = marshalParameters();

                // if there are no parameters there is nothing to save
                if ($.isEmptyObject(parameters)) {
                    close();
                    deferred.resolve();
                } else {
                    // see if those changes should be saved
                    nfDialog.showYesNoDialog({
                        headerText: '参数',
                        dialogContent: '离开参数上下文配置前保存修改?',
                        noHandler: function () {
                            close();
                            deferred.resolve();
                        },
                        yesHandler: function () {
                            updateParameterContext(currentParameterContextEntity).done(function () {
                                deferred.resolve();
                            }).fail(function () {
                                deferred.reject();
                            });
                        }
                    });
                }
            }

        }).promise();
    };

    /**
     * Adds a border to the controller service referencing components if necessary.
     *
     * @argument {jQuery} referenceContainer
     */
    var updateReferencingComponentsBorder = function (referenceContainer) {
        // determine if it is too big
        var tooBig = referenceContainer.get(0).scrollHeight > Math.round(referenceContainer.innerHeight()) ||
            referenceContainer.get(0).scrollWidth > Math.round(referenceContainer.innerWidth());

        // draw the border if necessary
        if (referenceContainer.is(':visible') && tooBig) {
            referenceContainer.css('border-width', '1px');
        } else {
            referenceContainer.css('border-width', '0px');
        }
    };

    /**
     * Cancels adding a new parameter context.
     */
    var close = function () {
        $('#parameter-context-dialog').modal('hide');
    };

    /**
     * Renders the bulletins as a tooltip of the bulletinIconElement, shows the icon
     *
     * @param bulletins            bulletins to be rendered
     * @param bulletinIconElement  jQuery element to display as the bulletin icon and source for the tooltip
     */
    var renderBulletins = function (bulletins, bulletinIconElement) {
        // format the new bulletins
        var formattedBulletins = nfCommon.getFormattedBulletins(bulletins);

        var list = nfCommon.formatUnorderedList(formattedBulletins);

        // update existing tooltip or initialize a new one if appropriate
        bulletinIconElement.addClass('has-bulletins').show().qtip($.extend({},
            nfCanvasUtils.config.systemTooltipConfig,
            {
                content: list
            }));
    }

    /**
     * Renders the specified referencing component.
     *
     * @param {object} referencingProcessorEntity
     * @param {jQuery} container
     */
    var renderReferencingProcessor = function (referencingProcessorEntity, container) {
        var referencingProcessorContainer = $('<li class="referencing-component-container"></li>').appendTo(container);
        var referencingProcessor = referencingProcessorEntity.component;

        // processor state
        $('<div class="referencing-component-state"></div>').addClass(function () {
            if (nfCommon.isDefinedAndNotNull(referencingProcessor.state)) {
                var icon = $(this);

                var state = referencingProcessor.state.toLowerCase();
                if (state === 'stopped' && !nfCommon.isEmpty(referencingProcessor.validationErrors)) {
                    state = 'invalid';

                    // build the validation error listing
                    var list = nfCommon.formatUnorderedList(referencingProcessor.validationErrors);

                    // add tooltip for the warnings
                    icon.qtip($.extend({},
                        nfCanvasUtils.config.systemTooltipConfig,
                        {
                            content: list
                        }));
                }

                return state;
            } else {
                return '';
            }
        }).appendTo(referencingProcessorContainer);


        // processor name
        $('<span class="parameter-context-referencing-component-name link ellipsis"></span>').prop('title', referencingProcessor.name).text(referencingProcessor.name).on('click', function () {
            // check if there are outstanding changes
            handleOutstandingChanges().done(function () {
                // close the shell
                $('#shell-dialog').modal('hide');

                // show the component in question
                nfCanvasUtils.showComponent(referencingProcessorEntity.processGroup.id, referencingProcessor.id);
            });
        }).appendTo(referencingProcessorContainer);

        // bulletin
        var bulletinIcon = $('<div class="referencing-component-bulletins"></div>').addClass(referencingProcessor.id + '-referencing-bulletins');
        bulletinIcon.appendTo(referencingProcessorContainer);
        if (!nfCommon.isEmpty(referencingProcessorEntity.bulletins)) {
            renderBulletins(referencingProcessorEntity.bulletins, bulletinIcon);
        }

        // processor active threads
        $('<span class="referencing-component-active-thread-count"></span>').text(function () {
            if (nfCommon.isDefinedAndNotNull(referencingProcessor.activeThreadCount) && referencingProcessor.activeThreadCount > 0) {
                return '(' + referencingProcessor.activeThreadCount + ')';
            } else {
                return '';
            }
        }).appendTo(referencingProcessorContainer);
    };

    /**
     * Renders the specified affect controller service.
     *
     * @param {object} referencingControllerServiceEntity
     * @param {jQuery} container
     */
    var renderReferencingControllerService = function (referencingControllerServiceEntity, container) {
        var referencingControllerServiceContainer = $('<li class="referencing-component-container"></li>').appendTo(container);
        var referencingControllerService = referencingControllerServiceEntity.component;

        // controller service state
        $('<div class="referencing-component-state"></div>').addClass(function () {
            if (nfCommon.isDefinedAndNotNull(referencingControllerService.state)) {
                var icon = $(this);

                var state = referencingControllerService.state === 'ENABLED' ? 'enabled' : 'disabled';
                if (state === 'disabled' && !nfCommon.isEmpty(referencingControllerService.validationErrors)) {
                    state = 'invalid';

                    // build the error listing
                    var list = nfCommon.formatUnorderedList(referencingControllerService.validationErrors);

                    // add tooltip for the warnings
                    icon.qtip($.extend({},
                        nfCanvasUtils.config.systemTooltipConfig,
                        {
                            content: list
                        }));
                }
                return state;
            } else {
                return '';
            }
        }).appendTo(referencingControllerServiceContainer);

        // bulletin
        var bulletinIcon = $('<div class="referencing-component-bulletins"></div>').addClass(referencingControllerService.id + '-referencing-bulletins').appendTo(referencingControllerServiceContainer);
        if (!nfCommon.isEmpty(referencingControllerServiceEntity.bulletins)) {
            renderBulletins(referencingControllerServiceEntity.bulletins, bulletinIcon);
        }

        // controller service name
        $('<span class="parameter-context-referencing-component-name link ellipsis"></span>').prop('title', referencingControllerService.name).text(referencingControllerService.name).on('click', function () {
            // check if there are outstanding changes
            handleOutstandingChanges().done(function () {
                // close the shell
                $('#shell-dialog').modal('hide');

                nfProcessGroup.enterGroup(referencingControllerService.processGroupId);

                // show the component in question
                nfProcessGroupConfiguration.showConfiguration(referencingControllerService.processGroupId).done(function () {
                    nfProcessGroupConfiguration.selectControllerService(referencingControllerService.id);
                });
            });
        }).appendTo(referencingControllerServiceContainer);
    };

    /**
     * Populates the referencing components for the specified parameter context.
     *
     * @param {object} referencingComponents
     */
    var populateReferencingComponents = function (referencingComponents) {
        // toggles the visibility of a container
        var toggle = function (twist, container) {
            if (twist.hasClass('expanded')) {
                twist.removeClass('expanded').addClass('collapsed');
                container.hide();
            } else {
                twist.removeClass('collapsed').addClass('expanded');
                container.show();
            }
        };

        var referencingProcessors = [];
        var referencingControllerServices = [];
        var unauthorizedReferencingComponents = [];

        var spinner = $('#parameter-context-usage .referencing-components-loading');

        var loadingDeferred = $.Deferred(function (deferred) {
            spinner.addClass('ajax-loading');
            deferred.resolve();
        });
        loadingDeferred.then(function () {
            resetUsage();
        }).then(function() {
            var parameterReferencingComponentsContainer = $('#parameter-referencing-components-container').empty();

            // referencing component will be undefined when a new parameter is added
            if (nfCommon.isUndefined(referencingComponents)) {
                // set to pending
                $('<div class="referencing-component-container"><span class="unset">暂未生效</span></div>').appendTo(parameterReferencingComponentsContainer);
            } else {
                // bin the referencing components according to their type
                $.each(referencingComponents, function (_, referencingComponentEntity) {
                    if (referencingComponentEntity.permissions.canRead === true && referencingComponentEntity.permissions.canWrite === true) {
                        if (referencingComponentEntity.component.referenceType === 'PROCESSOR') {
                            referencingProcessors.push(referencingComponentEntity);
                        } else {
                            referencingControllerServices.push(referencingComponentEntity);
                        }
                    } else {
                        unauthorizedReferencingComponents.push(referencingComponentEntity);
                    }
                });

                var referencingProcessGroups = {};

                // bin the referencing processors according to their PG
                $.each(referencingProcessors, function (_, referencingProcessorEntity) {
                    if (referencingProcessGroups[referencingProcessorEntity.processGroup.id]) {
                        referencingProcessGroups[referencingProcessorEntity.processGroup.id].referencingProcessors.push(referencingProcessorEntity);
                        referencingProcessGroups[referencingProcessorEntity.processGroup.id].id = referencingProcessorEntity.processGroup.id;
                        referencingProcessGroups[referencingProcessorEntity.processGroup.id].name = referencingProcessorEntity.processGroup.name;
                    } else {
                        referencingProcessGroups[referencingProcessorEntity.processGroup.id] = {
                            referencingProcessors: [],
                            referencingControllerServices: [],
                            unauthorizedReferencingComponents: [],
                            name: referencingProcessorEntity.processGroup.name,
                            id: referencingProcessorEntity.processGroup.id
                        };

                        referencingProcessGroups[referencingProcessorEntity.processGroup.id].referencingProcessors.push(referencingProcessorEntity);
                    }
                });

                // bin the referencing CS according to their PG
                $.each(referencingControllerServices, function (_, referencingControllerServiceEntity) {
                    if (referencingProcessGroups[referencingControllerServiceEntity.processGroup.id]) {
                        referencingProcessGroups[referencingControllerServiceEntity.processGroup.id].referencingControllerServices.push(referencingControllerServiceEntity);
                        referencingProcessGroups[referencingControllerServiceEntity.processGroup.id].id = referencingControllerServiceEntity.processGroup.id;
                        referencingProcessGroups[referencingControllerServiceEntity.processGroup.id].name = referencingControllerServiceEntity.processGroup.name;
                    } else {
                        referencingProcessGroups[referencingControllerServiceEntity.processGroup.id] = {
                            referencingProcessors: [],
                            referencingControllerServices: [],
                            unauthorizedReferencingComponents: [],
                            name: referencingControllerServiceEntity.processGroup.name,
                            id: referencingControllerServiceEntity.processGroup.id
                        };

                        referencingProcessGroups[referencingControllerServiceEntity.processGroup.id].referencingControllerServices.push(referencingControllerServiceEntity);
                    }
                });

                // bin the referencing unauthorized components according to their PG
                $.each(unauthorizedReferencingComponents, function (_, unauthorizedReferencingComponentEntity) {
                    if (referencingProcessGroups[unauthorizedReferencingComponentEntity.processGroup.id]) {
                        referencingProcessGroups[unauthorizedReferencingComponentEntity.processGroup.id].unauthorizedReferencingComponents.push(unauthorizedReferencingComponentEntity);
                        referencingProcessGroups[unauthorizedReferencingComponentEntity.processGroup.id].id = unauthorizedReferencingComponentEntity.processGroup.id;
                        referencingProcessGroups[unauthorizedReferencingComponentEntity.processGroup.id].name = unauthorizedReferencingComponentEntity.processGroup.name;
                    } else {
                        referencingProcessGroups[unauthorizedReferencingComponentEntity.processGroup.id] = {
                            referencingProcessors: [],
                            referencingControllerServices: [],
                            unauthorizedReferencingComponents: [],
                            name: unauthorizedReferencingComponentEntity.processGroup.name,
                            id: unauthorizedReferencingComponentEntity.processGroup.id
                        };

                        referencingProcessGroups[unauthorizedReferencingComponentEntity.processGroup.id].unauthorizedReferencingComponents.push(unauthorizedReferencingComponentEntity);
                    }
                });

                var parameterReferencingComponentsContainer = $('#parameter-referencing-components-container');
                var groups = $('<ul class="referencing-component-listing clear"></ul>');

                var referencingProcessGroupsArray = [];
                for (var key in referencingProcessGroups) {
                    if (referencingProcessGroups.hasOwnProperty(key)) {
                        referencingProcessGroupsArray.push(referencingProcessGroups[key]);
                    }
                }

                if (nfCommon.isEmpty(referencingProcessGroupsArray)) {
                    // set to none
                    $('<div class="referencing-component-container"><span class="unset">无</span></div>').appendTo(parameterReferencingComponentsContainer);
                } else {
                    //sort alphabetically
                    var sortedReferencingProcessGroups = referencingProcessGroupsArray.sort(function (a, b) {
                        if (a.name < b.name) {
                            return -1;
                        }
                        if (a.name > b.name) {
                            return 1;
                        }
                        return 0;
                    });

                    sortedReferencingProcessGroups.forEach(function (referencingProcessGroup) {
                        // container for this pg's references
                        var referencingPgReferencesContainer = $('<div class="referencing-component-references"></div>');
                        parameterReferencingComponentsContainer.append(referencingPgReferencesContainer);

                        // create the collapsable listing for each PG
                        var createReferenceBlock = function (referencingProcessGroup, list) {
                            var twist = $('<div class="expansion-button collapsed"></div>');
                            var title = $('<span class="referencing-component-title"></span>').text(referencingProcessGroup.name);
                            var count = $('<span class="referencing-component-count"></span>').text('(' + (referencingProcessGroup.referencingProcessors.length + referencingProcessGroup.referencingControllerServices.length + referencingProcessGroup.unauthorizedReferencingComponents.length) + ')');
                            var referencingComponents = $('#referencing-components-template').clone();
                            referencingComponents.removeAttr('id');
                            referencingComponents.removeClass('hidden');

                            // create the reference block
                            var groupTwist = $('<div class="referencing-component-block pointer unselectable"></div>').data('processGroupId', referencingProcessGroup.id).on('click', function () {
                                if (twist.hasClass('collapsed')) {
                                    groupTwist.append(referencingComponents);

                                    var processorContainer = groupTwist.find('.parameter-context-referencing-processors');
                                    nfCommon.cleanUpTooltips(processorContainer, 'div.referencing-component-state');
                                    nfCommon.cleanUpTooltips(processorContainer, 'div.referencing-component-bulletins');
                                    processorContainer.empty();

                                    var controllerServiceContainer = groupTwist.find('.parameter-context-referencing-controller-services');
                                    nfCommon.cleanUpTooltips(controllerServiceContainer, 'div.referencing-component-state');
                                    nfCommon.cleanUpTooltips(controllerServiceContainer, 'div.referencing-component-bulletins');
                                    controllerServiceContainer.empty();

                                    var unauthorizedComponentsContainer = groupTwist.find('.parameter-context-referencing-unauthorized-components').empty();

                                    if (referencingProcessGroups[$(this).data('processGroupId')].referencingProcessors.length === 0) {
                                        $('<li class="referencing-component-container"><span class="unset">无</span></li>').appendTo(processorContainer);
                                    } else {
                                        // sort the referencing processors
                                        referencingProcessGroups[$(this).data('processGroupId')].referencingProcessors.sort(nameComparator);

                                        // render each and register a click handler
                                        $.each(referencingProcessGroups[$(this).data('processGroupId')].referencingProcessors, function (_, referencingProcessorEntity) {
                                            renderReferencingProcessor(referencingProcessorEntity, processorContainer);
                                        });
                                    }

                                    if (referencingProcessGroups[$(this).data('processGroupId')].referencingControllerServices.length === 0) {
                                        $('<li class="referencing-component-container"><span class="unset">无</span></li>').appendTo(controllerServiceContainer);
                                    } else {
                                        // sort the referencing controller services
                                        referencingProcessGroups[$(this).data('processGroupId')].referencingControllerServices.sort(nameComparator);

                                        // render each and register a click handler
                                        $.each(referencingProcessGroups[$(this).data('processGroupId')].referencingControllerServices, function (_, referencingControllerServiceEntity) {
                                            renderReferencingControllerService(referencingControllerServiceEntity, controllerServiceContainer);
                                        });
                                    }

                                    if (referencingProcessGroups[$(this).data('processGroupId')].unauthorizedReferencingComponents.length === 0) {
                                        $('<li class="referencing-component-container"><span class="unset">无</span></li>').appendTo(unauthorizedComponentsContainer);
                                    } else {
                                        // sort the unauthorized referencing components
                                        referencingProcessGroups[$(this).data('processGroupId')].unauthorizedReferencingComponents.sort(function (a, b) {
                                            if (a.permissions.canRead === true && b.permissions.canRead === true) {
                                                // processors before controller services
                                                var sortVal = a.component.referenceType === b.component.referenceType ? 0 : a.component.referenceType > b.component.referenceType ? -1 : 1;

                                                // if a and b are the same type, then sort by name
                                                if (sortVal === 0) {
                                                    sortVal = a.component.name === b.component.name ? 0 : a.component.name > b.component.name ? 1 : -1;
                                                }

                                                return sortVal;
                                            } else {

                                                // if lacking read and write perms on both, sort by id
                                                if (a.permissions.canRead === false && b.permissions.canRead === false) {
                                                    return a.id > b.id ? 1 : -1;
                                                } else {
                                                    // if only one has read perms, then let it come first
                                                    if (a.permissions.canRead === true) {
                                                        return -1;
                                                    } else {
                                                        return 1;
                                                    }
                                                }
                                            }
                                        });

                                        $.each(referencingProcessGroups[$(this).data('processGroupId')].unauthorizedReferencingComponents, function (_, unauthorizedReferencingComponentEntity) {
                                            if (unauthorizedReferencingComponentEntity.permissions.canRead === true) {
                                                if (unauthorizedReferencingComponentEntity.component.referenceType === 'PROCESSOR') {
                                                    renderReferencingProcessor(unauthorizedReferencingComponentEntity, unauthorizedComponentsContainer);
                                                } else {
                                                    renderReferencingControllerService(unauthorizedReferencingComponentEntity, unauthorizedComponentsContainer);
                                                }
                                            } else {
                                                var referencingUnauthorizedComponentContainer = $('<li class="referencing-component-container"></li>').appendTo(unauthorizedComponentsContainer);
                                                $('<span class="parameter-context-referencing-component-name link ellipsis"></span>')
                                                    .prop('title', unauthorizedReferencingComponentEntity.id)
                                                    .text(unauthorizedReferencingComponentEntity.id)
                                                    .on('click', function () {
                                                        // check if there are outstanding changes
                                                        handleOutstandingChanges().done(function () {
                                                            // close the shell
                                                            $('#shell-dialog').modal('hide');

                                                            // show the component in question
                                                            if (unauthorizedReferencingComponentEntity.referenceType === 'PROCESSOR') {
                                                                nfCanvasUtils.showComponent(unauthorizedReferencingComponentEntity.processGroup.id, unauthorizedReferencingComponentEntity.id);
                                                            } else if (unauthorizedReferencingComponentEntity.referenceType === 'CONTROLLER_SERVICE') {
                                                                nfProcessGroupConfiguration.showConfiguration(unauthorizedReferencingComponentEntity.processGroup.id).done(function () {
                                                                    nfProcessGroup.enterGroup(unauthorizedReferencingComponentEntity.processGroup.id);
                                                                    nfProcessGroupConfiguration.selectControllerService(unauthorizedReferencingComponentEntity.id);
                                                                });
                                                            }
                                                        });
                                                    })
                                                    .appendTo(referencingUnauthorizedComponentContainer);
                                            }
                                        });
                                    }
                                } else {
                                    groupTwist.find('.referencing-components-template').remove();
                                }

                                // toggle this block
                                toggle(twist, list);

                                // update the border if necessary
                                updateReferencingComponentsBorder($('#parameter-referencing-components-container'));
                            }).append(twist).append(title).append(count).appendTo(referencingPgReferencesContainer);

                            // add the listing
                            list.appendTo(referencingPgReferencesContainer);

                            // expand the group twist
                            groupTwist.click();
                        };

                        // create block for this process group
                        createReferenceBlock(referencingProcessGroup, groups);
                    });
                }
            }
        })
        .always(function () {
            spinner.removeClass('ajax-loading');
        });
        return loadingDeferred.promise();
    };

    /**
     * Sorts the specified entities based on the name.
     *
     * @param {object} a
     * @param {object} b
     * @returns {number}
     */
    var nameComparator = function (a, b) {
        return a.component.name.localeCompare(b.component.name);
    };

    /**
     * Adds a new parameter.
     */
    var addNewParameter = function () {
        var param = serializeParameter();

        var parameterGrid = $('#parameter-table').data('gridInstance');
        var parameterData = parameterGrid.getData();

        var isValid = validateParameter(param, parameterData.getItems());

        if (isValid) {

            var permissions = {
                canRead: true,
                canWrite: true
            };
            var parameterContext = {
                permissions: permissions
            };
            var parameter = _.extend({}, param, {
                id: _.defaultTo(param.id, parameterCount),
                hidden: false,
                type: 'Parameter',
                previousValue: null,
                previousDescription: null,
                isEditable: true,
                isModified: true,
                hasValueChanged: false,
                isNew: true,
                isInherited: false,
                parameterContext: parameterContext
            });

            // clean up any tooltips that may have been generated
            nfCommon.cleanUpTooltips($('#parameter-table'), 'div.fa-question-circle, div.fa-info');

            if (_.isNil(param.id)) {
                var matchingParameter = _.find(parameterData.getItems(), {name: parameter.name});
                if (_.isNil(matchingParameter)) {
                    // add a row for the new parameter
                    parameterData.addItem(parameter);
                } else {
                    parameterData.updateItem(matchingParameter.id, parameter);
                }
            } else {
                parameterData.updateItem(param.id, parameter);
            }

            // sort the data
            parameterData.reSort();

            // select the new parameter row
            var row = parameterData.getRowById(parameterCount);
            parameterGrid.setActiveCell(row, parameterGrid.getColumnIndex('value'));
            parameterCount++;

            // close the new parameter dialog
            $('#parameter-dialog').modal('hide');

        }

        // update the buttons to possibly trigger the disabled state
        $('#parameter-context-dialog').modal('refreshButtons');
    };

    /**
     * Builds a parameter object from the user-entered parameter inputs
     *
     * @param originalParameter Optional parameter to compare value against to determine if it has changed
     * @return {{isEmptyStringSet: *, name: *, description: *, sensitive: *, value: *, hasValueChanged: *, hasDescriptionChanged: *}}
     */
    var serializeParameter = function (originalParameter) {
        var name = $.trim($('#parameter-name').val());
        var value = $('#parameter-value-field').val();
        var isEmptyStringSet = $('#parameter-set-empty-string-field').hasClass('checkbox-checked');
        var description = $('#parameter-description-field').val();
        var isSensitive = $('#parameter-dialog').find('input[name="sensitive"]:checked').val() === 'sensitive' ? true : false;

        var validateValue = function () {
            // in previous versions, updates to a parameter were not allowed to have a null value.
            // This has changed, but the validation function is left intact for now because it is likely that
            // we may introduce additional validation in the future.
            return true;
        };

        var parameter = {
            name: name,
            value: null,
            description: null,
            sensitive: isSensitive,
            isEmptyStringSet: isEmptyStringSet,
            previousValue: null,
            isNew: true
        };

        var serializedValue = serializeValue($('#parameter-value-field'), _.isNil(originalParameter) ? parameter : originalParameter, isEmptyStringSet);

        return {
            name: name,
            value: serializedValue.value,
            description: description,
            sensitive: isSensitive,
            isEmptyStringSet: isEmptyStringSet,
            hasValueChanged: serializedValue.hasChanged,
            hasDescriptionChanged: description !== _.get(originalParameter, 'description', ''),
            isValueValid: validateValue
        }
    };

    /**
     * Checks the validity of a parameter
     * @param parameter Parameter to validate
     * @param existingParameters Existing parameters to verify there are no duplicates
     * @param editMode boolean indicating if validation should account for editing an existing parameter
     * @return {boolean}
     */
    var validateParameter = function (parameter, existingParameters, editMode) {
        if (parameter.name === '') {
            nfDialog.showOkDialog({
                headerText: '配置错误',
                dialogContent: '必须指定参数名称.'
            });
            return false;
        }

        // make sure the parameter name does not use any unsupported characters
        var parameterNameRegex = /^[a-zA-Z0-9-_. ]+$/;
        if (!parameterNameRegex.test(parameter.name)) {
            nfDialog.showOkDialog({
                headerText: '配置错误',
                dialogContent: '参数名称中有非法字符. 仅支持字母数字 (a-z, A-Z, 0-9), 连至符 (-), 下划线 (_), 小数点 (.), 以及空格 ( ).'
            });
            return false;
        }

        // validate the parameter is not a duplicate
        var matchingParameter = _.find(existingParameters, {name: parameter.name});

        // Valid if no duplicate is found or it is edit mode and a matching parameter was found, or it's
        // an inherited parameter
        if (_.isNil(matchingParameter) || (editMode === true && !_.isNil(matchingParameter))
                || matchingParameter.isInherited === true) {
            return true;
        } else {
            var matchingParamIsHidden = _.get(matchingParameter, 'hidden', false);
            if (matchingParamIsHidden && matchingParameter.sensitive !== parameter.sensitive) {
                nfDialog.showOkDialog({
                    headerText: '参数已存在',
                    dialogContent: '同名参数被标记为删除. 请在该参数上下文应用并删除该参数后, 再进行不同敏感性的参数创建操作.'
                });
            } else if (matchingParamIsHidden && matchingParameter.sensitive === parameter.sensitive) {
                // set the id of the parameter that was found. It could be used to update it.
                parameter.id = matchingParameter.id;
                return true;
            } else {
                nfDialog.showOkDialog({
                    headerText: '参数已存在',
                    dialogContent: '同名参数已存在.'
                });
            }
            return false;
        }
    };

    var serializeValue = function (input, parameter, isChecked) {
        var serializedValue;

        var value = input.val();
        if (!isChecked && value === '') {
            value = null;
        }

        var hasChanged = parameter.value !== value;

        if (nfCommon.isDefinedAndNotNull(value)) {
            // if the value is sensitive and the user has not made a change
            if (!_.isEmpty(parameter) && parameter.sensitive === true && input.hasClass('sensitive') && parameter.isNew === false) {
                serializedValue = parameter.previousValue;
                hasChanged = false;
            } else {
                // value is not sensitive or it is sensitive and the user has changed it then always take the current value
                serializedValue = value;
                // if the param is sensitive and the param value has not "changed", that means it matches the mask and it should still be considered changed
                if (!hasChanged && !_.isEmpty(parameter) && parameter.sensitive === true && parameter.isNew === false) {
                    hasChanged = true;
                }
            }
        } else {
            if (isChecked) {
                serializedValue = '';
            } else {
                serializedValue = null;
            }
        }

        return {
            value: serializedValue,
            hasChanged: hasChanged
        };
    };

    /**
     * Update a parameter.
     *
     * @param originalParameter that is being edited
     */
    var updateParameter = function (originalParameter) {
        var serializedParam = serializeParameter(originalParameter);
        var parameterGrid = $('#parameter-table').data('gridInstance');
        var parameterData = parameterGrid.getData();

        var isValid = validateParameter(serializedParam, parameterData.getItems(), true);

        if (isValid) {
            var parameter = _.extend({}, originalParameter, {
                id: originalParameter.id,
                hidden: false,
                type: 'Parameter',
                sensitive: originalParameter.sensitive,
                name: originalParameter.name,
                description: serializedParam.description,
                referencingComponents: originalParameter.referencingComponents,
                previousValue: originalParameter.value,
                previousDescription: originalParameter.description,
                isEditable: originalParameter.isEditable,
                isEmptyStringSet: serializedParam.isEmptyStringSet,
                isNew: originalParameter.isNew,
                hasValueChanged: serializedParam.hasValueChanged,
                hasDescriptionChanged: serializedParam.hasDescriptionChanged,
                value: serializedParam.value,
                isModified: serializedParam.hasValueChanged || serializedParam.hasDescriptionChanged,
                isInherited: originalParameter.isInherited,
                parameterContext: originalParameter.parameterContext
            });

            // clean up any tooltips that may have been generated
            nfCommon.cleanUpTooltips($('#parameter-table'), 'div.fa-question-circle, div.fa-info');

            // update row for the parameter
            parameterData.updateItem(originalParameter.id, parameter);

            // sort the data
            parameterData.reSort();

            // select the parameter row
            var row = parameterData.getRowById(originalParameter.id);
            parameterGrid.setActiveCell(row, parameterGrid.getColumnIndex('value'));

            // close the new parameter dialog
            $('#parameter-dialog').modal('hide');
        }

        // update the buttons to possibly trigger the disabled state
        $('#parameter-context-dialog').modal('refreshButtons');
    };


    var hasParameterContextChanged = function (parameterContextEntity) {
        var parameters = marshalParameters();
        var proposedParamContextName = $('#parameter-context-name').val();
        var proposedParamContextDesc = $('#parameter-context-description-field').val();
        var inheritedParameterContexts = marshalInheritedParameterContexts();

        var inheritedParameterContextEquals = isInheritedParameterContextEquals(parameterContextEntity, inheritedParameterContexts);
        if (inheritedParameterContextEquals) {
            $('#inherited-parameter-contexts-message').addClass('hidden');
        } else {
            $('#inherited-parameter-contexts-message').removeClass('hidden');
        }

        if (_.isEmpty(parameters) &&
            proposedParamContextName === _.get(parameterContextEntity, 'component.name') &&
            proposedParamContextDesc === _.get(parameterContextEntity, 'component.description') &&
            inheritedParameterContextEquals) {

            return false;
        } else {
            return true;
        }
    };

    /**
     * Determines if the proposed inherited parameter contexts are equal to the current configuration.
     *
     * @param parameterContextEntity
     * @param proposedInheritedParameterContexts
     * @returns {*}
     */
    var isInheritedParameterContextEquals = function (parameterContextEntity, proposedInheritedParameterContexts) {
        var configuredInheritedParameterContexts = parameterContextEntity.component.inheritedParameterContexts.map(function (inheritedParameterContext) {
            return inheritedParameterContext.id;
        });
        var mappedProposedInheritedParameterContexts = proposedInheritedParameterContexts.map(function (proposedInheritedParameterContext) {
            return proposedInheritedParameterContext.id;
        });

        return _.isEqual(configuredInheritedParameterContexts, mappedProposedInheritedParameterContexts);
    }

    /**
     * Updates parameter contexts by issuing an update request and polling until it's completion.
     *
     * @param parameterContextEntity
     * @returns {*}
     */
    var updateParameterContext = function (parameterContextEntity) {
        // clean up any tooltips that may have been generated
        nfCommon.cleanUpTooltips($('#parameter-table'), 'div.fa-question-circle, div.fa-info');

        var parameters = marshalParameters();
        var inheritedParameterContexts = marshalInheritedParameterContexts();

        if (parameters.length === 0) {
            // nothing to update
            parameterContextEntity.component.parameters = [];

            if ($('#parameter-context-name').val() === _.get(parameterContextEntity, 'component.name') &&
                $('#parameter-context-description-field').val() === _.get(parameterContextEntity, 'component.description') &&
                isInheritedParameterContextEquals(parameterContextEntity, inheritedParameterContexts)) {
                close();

                return;
            }
        } else {
            parameterContextEntity.component.parameters = parameters;
        }

        // include the inherited parameter contexts
        parameterContextEntity.component.inheritedParameterContexts = inheritedParameterContexts;

        parameterContextEntity.component.name = $('#parameter-context-name').val();
        parameterContextEntity.component.description = $('#parameter-context-description-field').val();

        return $.Deferred(function (deferred) {
            // updates the button model to show the close button
            var updateToCloseButtonModel = function () {
                $('#parameter-context-dialog').modal('setButtonModel', [{
                    buttonText: '关闭',
                    color: {
                        base: '#728E9B',
                        hover: '#004849',
                        text: '#ffffff'
                    },
                    handler: {
                        click: function () {
                            deferred.resolve();
                            close();
                        }
                    }
                }]);
            };

            var updateToApplyOrCancelButtonModel = function () {
                $('#parameter-context-dialog').modal('setButtonModel', [{
                    buttonText: '应用',
                    color: {
                        base: '#728E9B',
                        hover: '#004849',
                        text: '#ffffff'
                    },
                    disabled: function () {
                        if ($('#parameter-context-name').val() !== '' && hasParameterContextChanged(parameterContextEntity)) {
                            return false;
                        }
                        return true;
                    },
                    handler: {
                        click: function () {
                            if ($('#parameter-referencing-components-container').is(':visible')) {
                                updateReferencingComponentsBorder($('#parameter-referencing-components-container'));
                            }

                            updateParameterContext(parameterContextEntity);
                        }
                    }
                }, {
                    buttonText: '取消',
                    color: {
                        base: '#E3E8EB',
                        hover: '#C7D2D7',
                        text: '#004849'
                    },
                    handler: {
                        click: function () {
                            deferred.resolve();

                            if ($('#parameter-referencing-components-container').is(':visible')) {
                                updateReferencingComponentsBorder($('#parameter-referencing-components-container'));
                            }

                            close();
                        }
                    }
                }]);
            };

            var cancelled = false;

            // update the button model to show the cancel button
            $('#parameter-context-dialog').modal('setButtonModel', [{
                buttonText: '取消',
                color: {
                    base: '#E3E8EB',
                    hover: '#C7D2D7',
                    text: '#004849'
                },
                handler: {
                    click: function () {
                        cancelled = true;

                        if ($('#parameter-referencing-components-container').is(':visible')) {
                            updateReferencingComponentsBorder($('#parameter-referencing-components-container'));
                        }

                        updateToCloseButtonModel();
                    }
                }
            }]);

            var requestId;
            var handleAjaxFailure = function (xhr, status, error) {
                // delete the request if possible
                if (nfCommon.isDefinedAndNotNull(requestId)) {
                    deleteUpdateRequest(parameterContextEntity.id, requestId);
                }

                // update the step status
                $('#parameter-context-update-steps').find('div.parameter-context-step.ajax-loading').removeClass('ajax-loading').addClass('ajax-error');

                if ($('#parameter-referencing-components-container').is(':visible')) {
                    updateReferencingComponentsBorder($('#parameter-referencing-components-container'));
                }

                // update the button model
                updateToApplyOrCancelButtonModel();
            };

            submitUpdateRequest(parameterContextEntity).done(function (response) {
                var pollUpdateRequest = function (updateRequestEntity) {
                    var updateRequest = updateRequestEntity.request;
                    var errored = nfCommon.isDefinedAndNotNull(updateRequest.failureReason);

                    // get the request id
                    requestId = updateRequest.requestId;

                    // update the referencing components
                    populateReferencingComponents(updateRequest.referencingComponents).then(function () {

                        // get the updated parameter names
                        var parameterNames = [];
                        $.each(parameters, function (_, parameterEntity) {
                            parameterNames.push(parameterEntity.parameter.name);
                        });
                        $('#parameter-referencing-components-context').removeClass('unset').attr('title', parameterNames.join(', ')).text(parameterNames.join(', '));
                    });

                    // update the progress/steps
                    populateParameterContextUpdateStep(updateRequest.updateSteps, cancelled, errored);

                    // if this request was cancelled, remove the update request
                    if (cancelled) {
                        deleteUpdateRequest(parameterContextEntity.id, requestId);
                    } else {
                        if (updateRequest.complete === true) {
                            if (errored) {
                                nfDialog.showOkDialog({
                                    headerText: '更新参数上下文错误',
                                    dialogContent: '更新参数上下文失败: ' + nfCommon.escapeHtml(updateRequest.failureReason)
                                });
                            }

                            // reload referencing processors
                            $.each(updateRequest.referencingComponents, function (_, referencingComponentEntity) {
                                if (referencingComponentEntity.permissions.canRead === true) {
                                    var referencingComponent = referencingComponentEntity.component;

                                    // reload the processor if it's in the current group
                                    if (referencingComponent.referenceType === 'PROCESSOR' && nfCanvasUtils.getGroupId() === referencingComponent.processGroupId) {
                                        nfProcessor.reload(referencingComponent.id);
                                    }
                                }
                            });

                            // update the parameter context table if displayed
                            if ($('#parameter-contexts-table').is(':visible')) {
                                var parameterContextGrid = $('#parameter-contexts-table').data('gridInstance');
                                var parameterContextData = parameterContextGrid.getData();

                                $.extend(parameterContextEntity, {
                                    revision: updateRequestEntity.parameterContextRevision,
                                    component: updateRequestEntity.request.parameterContext
                                });

                                var item = parameterContextData.getItemById(parameterContextEntity.id);
                                if (nfCommon.isDefinedAndNotNull(item)) {
                                    parameterContextData.updateItem(parameterContextEntity.id, parameterContextEntity);
                                }
                            }

                            // delete the update request
                            deleteUpdateRequest(parameterContextEntity.id, requestId);

                            // update the button model
                            updateToCloseButtonModel();

                            // check if border is necessary
                            updateReferencingComponentsBorder($('#parameter-referencing-components-container'));
                        } else {
                            // wait to get an updated status
                            setTimeout(function () {
                                getUpdateRequest(parameterContextEntity.id, requestId).done(function (getResponse) {
                                    pollUpdateRequest(getResponse);
                                }).fail(handleAjaxFailure);
                            }, 2000);
                        }
                    }
                };

                // update the visibility
                $('#parameter-table, #add-parameter').hide();
                $('#parameter-context-tabs').find('.tab')[1].click();
                $('#parameter-context-tabs').hide();
                $('#parameter-context-update-status').show();

                // hide the pending apply message for parameter context
                $('#inherited-parameter-contexts-message').addClass('hidden')

                pollUpdateRequest(response);
            }).fail(handleAjaxFailure);
        }).promise();
    };

    /**
     * Obtains the current state of the updateRequest using the specified update request id.
     *
     * @param {string} updateRequestId
     * @returns {deferred} update request xhr
     */
    var getUpdateRequest = function (parameterContextId, updateRequestId) {
        return $.ajax({
            type: 'GET',
            url: config.urls.parameterContexts + '/' + encodeURIComponent(parameterContextId) + '/update-requests/' + encodeURIComponent(updateRequestId),
            dataType: 'json'
        }).fail(nfErrorHandler.handleAjaxError);
    };

    /**
     * Deletes an updateRequest using the specified update request id.
     *
     * @param {string} updateRequestId
     * @returns {deferred} update request xhr
     */
    var deleteUpdateRequest = function (parameterContextId, updateRequestId) {
        return $.ajax({
            type: 'DELETE',
            url: config.urls.parameterContexts + '/' + encodeURIComponent(parameterContextId) + '/update-requests/' + encodeURIComponent(updateRequestId) + '?' + $.param({
                'disconnectedNodeAcknowledged': nfStorage.isDisconnectionAcknowledged()
            }),
            dataType: 'json'
        }).fail(nfErrorHandler.handleAjaxError);
    };

    /**
     * Submits an parameter context update request.
     *
     * @param {object} parameterContextEntity
     * @returns {deferred} update request xhr
     */
    var submitUpdateRequest = function (parameterContextEntity) {
        return $.ajax({
            type: 'POST',
            data: JSON.stringify(parameterContextEntity),
            url: config.urls.parameterContexts + '/' + encodeURIComponent(parameterContextEntity.id) + '/update-requests',
            dataType: 'json',
            contentType: 'application/json'
        }).fail(nfErrorHandler.handleAjaxError);
    };

    /**
     * Populates the parameter update steps.
     *
     * @param {array} updateSteps
     * @param {boolean} whether this request has been cancelled
     * @param {boolean} whether this request has errored
     */
    var populateParameterContextUpdateStep = function (updateSteps, cancelled, errored) {
        var updateStatusContainer = $('#parameter-context-update-steps').empty();

        // go through each step
        $.each(updateSteps, function (_, updateStep) {
            var stepItem = $('<li></li>').text(updateStep.description).appendTo(updateStatusContainer);

            $('<div class="parameter-context-step"></div>').addClass(function () {
                if (nfCommon.isDefinedAndNotNull(updateStep.failureReason)) {
                    return 'ajax-error';
                } else {
                    if (updateStep.complete === true) {
                        return 'ajax-complete';
                    } else {
                        return cancelled === true || errored === true ? 'ajax-error' : 'ajax-loading';
                    }
                }
            }).appendTo(stepItem);

            $('<div class="clear"></div>').appendTo(stepItem);
        });
    };

    var parameterCount = 0;
    var parameterIndex = 0;

    /**
     * Loads the reference for this parameter context.
     *
     * @param {jQuery} referencingProcessGroupsContainer
     * @param {object} parameterContext
     */
    var loadReferencingProcessGroups = function (referencingProcessGroupsContainer, parameterContext) {
        if (parameterContext.permissions.canRead === false) {
            referencingProcessGroupsContainer.append('<div class="unset">未授权</div>');
            return;
        }
        var referencingProcessGroups = parameterContext.component.boundProcessGroups;
        if (nfCommon.isEmpty(referencingProcessGroups)) {
            referencingProcessGroupsContainer.append('<div class="unset">无引用组件.</div>');
            return;
        }

        // toggles the visibility of a container
        var toggle = function (twist, container) {
            if (twist.hasClass('expanded')) {
                twist.removeClass('expanded').addClass('collapsed');
                container.hide();
            } else {
                twist.removeClass('collapsed').addClass('expanded');
                container.show();
            }
        };

        var processGroups = $('<ul class="referencing-component-listing clear"></ul>');
        var unauthorized = $('<ul class="referencing-component-listing clear"></ul>');
        $.each(referencingProcessGroups, function (_, referencingProcessGroupsEntity) {
            // check the access policy for this referencing component
            if (referencingProcessGroupsEntity.permissions.canRead === false) {
                var unauthorizedReferencingComponent = $('<div class="unset"></div>').text(referencingProcessGroupsEntity.id);
                unauthorized.append(unauthorizedReferencingComponent);
            } else {
                var referencingComponent = referencingProcessGroupsEntity.component;

                var processGroupLink = $('<span class="referencing-component-name link"></span>').text(referencingComponent.name).on('click', function () {
                    // show the component
                    if (nfCommon.isDefinedAndNotNull(referencingComponent.parentGroupId)) {
                        nfCanvasUtils.showComponent(referencingComponent.parentGroupId, referencingComponent.id);
                    } else {
                        nfProcessGroup.enterGroup(referencingComponent.id);
                    }

                    // close the dialog and shell
                    referencingProcessGroupsContainer.closest('.dialog').modal('hide');
                    $('#shell-close-button').click();
                });
                var processGroupItem = $('<li></li>').append(processGroupLink);
                processGroups.append(processGroupItem);
            }
        });

        // create the collapsable listing for each type
        var createReferenceBlock = function (titleText, list) {
            if (list.is(':empty')) {
                list.remove();
                return;
            }

            var twist = $('<div class="expansion-button expanded"></div>');
            var title = $('<span class="referencing-component-title"></span>').text(titleText);
            var count = $('<span class="referencing-component-count"></span>').text('(' + list.children().length + ')');

            // create the reference block
            $('<div class="referencing-component-block pointer unselectable"></div>').on('click', function () {
                // toggle this block
                toggle(twist, list);

                // update the border if necessary
                updateReferencingComponentsBorder(referencingProcessGroupsContainer);
            }).append(twist).append(title).append(count).appendTo(referencingProcessGroupsContainer);

            // add the listing
            list.appendTo(referencingProcessGroupsContainer);
        };

        // create blocks for each type of component
        createReferenceBlock('Process Groups', processGroups);
        createReferenceBlock('Unauthorized', unauthorized);
    };

    /**
     * Loads the specified parameter registry.
     *
     * @param {object} parameterContext
     * @param {string} parameterToSelect to select
     * @param {boolean} if the parameters should be displayed in a read-only state regardless of permissions
     */
    var loadParameters = function (parameterContext, parameterToSelect, readOnly) {
        if (nfCommon.isDefinedAndNotNull(parameterContext)) {

            var parameterGrid = $('#parameter-table').data('gridInstance');
            var parameterData = parameterGrid.getData();

            // begin the update
            parameterData.beginUpdate();

            var parameters = [];
            $.each(parameterContext.component.parameters, function (i, parameterEntity) {
                var containingParameterContext = {
                    id: parameterEntity.parameter.parameterContext.component.id,
                    permissions: parameterEntity.parameter.parameterContext.permissions
                };
                var parameter = {
                    id: parameterCount++,
                    hidden: false,
                    type: 'Parameter',
                    isNew: false,
                    isModified: false,
                    hasValueChanged: false,
                    name: parameterEntity.parameter.name,
                    value: parameterEntity.parameter.value,
                    sensitive: parameterEntity.parameter.sensitive,
                    description: parameterEntity.parameter.description,
                    previousValue: parameterEntity.parameter.value,
                    previousDescription: parameterEntity.parameter.description,
                    isEditable: _.defaultTo(readOnly, false) ? false : parameterEntity.canWrite,
                    referencingComponents: parameterEntity.parameter.referencingComponents,
                    parameterContext: containingParameterContext,
                    isInherited: (containingParameterContext.id !== parameterContext.component.id)
                };

                parameters.push({
                    parameter: parameter
                });

                parameterData.addItem(parameter);
            });

            // complete the update
            parameterData.endUpdate();
            parameterData.reSort();

            // if we are pre-selecting a specific parameter, get it's parameterIndex
            if (nfCommon.isDefinedAndNotNull(parameterToSelect)) {
                $.each(parameters, function (i, parameterEntity) {
                    if (parameterEntity.parameter.name === parameterToSelect) {
                        parameterIndex = parameterData.getRowById(parameterEntity.parameter.id);
                        return false;
                    }
                });
            } else {
                parameterIndex = 0;
            }

            if (parameters.length === 0) {
                resetUsage();
            } else {
                // select the desired row
                parameterGrid.setSelectedRows([parameterIndex]);
            }
        }
    };

    /**
     * Load the parameter context inheritance tab for the current parameterContextEntity. The current parameterContextEntity could be
     * null if this is a new parameter context.
     *
     * @param parameterContextEntity    the parameter context being edited or null if new
     * @param readOnly                  whether the controls should be read only
     * @param parameterContexts         all parameter contexts
     */
    var loadParameterContextInheritance = function (parameterContextEntity, readOnly, parameterContexts) {
        // consider each parameter context and add to the listing of available or selected contexts based on the supplied parameterContextEntity
        $.each(parameterContexts, function (i, availableParameterContext) {
            // don't support inheriting from the current context
            var isCurrent = nfCommon.isNull(parameterContextEntity) ? false : availableParameterContext.id === parameterContextEntity.id;

            // determine if this available parameter context is already selected
            var isSelected = nfCommon.isNull(parameterContextEntity) ? false : parameterContextEntity.component.inheritedParameterContexts.some(function (selectedParameterContext) {
                return availableParameterContext.id === selectedParameterContext.id;
            });

            if (readOnly) {
                if (isSelected) {
                    $('#parameter-context-selected-read-only').append($('<li></li>').text(availableParameterContext.component.name));
                }
            } else {
                if (isSelected) {
                    addParameterContextInheritanceControl(availableParameterContext, true);
                } else if (!isCurrent) {
                    addParameterContextInheritanceControl(availableParameterContext, false);
                }
            }
        });

        if (!nfCommon.isNull(parameterContextEntity)) {
            sortSelectedParameterContexts(parameterContextEntity);
        }

        sortAvailableParameterContexts();

        if (readOnly) {
            if ($('#parameter-context-selected-read-only').is(':empty')) {
                $('#parameter-context-selected-read-only').append($('<span class="unset">无设置值</span>'));
            }

            $('#parameter-context-inheritance-container-read-only').show();
            $('#parameter-context-inheritance-container').hide();
        } else {
            $('#parameter-context-inheritance-container-read-only').hide();
            $('#parameter-context-inheritance-container').show();
        }
    };

    var resetUsage = function () {
        // empty the containers
        var processorContainer = $('.parameter-context-referencing-processors');
        nfCommon.cleanUpTooltips(processorContainer, 'div.referencing-component-state');
        nfCommon.cleanUpTooltips(processorContainer, 'div.referencing-component-bulletins');
        processorContainer.empty();

        var controllerServiceContainer = $('.parameter-context-referencing-controller-services');
        nfCommon.cleanUpTooltips(controllerServiceContainer, 'div.referencing-component-state');
        nfCommon.cleanUpTooltips(controllerServiceContainer, 'div.referencing-component-bulletins');
        controllerServiceContainer.empty();

        var unauthorizedComponentsContainer = $('.parameter-context-referencing-unauthorized-components').empty();

        $('#parameter-referencing-components-container').empty();

        // reset the last selected parameter
        lastSelectedId = null;

        // indicate no referencing components
        $('<li class="referencing-component-container"><span class="unset">无</span></li>').appendTo(processorContainer);
        $('<li class="referencing-component-container"><span class="unset">无</span></li>').appendTo(controllerServiceContainer);
        $('<li class="referencing-component-container"><span class="unset">无</span></li>').appendTo(unauthorizedComponentsContainer);

        // update the selection context
        $('#parameter-referencing-components-context').addClass('unset').attr('title', 'None').text('无');

        // check if border is necessary
        updateReferencingComponentsBorder($('#parameter-referencing-components-container'));
    };

    /**
     * Reset the inheritance tab.
     */
    var resetInheritance = function () {
        $('#parameter-context-available').empty();
        $('#parameter-context-selected').empty();
        $('#parameter-context-selected-read-only').empty();
        $('#inherited-parameter-contexts-message').addClass('hidden');
    };

    /**
     * Sorts the available parameter contexts.
     */
    var sortAvailableParameterContexts = function () {
        var availableParameterContextList = $('#parameter-context-available');
        availableParameterContextList.children('li')
            .detach()
            .sort(function (aElement, bElement) {
                var a = $(aElement);
                var b = $(bElement);

                // put unauthorized last
                if (a.hasClass('unauthorized') && b.hasClass('unauthorized')) {
                    return 0;
                } else if (a.hasClass('unauthorized')) {
                    return 1;
                } else if (b.hasClass('unauthorized')) {
                    return -1;
                }

                var nameA = a.text();
                var nameB = b.text();
                return nameA.localeCompare(nameB);
            })
            .appendTo(availableParameterContextList);
    };

    /**
     * Sorts the selected parameter context array based on the current parameter context entity.
     *
     * @param {object} selectedParameterContexts
     */
    var sortSelectedParameterContexts = function (parameterContextEntity) {
        var selectedInheritedParameterContexts = parameterContextEntity.component.inheritedParameterContexts;

        var selectedParameterContextList = $('#parameter-context-selected');
        selectedParameterContextList.children('li')
            .detach()
            .sort(function (aElement, bElement) {
                var a = $(aElement);
                var b = $(bElement);

                var findA = function (selectedInheritedParameterContext) {
                    return a.attr('id') === selectedInheritedParameterContext.id;
                };
                var findB = function (selectedInheritedParameterContext) {
                    return b.attr('id') === selectedInheritedParameterContext.id;
                };

                return selectedInheritedParameterContexts.findIndex(findA) - selectedInheritedParameterContexts.findIndex(findB);
            })
            .appendTo(selectedParameterContextList);
    }

    /**
     * Adds the specified parameter context to the list of available parameter contexts.
     *
     * @argument {jQuery} container                  The container for the parameter context
     * @argument {object} parameterContext           An available parameter context
     * @argument {boolean} isSelected                 Whether the parameter context is selected (which is used to decide whether to provide a remove control)
     */
    var addParameterContextInheritanceControl = function (parameterContext, isSelected) {
        var label = parameterContext.id;
        if (parameterContext.permissions.canRead) {
            label = parameterContext.component.name;
        }

        // add the parameter context to the specified list
        var parameterContextElement = $('<li></li>').append($('<span style="float: left;"></span>').text(label)).attr('id', parameterContext.id).addClass('ui-state-default');
        if (!parameterContext.permissions.canRead) {
            parameterContextElement.addClass('unauthorized');
        } else {
            // add the description if applicable
            if (!nfCommon.isBlank(parameterContext.component.description)) {
                $('<div class="fa fa-question-circle"></div>').appendTo(parameterContextElement).qtip($.extend({
                    content: nfCommon.escapeHtml(parameterContext.component.description)
                }, nfCommon.config.tooltipConfig));
            }

            if (isSelected) {
                addControlsForSelectedParameterContext(parameterContextElement);
            }
        }
        parameterContextElement.appendTo(isSelected ? '#parameter-context-selected' : '#parameter-context-available');
    };

    /**
     * Adds the controls to the specified selected draggable element.
     *
     * @argument {jQuery} draggableElement
     */
    var addControlsForSelectedParameterContext = function (draggableElement) {
        var removeIcon = $('<div class="draggable-control"><div class="fa fa-remove"></div></div>')
            .on('click', function () {
                // remove the remove icon
                removeIcon.remove();

                // restore to the available parameter contexts
                $('#parameter-context-available').append(draggableElement);

                // resort the available parameter contexts
                sortAvailableParameterContexts();

                // update the buttons to possibly trigger the disabled state
                $('#parameter-context-dialog').modal('refreshButtons');
            })
            .appendTo(draggableElement);
    }

    /**
     * Performs the filtering.
     *
     * @param {object} item     The item subject to filtering
     * @param {object} args     Filter arguments
     * @returns {Boolean}       Whether or not to include the item
     */
    var filter = function (item, args) {
        return item.hidden === false;
    };

    /**
     * Initializes the parameter table
     */
    var initParameterTable = function () {
        var parameterTable = $('#parameter-table');

        var nameFormatter = function (row, cell, value, columnDef, dataContext) {
            var nameWidthOffset = 30;
            var cellContent = $('<div></div>');

            // format the contents
            var formattedValue = $('<span/>').addClass('table-cell').text(value).appendTo(cellContent);
            if (dataContext.type === 'required') {
                formattedValue.addClass('required');
            }

            // show the parameter description if applicable
            if (!nfCommon.isBlank(dataContext.description)) {
                $('<div class="fa fa-question-circle" alt="Info" style="float: right;"></div>').appendTo(cellContent);
                $('<span class="hidden parameter-row"></span>').text(row).appendTo(cellContent);
                nameWidthOffset = 46; // 10 + icon width (10) + icon margin (6) + padding (20)
            }

            // adjust the width accordingly
            formattedValue.width(columnDef.width - nameWidthOffset).ellipsis();

            // return the cell content
            return cellContent.html();
        };

        var valueFormatter = function (row, cell, value, columnDef, dataContext) {
            var valueWidthOffset = 0;
            if (dataContext.sensitive === true && !_.isNil(value)) {
                return '<span class="table-cell sensitive">已设置敏感值</span>';
            } else if (value === '') {
                return '<span class="table-cell blank">已置为空字符串</span>';
            } else if (_.isNil(value)) {
                return '<span class="unset">无设置值</span>';
            } else {
                var valueMarkup;
                valueWidthOffset = 15;

                // check for multi-line
                if (nfCommon.isMultiLine(value)) {
                    valueMarkup = '<div class="table-cell value"><div class="ellipsis-white-space-pre multi-line-clamp-ellipsis">' + nfCommon.escapeHtml(value) + '</div></div>';
                } else {
                    valueMarkup = '<div class="table-cell value"><div class="ellipsis-white-space-pre">' + nfCommon.escapeHtml(value) + '</div></div>';
                }

                // check for leading or trailing whitespace
                if (nfCommon.hasLeadTrailWhitespace(value)) {
                    valueMarkup += '<div class="fa fa-info" alt="Info" style="float: right;"></div>';
                    valueWidthOffset = 30;
                }

                // adjust the width accordingly
                var content = $(valueMarkup);
                var contentValue = content.find('.ellipsis-white-space-pre');
                contentValue.attr('title', contentValue.text()).width(columnDef.width - valueWidthOffset);

                return $('<div />').append(content).html();
            }
        };

        var parameterActionFormatter = function (row, cell, value, columnDef, dataContext) {
            var markup = '';

            if (dataContext.isInherited === true && dataContext.parameterContext.permissions.canRead) {
                markup += '<div title="到" class="pointer go-to-parameter fa fa-long-arrow-right"></div>';
            } else if (dataContext.isEditable === true) {
                markup += '<div title="编辑" class="edit-parameter pointer fa fa-pencil"></div>';
                markup += '<div title="删除" class="delete-parameter pointer fa fa-trash"></div>';
            }

            return markup;
        };

        // define the column model for the controller services table
        var parameterColumns = [
            {
                id: 'name',
                name: '名称',
                field: 'name',
                formatter: nameFormatter,
                sortable: true,
                resizable: true,
                rerenderOnResize: true
            },
            {
                id: 'value',
                name: '值',
                field: 'value',
                formatter: valueFormatter,
                sortable: false,
                resizable: true
            },
            {
                id: 'actions',
                name: '&nbsp;',
                resizable: false,
                rerenderOnResize: true,
                formatter: parameterActionFormatter,
                sortable: false,
                width: 90,
                maxWidth: 90
            }
        ];

        // initialize the dataview
        var parameterData = new Slick.Data.DataView({
            inlineFilters: false
        });
        parameterData.setFilterArgs({
            searchString: '',
            property: 'hidden'
        });
        parameterData.setFilter(filter);

        // initialize the sort
        sortParameters({
            columnId: 'name',
            sortAsc: true
        }, parameterData);

        // initialize the grid
        var parametersGrid = new Slick.Grid(parameterTable, parameterData, parameterColumns, parametersGridOptions);
        parametersGrid.setSelectionModel(new Slick.RowSelectionModel());
        parametersGrid.registerPlugin(new Slick.AutoTooltips());
        parametersGrid.setSortColumn('name', true);
        parametersGrid.onSort.subscribe(function (e, args) {
            sortParameters({
                columnId: args.sortCol.id,
                sortAsc: args.sortAsc
            }, parameterData);
        });
        parametersGrid.onClick.subscribe(function (e, args) {
            // get the parameter at this row
            var parameter = parameterData.getItem(args.row);

            if (parametersGrid.getColumns()[args.cell].id === 'actions') {
                var target = $(e.target);

                // determine the desired action
                if (target.hasClass('delete-parameter')) {
                    // clean any tooltips that may have been added for this item
                    nfCommon.cleanUpTooltips($('#parameter-table'), 'div.fa-question-circle, div.fa-info');

                    if (!parameter.isNew) {
                        // mark the parameter in question for removal and refresh the table
                        parameterData.updateItem(parameter.id, $.extend(parameter, {
                            hidden: true
                        }));
                    } else {
                        // remove the parameter from the table
                        parameterData.deleteItem(parameter.id);
                    }


                    // reset the selection if necessary
                    var selectedRows = parametersGrid.getSelectedRows();
                    if (selectedRows.length === 0) {
                        parametersGrid.setSelectedRows([0]);
                    }

                    var rows = parameterData.getItems();

                    if (rows.length === 0) {
                        // clear usages
                        resetUsage();
                    } else {
                        var reset = true;
                        $.each(rows, function (_, parameter) {
                            if (!parameter.hidden) {
                                reset = false;
                            }
                        });

                        if (reset) {
                            // clear usages
                            resetUsage();
                        }
                    }

                    // update the buttons to possibly trigger the disabled state
                    $('#parameter-context-dialog').modal('refreshButtons');

                    // prevents standard edit logic
                    e.stopImmediatePropagation();
                } else if (target.hasClass('edit-parameter')) {
                    var closeHandler = function () {
                        resetParameterDialog();
                    };

                    var openHandler = function () {
                        $('#parameter-sensitive-radio-button').prop('checked', false);
                        $('#parameter-not-sensitive-radio-button').prop('checked', true);
                        $('#parameter-name').focus();

                        $('#parameter-name').val(parameter.name);
                        $('#parameter-name').prop('disabled', true);
                        $('#parameter-sensitive-radio-button').prop('disabled', true);
                        $('#parameter-not-sensitive-radio-button').prop('disabled', true);
                        if (parameter.value === '') {
                            if (!parameter.sensitive) {
                                $('#parameter-set-empty-string-field').removeClass('checkbox-unchecked').addClass('checkbox-checked');
                                $('#parameter-value-field').prop('disabled', true);
                            }
                        } else {
                            $('#parameter-set-empty-string-field').removeClass('checkbox-checked').addClass('checkbox-unchecked');
                        }

                        if (parameter.sensitive) {
                            $('#parameter-sensitive-radio-button').prop('checked', true);
                            $('#parameter-not-sensitive-radio-button').prop('checked', false);
                            if (!_.isNil(parameter.value)) {
                                $('#parameter-value-field').addClass('sensitive').val(nfCommon.config.sensitiveText).select();
                                $('#parameter-set-empty-string-field').removeClass('checkbox-checked').addClass('checkbox-unchecked');
                            }
                        } else {
                            $('#parameter-sensitive-radio-button').prop('checked', false);
                            $('#parameter-not-sensitive-radio-button').prop('checked', true);
                            $('#parameter-value-field').val(parameter.value);
                        }
                        $('#parameter-description-field').val(parameter.description);

                        // update the buttons to possibly trigger the disabled state
                        $('#parameter-dialog').modal('refreshButtons');
                    };

                    $('#parameter-set-empty-string-field').off().on('change', function (event, args) {
                        // if we are setting as an empty string, disable the editor
                        if (args.isChecked) {
                            $('#parameter-value-field').prop('disabled', true).val('');
                            $('#parameter-dialog').modal('refreshButtons');
                        } else {
                            var value = parameter.sensitive ? '' : parameter.previousValue;
                            $('#parameter-value-field').prop('disabled', false).val(value);
                            $('#parameter-dialog').modal('refreshButtons');
                        }
                    });

                    $('#parameter-dialog')
                        .modal('setHeaderText', 'Edit Parameter')
                        .modal('setOpenHandler', openHandler)
                        .modal('setCloseHandler', closeHandler)
                        .modal('setButtonModel', [{
                            buttonText: '应用',
                            color: {
                                base: '#728E9B',
                                hover: '#004849',
                                text: '#ffffff'
                            },
                            disabled: function () {
                                var param = serializeParameter(parameter);
                                if (param.hasValueChanged) {
                                    return !param.isValueValid();
                                } else {
                                    return !param.hasDescriptionChanged;
                                }
                            },
                            handler: {
                                click: function () {
                                    updateParameter(parameter);
                                }
                            }
                        }, {
                            buttonText: '取消',
                            color: {
                                base: '#E3E8EB',
                                hover: '#C7D2D7',
                                text: '#004849'
                            },
                            handler: {
                                click: function () {
                                    $(this).modal('hide');
                                }
                            }
                        }]).modal('show');

                    // prevents standard edit logic
                    e.stopImmediatePropagation();
                } else if (target.hasClass('go-to-parameter')) {
                    if (parameter.parameterContext.permissions.canRead === true) {
                        // close the dialog since we are sending the user to the parameter context
                        close();
                        resetDialog();

                        nfParameterContexts.showParameterContext(parameter.parameterContext.id, parameter.parameterContext.permissions.canWrite === false, parameter.name);
                    }
               }
            }
        });
        parametersGrid.onSelectedRowsChanged.subscribe(function (e, args) {
            if ($.isArray(args.rows) && args.rows.length === 1) {
                // show the referencing components for the selected parameter
                if (parametersGrid.getDataLength() > 0) {
                    var parameterIndex = args.rows[0];
                    var parameter = parametersGrid.getDataItem(parameterIndex);

                    // only populate referencing components if this parameter is different than the last selected
                    if (lastSelectedId === null || lastSelectedId !== parameter.id) {
                        populateReferencingComponents(parameter.referencingComponents)
                            .then(function () {
                                // update the details for this parameter
                                $('#parameter-referencing-components-context').removeClass('unset').attr('title', parameter.name).text(parameter.name);

                                updateReferencingComponentsBorder($('#parameter-referencing-components-container'));

                                // update the last selected id
                                lastSelectedId = parameter.id;
                            });
                    }
                }
            }
        });
        parametersGrid.onBeforeCellEditorDestroy.subscribe(function (e, args) {
            setTimeout(function () {
                parametersGrid.resizeCanvas();
            }, 50);
        });

        // wire up the dataview to the grid
        parameterData.onRowCountChanged.subscribe(function (e, args) {
            parametersGrid.updateRowCount();
            parametersGrid.render();
        });
        parameterData.onRowsChanged.subscribe(function (e, args) {
            parametersGrid.invalidateRows(args.rows);
            parametersGrid.render();
        });
        parameterData.syncGridSelection(parametersGrid, true);

        // hold onto an instance of the grid and create parameter description tooltip
        parameterTable.data('gridInstance', parametersGrid).on('mouseenter', 'div.slick-cell', function (e) {
            var infoIcon = $(this).find('div.fa-question-circle');
            if (infoIcon.length) {
                if (infoIcon.data('qtip')) {
                    infoIcon.qtip('destroy', true);
                }

                var row = $(this).find('span.parameter-row').text();

                // get the parameter
                var parameter = parameterData.getItem(row);

                if (nfCommon.isDefinedAndNotNull(parameter.description)) {
                    infoIcon.qtip($.extend({},
                        nfCommon.config.tooltipConfig,
                        {
                            content: parameter.description
                        }));
                }
            }

            var whitespaceIcon = $(this).find('div.fa-info');
            if (whitespaceIcon.length && !whitespaceIcon.data('qtip')) {
                var whitespaceTooltip = nfCommon.formatWhitespaceTooltip();

                whitespaceIcon.qtip($.extend({},
                    nfCommon.config.tooltipConfig,
                    {
                        content: whitespaceTooltip
                    }));
            }
        });
    };

    /**
     * Initializes the new parameter context dialog.
     */
    var initNewParameterContextDialog = function () {
        // initialize the parameter context tabs
        $('#parameter-context-tabs').tabbs({
            tabStyle: 'tab',
            selectedTabStyle: 'selected-tab',
            scrollableTabContentStyle: 'scrollable',
            tabs: [{
                name: '设置',
                tabContentId: 'parameter-context-standard-settings-tab-content'
            }, {
                name: '参数',
                tabContentId: 'parameter-context-parameters-tab-content'
            }, {
                name: '继承',
                tabContentId: 'parameter-context-inheritance-tab-content'
            }],
            select: function () {
                // update the parameters table size in case this is the first time its rendered
                if ($(this).text() === '参数') {
                    var parameterGrid = $('#parameter-table').data('gridInstance');
                    if (nfCommon.isDefinedAndNotNull(parameterGrid)) {
                        parameterGrid.resizeCanvas();
                    }
                }
            }
        });

        // initialize the parameter context dialog
        $('#parameter-context-dialog').modal({
            scrollableContentStyle: 'scrollable',
            handler: {
                close: function () {
                    resetDialog();
                }
            }
        });

        $('#parameter-dialog').modal();

        $('#parameter-value-field').on('keydown', function () {
            var sensitiveInput = $(this);
            if (sensitiveInput.hasClass('sensitive')) {
                sensitiveInput.removeClass('sensitive');
                if (sensitiveInput.val() === nfCommon.config.sensitiveText) {
                    sensitiveInput.val('');
                }
            }
        });

        $('#parameter-set-empty-string-field').on('click', function () {
            var sensitiveInput = $('#parameter-value-field');
            if (sensitiveInput.hasClass('sensitive')) {
                sensitiveInput.removeClass('sensitive');
                if (sensitiveInput.val() === nfCommon.config.sensitiveText) {
                    sensitiveInput.val('');
                }
            }
        });

        $('#parameter-name').on('keydown', function (e) {
            var code = e.keyCode ? e.keyCode : e.which;
            if (code === $.ui.keyCode.ENTER) {
                addNewParameter();

                // prevents the enter from propagating into the field for editing the new parameter value
                e.stopImmediatePropagation();
                e.preventDefault();
            }
        });

        $('#add-parameter').on('click', function () {
            var closeHandler = function () {
                // clean up any tooltips that may have been generated
                nfCommon.cleanUpTooltips($('#parameter-table'), 'div.fa-question-circle, div.fa-info');
                resetParameterDialog();
            };

            var openHandler = function () {
                $('#parameter-sensitive-radio-button').prop('checked', false);
                $('#parameter-not-sensitive-radio-button').prop('checked', true);
                $('#parameter-name').focus();
            };

            $('#parameter-dialog')
                .modal('setHeaderText', 'Add Parameter')
                .modal('setOpenHandler', openHandler)
                .modal('setCloseHandler', closeHandler)
                .modal('setButtonModel', [{
                    buttonText: '应用',
                    color: {
                        base: '#728E9B',
                        hover: '#004849',
                        text: '#ffffff'
                    },
                    disabled: function () {
                        var param = serializeParameter();
                        if (param.name !== '') {
                            return false;
                        }
                        return true;
                    },
                    handler: {
                        click: function () {
                            addNewParameter();
                        }
                    }
                }, {
                    buttonText: '取消',
                    color: {
                        base: '#E3E8EB',
                        hover: '#C7D2D7',
                        text: '#004849'
                    },
                    handler: {
                        click: function () {
                            $(this).modal('hide');
                        }
                    }
                }])
                .modal('show');
        });

        $('#parameter-set-empty-string-field').off().on('change', function (event, args) {
            // if we are setting as an empty string, disable the editor
            if (args.isChecked) {
                $('#parameter-value-field').prop('disabled', true).val('');
                $('#parameter-dialog').modal('refreshButtons');
            } else {
                $('#parameter-value-field').prop('disabled', false);
                $('#parameter-dialog').modal('refreshButtons');
            }
        });

        $('#parameter-context-name').on('keyup', function (evt) {
            // update the buttons to possibly trigger the disabled state
            $('#parameter-context-dialog').modal('refreshButtons');
        });

        $('#parameter-context-description-field').on('keyup', function (evt) {
            // update the buttons to possibly trigger the disabled state
            $('#parameter-context-dialog').modal('refreshButtons');
        });

        $('#parameter-name').on('keyup', function (evt) {
            // update the buttons to possibly trigger the disabled state
            $('#parameter-dialog').modal('refreshButtons');
        });

        $('#parameter-value-field').on('keyup', function (evt) {
            // update the buttons to possibly trigger the disabled state
            $('#parameter-dialog').modal('refreshButtons');
        });

        $('#parameter-description-field').on('keyup', function (evt) {
            // update the buttons to possibly trigger the disabled state
            $('#parameter-dialog').modal('refreshButtons');
        });

        $('#parameter-set-empty-string-field').on('change', function (evt) {
            // update the buttons to possibly trigger the disabled state
            $('#parameter-dialog').modal('refreshButtons');
        });

        initParameterTable();
    };

    /**
     * Opens the Add Parameter Dialog.
     * @param {Object} callbacks object with callbacks for handling the cancel and apply button functionality:
     *
     * @example
     * openAddParameterDialog({
     *     onApply: function () {
     *         // handle the apply button being clicked
     *     },
     *     onCancel: function() {
     *         // handle the cancel button being clicked
     *     }
     * });
     */
    var openAddParameterDialog = function (callbacks) {
        $('#parameter-dialog')
            .modal('setHeaderText', 'Add Parameter')
            .modal('setButtonModel', [{
                buttonText: '应用',
                color: {
                    base: '#728E9B',
                    hover: '#004849',
                    text: '#ffffff'
                },
                disabled: function () {
                    var param = serializeParameter();
                    var isUpdatingParameterContext = $('#parameter-context-updating-status').hasClass('show-status');

                    if (isUpdatingParameterContext || _.isEmpty(param.name)) {
                        return true;
                    }
                    return false;
                },
                handler: {
                    click: callbacks.onApply
                }
            }, {
                buttonText: '取消',
                color: {
                    base: '#E3E8EB',
                    hover: '#C7D2D7',
                    text: '#004849'
                },
                handler: {
                    click: callbacks.onCancel
                }
            }])
            .modal('show');

        $('#parameter-set-empty-string-field').off().on('change', function (event, args) {
            // if we are setting as an empty string, disable the editor
            if (args.isChecked) {
                $('#parameter-value-field').prop('disabled', true).val('');
                $('#parameter-dialog').modal('refreshButtons');
            } else {
                $('#parameter-value-field').prop('disabled', false);
                $('#parameter-dialog').modal('refreshButtons');
            }
        });
    };

    /**
     * Fetches the available Parameter Contexts.
     */
    var fetchParameterContexts = function () {
        return $.ajax({
                type: 'GET',
                url: '../nifi-api/flow/parameter-contexts',
                dataType: 'json'
            });
    };

    /**
     * Loads the parameter contexts.
     *
     * @param parameterContextToSelect   id of the parameter context to select in the grid
     */
    var loadParameterContexts = function (parameterContextToSelect) {
        var parameterContexts = fetchParameterContexts();

        // return a deferred for all parts of the parameter contexts
        return $.when(parameterContexts).done(function (response) {
            $('#parameter-contexts-last-refreshed').text(response.currentTime);

            var contexts = [];
            $.each(response.parameterContexts, function (_, parameterContext) {
                contexts.push($.extend({
                    type: 'ParameterContext'
                }, parameterContext));
            });

            // update the parameter contexts
            var parameterContextsGrid = $('#parameter-contexts-table').data('gridInstance');
            var parameterContextsData = parameterContextsGrid.getData();
            parameterContextsData.setItems(contexts);
            parameterContextsData.reSort();
            parameterContextsGrid.invalidate();

            // if we are pre-selecting a specific parameter context, get the row to select
            if (nfCommon.isDefinedAndNotNull(parameterContextToSelect)) {
                var parameterContextRow = null;
                $.each(contexts, function (i, contextEntity) {
                    if (contextEntity.id === parameterContextToSelect) {
                        parameterContextRow = parameterContextsData.getRowById(parameterContextToSelect);
                        return false;
                    }
                });
                if (parameterContextRow !== null) {
                    // select the desired row
                    parameterContextsGrid.setSelectedRows([parameterContextRow]);
                }
            }
        }).fail(nfErrorHandler.handleAjaxError);
    };

    /**
     * Shows the parameter contexts.
     */
    var showParameterContexts = function (response) {
        // show the parameter contexts dialog
        nfShell.showContent('#parameter-contexts');

        // adjust the table size
        nfParameterContexts.resetTableSize();
    };

    /**
     * Initializes the parameter contexts.
     */
    var initParameterContexts = function () {
        var parameterContextActionFormatter = function (row, cell, value, columnDef, dataContext) {
            var markup = '';

            var canWrite = dataContext.permissions.canWrite;
            var canRead = dataContext.permissions.canRead;

            if (canRead && canWrite) {
                markup += '<div title="编辑" class="pointer edit-parameter-context fa fa-pencil"></div>';
            }

            if (canRead && canWrite && nfCommon.canModifyParameterContexts()) {
                markup += '<div title="移除" class="pointer delete-parameter-context fa fa-trash"></div>';
            }

            // allow policy configuration conditionally
            if (nfCanvasUtils.isManagedAuthorizer() && nfCommon.canAccessTenants()) {
                markup += '<div title="访问策略" class="pointer edit-access-policies fa fa-key"></div>';
            }

            return markup;
        };

        var descriptionFormatter = function (row, cell, value, columnDef, dataContext) {
            if (!dataContext.permissions.canRead) {
                return '';
            }

            return nfCommon.escapeHtml(dataContext.component.description);
        };

        var parameterContextInfoFormatter = function (row, cell, value, columnDef, dataContext) {
            var markup = '';

            var canRead = dataContext.permissions.canRead;

            if (canRead) {
                markup += '<div title="查看详细信息" class="pointer view-parameter-context fa fa-info-circle"></div>';
            }

            return markup;
        };

        // define the column model for the parameter contexts table
        var parameterContextsColumnModel = [
            {
                id: 'info',
                name: '&nbsp;',
                resizable: false,
                formatter: parameterContextInfoFormatter,
                sortable: false,
                width: 30,
                maxWidth: 30
            },
            {
                id: 'name',
                name: '名称',
                sortable: true,
                resizable: true,
                formatter: nameFormatter
            },
            {
                id: 'description',
                name: '描述',
                sortable: true,
                resizable: true,
                formatter: descriptionFormatter
            }
        ];

        // action column should always be last
        parameterContextsColumnModel.push({
            id: 'actions',
            name: '&nbsp;',
            resizable: false,
            formatter: parameterContextActionFormatter,
            sortable: false,
            width: 90,
            maxWidth: 90
        });

        // initialize the dataview
        var parameterContextsData = new Slick.Data.DataView({
            inlineFilters: false
        });

        parameterContextsData.setItems([]);

        // initialize the sort
        sort({
            columnId: 'name',
            sortAsc: true
        }, parameterContextsData);

        // initialize the grid
        var parameterContextsGrid = new Slick.Grid('#parameter-contexts-table', parameterContextsData, parameterContextsColumnModel, parameterContextsGridOptions);
        parameterContextsGrid.setSelectionModel(new Slick.RowSelectionModel());
        parameterContextsGrid.registerPlugin(new Slick.AutoTooltips());
        parameterContextsGrid.setSortColumn('name', true);
        parameterContextsGrid.onSort.subscribe(function (e, args) {
            sort({
                columnId: args.sortCol.id,
                sortAsc: args.sortAsc
            }, parameterContextsData);
        });

        // configure a click listener
        parameterContextsGrid.onClick.subscribe(function (e, args) {
            var target = $(e.target);

            // get the context at this row
            var parameterContextEntity = parameterContextsData.getItem(args.row);

            // determine the desired action
            if (parameterContextsGrid.getColumns()[args.cell].id === 'actions') {
                if (target.hasClass('edit-parameter-context')) {
                    nfParameterContexts.showParameterContext(parameterContextEntity.id);
                } else if (target.hasClass('delete-parameter-context')) {
                    nfParameterContexts.promptToDeleteParameterContext(parameterContextEntity);
                } else if (target.hasClass('edit-access-policies')) {
                    nfPolicyManagement.showParameterContextPolicy(parameterContextEntity);

                    // close the settings dialog
                    $('#shell-close-button').click();
                }
            } else if (parameterContextsGrid.getColumns()[args.cell].id === 'info') {
                if (target.hasClass('view-parameter-context')) {
                    nfParameterContexts.showParameterContext(parameterContextEntity.id, true);
                }
            }
        });

        // wire up the dataview to the grid
        parameterContextsData.onRowCountChanged.subscribe(function (e, args) {
            parameterContextsGrid.updateRowCount();
            parameterContextsGrid.render();
        });
        parameterContextsData.onRowsChanged.subscribe(function (e, args) {
            parameterContextsGrid.invalidateRows(args.rows);
            parameterContextsGrid.render();
        });
        parameterContextsData.syncGridSelection(parameterContextsGrid, true);

        // hold onto an instance of the grid
        $('#parameter-contexts-table').data('gridInstance', parameterContextsGrid).on('mouseenter', 'div.slick-cell', function (e) {
            var errorIcon = $(this).find('div.has-errors');
            if (errorIcon.length && !errorIcon.data('qtip')) {
                var contextId = $(this).find('span.row-id').text();

                // get the task item
                var parameterContextEntity = parameterContextsData.getItemById(contextId);

                // format the errors
                var tooltip = nfCommon.formatUnorderedList(parameterContextEntity.component.validationErrors);

                // show the tooltip
                if (nfCommon.isDefinedAndNotNull(tooltip)) {
                    errorIcon.qtip($.extend({},
                        nfCommon.config.tooltipConfig,
                        {
                            content: tooltip,
                            position: {
                                target: 'mouse',
                                viewport: $('#shell-container'),
                                adjust: {
                                    x: 8,
                                    y: 8,
                                    method: 'flipinvert flipinvert'
                                }
                            }
                        }));
                }
            }
        });
    };

    var currentParameterContextEntity = null;

    var nfParameterContexts = {
        /**
         * Initializes the parameter contexts page.
         */
        init: function () {
            // parameter context refresh button
            $('#parameter-contexts-refresh-button').on('click', function () {
                loadParameterContexts();
            });

            // create a new parameter context
            $('#new-parameter-context').on('click', function () {
                resetUsage();
                resetInheritance();

                // new parameter contexts do not have an ID to show
                if (!$('#parameter-context-id-setting').hasClass('hidden')) {
                    $('#parameter-context-id-setting').addClass('hidden');
                }

                // make sure this dialog is not in read-only mode
                $('#parameter-context-dialog').removeClass('read-only');
                $('#parameter-context-dialog').addClass('edit-mode');

                $('#parameter-context-dialog').modal('setHeaderText', 'Add Parameter Context').modal('setButtonModel', [{
                    buttonText: '应用',
                    color: {
                        base: '#728E9B',
                        hover: '#004849',
                        text: '#ffffff'
                    },
                    disabled: function () {
                        if ($('#parameter-context-name').val() !== '') {
                            return false;
                        }
                        return true;
                    },
                    handler: {
                        click: function () {
                            nfParameterContexts.addParameterContext();
                        }
                    }
                }, {
                    buttonText: '取消',
                    color: {
                        base: '#E3E8EB',
                        hover: '#C7D2D7',
                        text: '#004849'
                    },
                    handler: {
                        click: function () {
                            $(this).modal('hide');
                        }
                    }
                }]).modal('show');

                var parameterContextsGrid = $('#parameter-contexts-table').data('gridInstance');
                var parameterContextsData = parameterContextsGrid.getData();
                var parameterContexts = parameterContextsData.getItems();

                loadParameterContextInheritance(null, false, parameterContexts);

                // set the initial focus
                $('#parameter-context-name').focus();
            });

            // work around for https://bugs.jqueryui.com/ticket/6054
            var shouldAllowDrop = true;

            // make the parameter context containers sortable
            $('#parameter-context-available').sortable({
                containment: $('#parameter-context-inheritance-tab-content'),
                cancel: '.unauthorized',
                connectWith: '#parameter-context-selected',
                placeholder: 'available',
                scroll: true,
                opacity: 0.6,
                beforeStop: function (event, ui) {
                    if ($('#parameter-context-available').find('.ui-sortable-placeholder').length) {
                        shouldAllowDrop = false;
                    }
                },
                stop: function (event, ui) {
                    const allowDrop = shouldAllowDrop;
                    shouldAllowDrop = true;
                    return allowDrop;
                }
            });
            $('#parameter-context-selected').sortable({
                containment: $('#parameter-context-inheritance-tab-content'),
                cancel: '.unauthorized',
                placeholder: 'selected',
                scroll: true,
                opacity: 0.6,
                receive: function (event, ui) {
                    addControlsForSelectedParameterContext(ui.item);
                },
                update: function (event, ui) {
                    // update the buttons to possibly trigger the disabled state
                    $('#parameter-context-dialog').modal('refreshButtons');
                }
            });
            $('#parameter-context-available, #parameter-context-selected').disableSelection();

            // add a listener that will handle dblclick for all available authorized parameter context children
            $(document).on('dblclick', '#parameter-context-available li:not(".unauthorized")', function() {
                var availableParameterContextElement = $(this).detach().appendTo($('#parameter-context-selected'));

                addControlsForSelectedParameterContext(availableParameterContextElement);

                // update the buttons to possibly trigger the disabled state
                $('#parameter-context-dialog').modal('refreshButtons');
            });

            // initialize the new parameter context dialog
            initNewParameterContextDialog();

            initParameterContexts();

            $(window).on('resize', function (e) {
                if ($('#parameter-referencing-components-container').is(':visible')) {
                    updateReferencingComponentsBorder($('#parameter-referencing-components-container'));
                }
            });
        },

        /**
         * Adds a new parameter context.
         *
         * @param {object} parameterContextCreatedDeferred          The parameter context created callback.
         */
        addParameterContext: function (parameterContextCreatedDeferred) {
            // build the parameter context entity
            var parameterContextEntity = {
                "component": {
                    "name": $('#parameter-context-name').val(),
                    "description": $('#parameter-context-description-field').val(),
                    "parameters": marshalParameters()
                },
                'revision': nfClient.getRevision({
                    'revision': {
                        'version': 0
                    }
                })
            };

            // include the inherited parameter contexts
            parameterContextEntity.component.inheritedParameterContexts = marshalInheritedParameterContexts();

            var addContext = $.ajax({
                type: 'POST',
                url: config.urls.parameterContexts,
                data: JSON.stringify(parameterContextEntity),
                dataType: 'json',
                contentType: 'application/json'
            }).done(function (parameterContextEntity) {
                // update the table if displayed
                if ($('#parameter-contexts-table').is(':visible')) {
                    var parameterContextGrid = $('#parameter-contexts-table').data('gridInstance');
                    var parameterContextData = parameterContextGrid.getData();
                    parameterContextData.addItem(parameterContextEntity);

                    // resort
                    parameterContextData.reSort();
                    parameterContextGrid.invalidate();

                    // select the new parameter context
                    var row = parameterContextData.getRowById(parameterContextEntity.id);
                    nfFilteredDialogCommon.choseRow(parameterContextGrid, row);
                    parameterContextGrid.scrollRowIntoView(row);
                }

                // invoke callback if necessary
                if (typeof parameterContextCreatedDeferred === 'function') {
                    parameterContextCreatedDeferred(parameterContextEntity);
                }
            }).fail(nfErrorHandler.handleAjaxError);

            // hide the dialog
            $('#parameter-context-dialog').modal('hide');

            return addContext;
        },

        /**
         * Update the size of the grid based on its container's current size.
         */
        resetTableSize: function () {
            var parameterContextsGrid = $('#parameter-contexts-table').data('gridInstance');
            if (nfCommon.isDefinedAndNotNull(parameterContextsGrid)) {
                parameterContextsGrid.resizeCanvas();
            }
        },

        /**
         * Shows the parameter context dialog.
         *
         * @param id         The parameter context id to select
         */
        showParameterContexts: function (id) {
            // conditionally allow creation of new parameter contexts
            $('#new-parameter-context').prop('disabled', !nfCommon.canModifyParameterContexts());

            // load the parameter contexts
            return loadParameterContexts(id).done(showParameterContexts);
        },

        /**
         * Shows the dialog for the specified parameter context.
         *
         * @param id                  The parameter context id
         * @param readOnly            Optional, boolean to open in read only mode even if the user has permission to write.
         * @param parameterToSelect   Optional, name of the parameter to select in the table.
         */
        showParameterContext: function (id, readOnly, parameterToSelect) {
            parameterCount = 0;

            // reload the parameter context in case the parameters have changed
            var reloadContext = $.ajax({
                type: 'GET',
                url: config.urls.parameterContexts + '/' + encodeURIComponent(id),
                data: {
                    includeInheritedParameters: 'true'
                },
                dataType: 'json'
            });

            var parameterContextsDeferred;
            if ($('#parameter-contexts-table').is(':visible')) {
                parameterContextsDeferred = $.Deferred(function (deferred) {
                    var parameterContextsGrid = $('#parameter-contexts-table').data('gridInstance');
                    var parameterContextsData = parameterContextsGrid.getData();
                    deferred.resolve({
                        parameterContexts: parameterContextsData.getItems()
                    });
                }).promise();
            } else {
                parameterContextsDeferred = fetchParameterContexts();
            }

            // once everything is loaded, show the dialog
            reloadContext.done(function (parameterContextEntity) {
                var canWrite = _.get(parameterContextEntity, 'permissions.canWrite', false);

                // if specifically asked to open in read only mode, set canWrite to false to trigger that behavior
                if (_.defaultTo(readOnly, false)) {
                    canWrite = false;
                }

                currentParameterContextEntity = parameterContextEntity;
                if (canWrite) {
                    $('#parameter-context-dialog').removeClass('read-only');
                    $('#parameter-context-dialog').addClass('edit-mode');
                    $('#parameter-context-name').val(parameterContextEntity.component.name);
                    $('#parameter-context-description-field').val(parameterContextEntity.component.description);
                } else {
                    $('#parameter-context-dialog').removeClass('edit-mode');
                    $('#parameter-context-dialog').addClass('read-only');
                    $('#parameter-context-name-read-only')
                        .prop('title', parameterContextEntity.component.name)
                        .text(parameterContextEntity.component.name);
                    $('#parameter-context-description-read-only').text(parameterContextEntity.component.description);
                }

                // show the parameter context id
                if ($('#parameter-context-id-setting').hasClass('hidden')) {
                    $('#parameter-context-id-setting').removeClass('hidden');
                }
                $('#parameter-context-id-field')
                    .prop('title', parameterContextEntity.id)
                    .text(parameterContextEntity.id);

                // get the reference container
                var referencingComponentsContainer = $('#parameter-context-referencing-components');

                // load the controller referencing components list
                loadReferencingProcessGroups(referencingComponentsContainer, parameterContextEntity);

                loadParameters(parameterContextEntity, parameterToSelect, readOnly || !canWrite);

                // load the parameter contexts in order to render all available parameter contexts
                parameterContextsDeferred.done(function (response) {
                    loadParameterContextInheritance(parameterContextEntity, readOnly || !canWrite, response.parameterContexts);

                    var editModeButtonModel = [{
                        buttonText: '应用',
                        color: {
                            base: '#728E9B',
                            hover: '#004849',
                            text: '#ffffff'
                        },
                        disabled: function () {
                            if ($('#parameter-context-name').val() !== '' && hasParameterContextChanged(currentParameterContextEntity)) {
                                return false;
                            }
                            return true;
                        },
                        handler: {
                            click: function () {
                                updateParameterContext(currentParameterContextEntity);
                            }
                        }
                    }, {
                        buttonText: '取消',
                        color: {
                            base: '#E3E8EB',
                            hover: '#C7D2D7',
                            text: '#004849'
                        },
                        handler: {
                            click: function () {
                                $(this).modal('hide');
                            }
                        }
                    }];

                    var readOnlyButtonModel = [{
                        buttonText: '确定',
                        color: {
                            base: '#728E9B',
                            hover: '#004849',
                            text: '#ffffff'
                        },
                        disabled: function () {
                            return false;
                        },
                        handler: {
                            click: function () {
                                $(this).modal('hide');
                            }
                        }
                    }];

                    // show the context
                    $('#parameter-context-dialog')
                        .modal('setHeaderText', canWrite ? 'Update Parameter Context' : 'View Parameter Context')
                        .modal('setButtonModel', canWrite ? editModeButtonModel : readOnlyButtonModel)
                        .modal('show');

                    // select the parameters tab
                    $('#parameter-context-tabs').find('li:eq(1)').click();

                    // check if border is necessary
                    updateReferencingComponentsBorder($('#parameter-referencing-components-container'));

                    // show the border if necessary
                    updateReferencingComponentsBorder(referencingComponentsContainer);
                }).fail(nfErrorHandler.handleAjaxError);
            }).fail(nfErrorHandler.handleAjaxError);
        },

        /**
         * Prompts the user before attempting to delete the specified parameter context.
         *
         * @param {object} parameterContextEntity
         */
        promptToDeleteParameterContext: function (parameterContextEntity) {
            // prompt for deletion
            nfDialog.showYesNoDialog({
                headerText: '删除参数上下文',
                dialogContent: '删除参数上下文 \'' + nfCommon.escapeHtml(parameterContextEntity.component.name) + '\'?',
                yesHandler: function () {
                    nfParameterContexts.remove(parameterContextEntity);
                }
            });
        },

        /**
         * Deletes the specified parameter context.
         *
         * @param {object} parameterContextEntity
         */
        remove: function (parameterContextEntity) {
            $.ajax({
                type: 'DELETE',
                url: config.urls.parameterContexts + '/' + encodeURIComponent(parameterContextEntity.id) + '?' + $.param({
                    'disconnectedNodeAcknowledged': nfStorage.isDisconnectionAcknowledged(),
                    'clientId': parameterContextEntity.revision.clientId,
                    'version': parameterContextEntity.revision.version
                }),
                dataType: 'json'
            }).done(function (response) {
                // remove the parameter context
                var parameterContextGrid = $('#parameter-contexts-table').data('gridInstance');
                var parameterContextData = parameterContextGrid.getData();
                parameterContextData.deleteItem(parameterContextEntity.id);
            }).fail(nfErrorHandler.handleAjaxError);
        },

        /**
         * Converts a property in to a parameter and adds the parameter to the current parameter context.
         * @param property              property to convert
         * @param propertyDescriptor    property descriptor for the property bering converted
         * @param parameterContextId    id of the current parameter context
         * @return Promise              A Promise that resolves with the added parameter
         */
        convertPropertyToParameter: function (property, propertyDescriptor, parameterContextId) {
            return $.Deferred(function (deferred) {

                if (_.isNil(parameterContextId)) {
                    nfDialog.showOkDialog({
                        headerText: '不能转换属性',
                        dialogContent: '当前处理组没有设置参数上下文.'
                    });

                    deferred.reject();
                }

                var getContext = $.ajax({
                    type: 'GET',
                    url: config.urls.parameterContexts + '/' + encodeURIComponent(parameterContextId),
                    data: {
                        includeInheritedParameters: 'true'
                    },
                    dataType: 'json'
                });

                // get the parameter context, show the dialog
                getContext
                    .done(function (parameterContextEntity) {
                        var showUpdateStatus = function (isOn) {
                            if (isOn) {
                                // show the status message
                                $('#parameter-context-updating-status').addClass('show-status');

                                // disable the apply button
                                $('#parameter-dialog').modal('refreshButtons');
                            } else {
                                $('#parameter-context-updating-status').removeClass('show-status');

                                // possibly re-enable the apply button
                                $('#parameter-dialog').modal('refreshButtons');
                            }
                        };

                        var requestId;
                        var updateTimeoutReference;

                        openAddParameterDialog({
                            onApply: function () {
                                showUpdateStatus(true);

                                var existingParameters = parameterContextEntity.component.parameters.map(function(p) { return p.parameter });
                                var parameter = serializeParameter();

                                var isValid = validateParameter(parameter, existingParameters);

                                if (!isValid) {
                                    // Do not resolve or reject here. Give the user the chance to fix the issue.
                                    showUpdateStatus(false);
                                    return;
                                }

                                // only adding a new parameter, just put the new one in the list for the update
                                parameterContextEntity.component.parameters = [{
                                    parameter: {
                                        name: parameter.name,
                                        value: parameter.value,
                                        sensitive: parameter.sensitive,
                                        description: parameter.description
                                    }}];

                                requestId = null;

                                // initiate the parameter context update with the new parameter
                                submitUpdateRequest(parameterContextEntity)
                                    .done(function (response) {
                                        var pollUpdateRequest = function (updateRequestEntity) {
                                            var updateRequest = updateRequestEntity.request;
                                            var errored = !_.isEmpty(updateRequest.failureReason);

                                            // get the request id
                                            requestId = updateRequest.requestId;

                                            if (updateRequest.complete === true) {
                                                showUpdateStatus(false);

                                                if (errored) {
                                                    nfDialog.showOkDialog({
                                                        headerText: '更新参数上下文错误',
                                                        dialogContent: '更新参数上下文失败: ' + nfCommon.escapeHtml(updateRequest.failureReason)
                                                    });
                                                    // update failed, therefore converting failed. reject the promise for the caller
                                                    deferred.reject();
                                                } else {
                                                    // resolve the promise for the caller if the update was successful
                                                    deferred.resolve(parameter);
                                                }

                                                // delete the update request
                                                deleteUpdateRequest(parameterContextEntity.id, requestId);

                                                // hide the param dialog
                                                $('#parameter-dialog').modal('hide');

                                            } else {
                                                // wait to get an updated status
                                                updateTimeoutReference = setTimeout(function () {
                                                    getUpdateRequest(parameterContextEntity.id, requestId)
                                                        .done(function (getResponse) {
                                                            pollUpdateRequest(getResponse);
                                                        })
                                                        .fail(function (e) {
                                                            if (!_.isNil(parameterContextEntity.id) && !_.isNil(requestId)) {
                                                                deleteUpdateRequest(parameterContextEntity.id, requestId);
                                                            }
                                                            deferred.reject(e)
                                                        });
                                                }, 1000);
                                            }
                                        };

                                        pollUpdateRequest(response);
                                    })
                                    .fail(function (e) {
                                        deferred.reject(e)
                                    });
                            },
                            onCancel: function () {
                                showUpdateStatus(false);

                                if (!_.isNil(parameterContextEntity.id) && !_.isNil(requestId)) {
                                    deleteUpdateRequest(parameterContextEntity.id, requestId);
                                    requestId = null;
                                    if (!_.isNil(updateTimeoutReference)) {
                                        clearTimeout(updateTimeoutReference);
                                    }
                                }
                                resetParameterDialog();

                                // hide the dialog
                                $(this).modal('hide');
                            }
                        });

                        // set the values of the form from the passed in property
                        $('#parameter-name').val(property.displayName);
                        $('#parameter-name').prop('disabled', false);
                        $('#parameter-sensitive-radio-button').prop('disabled', true);
                        $('#parameter-not-sensitive-radio-button').prop('disabled', true);
                        if (property.value === '') {
                            $('#parameter-dialog').find('.nf-checkbox').removeClass('checkbox-unchecked').addClass('checkbox-checked');
                        } else {
                            $('#parameter-dialog').find('.nf-checkbox').removeClass('checkbox-checked').addClass('checkbox-unchecked');
                        }

                        if (nfCommon.isSensitiveProperty(propertyDescriptor)) {
                            $('#parameter-sensitive-radio-button').prop('checked', true);
                            $('#parameter-not-sensitive-radio-button').prop('checked', false);
                            $('#parameter-value-field').val(null);
                        } else {
                            $('#parameter-sensitive-radio-button').prop('checked', false);
                            $('#parameter-not-sensitive-radio-button').prop('checked', true);
                            $('#parameter-value-field').val(property.value);
                        }
                        $('#parameter-description-field').val(property.description);

                        // update the buttons to possibly trigger the disabled state
                        $('#parameter-dialog').modal('refreshButtons');
                    })
                    .fail(function (e) {
                        deferred.reject(e);
                    });
            }).promise();
        }
    };

    return nfParameterContexts;
}));
