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
                'd3',
                'nf.Common',
                'nf.CanvasUtils',
                'nf.ng.Bridge'],
            function ($, d3, nfCommon, nfCanvasUtils, nfNgBridge) {
                return (nf.ContextMenu = factory($, d3, nfCommon, nfCanvasUtils, nfNgBridge));
            });
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = (nf.ContextMenu =
            factory(require('jquery'),
                require('d3'),
                require('nf.Common'),
                require('nf.CanvasUtils'),
                require('nf.ng.Bridge')));
    } else {
        nf.ContextMenu = factory(root.$,
            root.d3,
            root.nf.Common,
            root.nf.CanvasUtils,
            root.nf.ng.Bridge);
    }
}(this, function ($, d3, nfCommon, nfCanvasUtils, nfNgBridge) {
    'use strict';

    var nfActions;

    /**
     * Returns whether the current group is not the root group.
     *
     * @param {selection} selection         The selection of currently selected components
     */
    var isNotRootGroup = function (selection) {
        return nfCanvasUtils.getParentGroupId() !== null && selection.empty();
    };

    /**
     * Determines whether the component in the specified selection is configurable.
     *
     * @param {selection} selection         The selection of currently selected components
     */
    var isConfigurable = function (selection) {
        if(selection.size() == 1 &&
            nfCanvasUtils.isProcessor(selection) &&
            nfCanvasUtils.canModify(selection) &&
            (nfCanvasUtils.isConfigurable(selection) ||
                canTerminate(selection))){
            return true;
        } else {
            return nfCanvasUtils.isConfigurable(selection);
        }
    };

    /**
     * Determines whether the component in the specified selection has variables.
     *
     * @param {selection} selection         The selection of currently selected components
     */
    var hasVariables = function (selection) {
        return selection.empty() || nfCanvasUtils.isProcessGroup(selection);
    };

    /**
     * Determines whether the component in the specified selection has a parameter context.
     *
     * @param {selection} selection         The selection of currently selected components
     */
    var hasParameterContext = function (selection) {
        var parameterContext;

        if (selection.empty()) {
            parameterContext = nfCanvasUtils.getParameterContext();
        } else if (nfCanvasUtils.isProcessGroup(selection)) {
            var pg = selection.datum();
            parameterContext = pg.parameterContext;
        }

        if (nfCommon.isDefinedAndNotNull(parameterContext)) {
            return nfCommon.isDefinedAndNotNull(parameterContext) && parameterContext.permissions.canRead === true;
        }

        return false;
    };

    /**
     * Determines whether the component in the specified selection has configuration details.
     *
     * @param {selection} selection         The selection of currently selected components
     */
    var hasDetails = function (selection) {
        if(selection.size() == 1 &&
            nfCanvasUtils.isProcessor(selection) &&
            nfCanvasUtils.canModify(selection)){
            return !isConfigurable(selection);
        } else {
            return nfCanvasUtils.hasDetails(selection);
        }
    };

    /**
     * Determines whether the components in the specified selection are deletable.
     *
     * @param {selection} selection         The selection of currently selected components
     */
    var isDeletable = function (selection) {
        return nfCanvasUtils.areDeletable(selection);
    };

    /**
     * Determines whether user can create a template from the components in the specified selection.
     *
     * @param {selection} selection         The selection of currently selected components
     */
    var canCreateTemplate = function (selection) {
        return nfCanvasUtils.canWriteCurrentGroup() && (selection.empty() || nfCanvasUtils.canRead(selection));
    };

    /**
     * Determines whether user can upload a template.
     *
     * @param {selection} selection         The selection of currently selected components
     */
    var canUploadTemplate = function (selection) {
        return nfCanvasUtils.canWriteCurrentGroup() && selection.empty();
    };

    /**
     * Determines whether components in the specified selection are group-able.
     *
     * @param {selection} selection         The selection of currently selected components
     */
    var canGroup = function (selection) {
        return nfCanvasUtils.getComponentByType('Connection').isDisconnected(selection) && nfCanvasUtils.canModify(selection);
    };

    /**
     * Determines whether components in the specified selection are enable-able.
     *
     * @param {selection} selection         The selection of currently selected components
     */
    var canEnable = function (selection) {
        return nfCanvasUtils.canEnable(selection);
    };

    /**
     * Determines whether components in the specified selection are diable-able.
     *
     * @param {selection} selection         The selection of currently selected components
     */
    var canDisable = function (selection) {
        return nfCanvasUtils.canDisable(selection);
    };

    /**
     * Determines whether user can manage policies of the components in the specified selection.
     *
     * @param {selection} selection         The selection of currently selected components
     */
    var canManagePolicies = function (selection) {
        return nfCanvasUtils.isManagedAuthorizer() && nfCanvasUtils.canManagePolicies(selection);
    };

    /**
     * Determines whether the components in the specified selection are runnable.
     *
     * @param {selection} selection         The selection of currently selected components
     */
    var isRunnable = function (selection) {
        return nfCanvasUtils.areRunnable(selection);
    };

    /**
     * Determines whether the components in the specified selection are stoppable.
     *
     * @param {selection} selection         The selection of currently selected components
     */
    var isStoppable = function (selection) {
        return nfCanvasUtils.areStoppable(selection);
    };

    /**
     * Determines whether the components in the specified selection can be terminated.
     *
     * @param {selection} selection         The selections of currently selected components
     */
    var canTerminate = function (selection) {
        if (selection.size() !== 1) {
            return false;
        }

        if (nfCanvasUtils.canOperate(selection) === false) {
            return false;
        }

        var terminatable = false;
        if (nfCanvasUtils.isProcessor(selection)) {
            var selectionData = selection.datum();
            var aggregateSnapshot = selectionData.status.aggregateSnapshot;
            terminatable = aggregateSnapshot.runStatus !== 'Running' && aggregateSnapshot.activeThreadCount > 0;
        }

        return terminatable;
    };

    /**
     * Determines whether the components in the specified selection support stats.
     *
     * @param {selection} selection         The selection of currently selected components
     */
    var supportsStats = function (selection) {
        // ensure the correct number of components are selected
        if (selection.size() !== 1) {
            return false;
        }

        return nfCanvasUtils.isProcessor(selection) || nfCanvasUtils.isProcessGroup(selection) || nfCanvasUtils.isRemoteProcessGroup(selection) || nfCanvasUtils.isConnection(selection);
    };

    /**
     * Determines whether the components in the specified selection has usage documentation.
     *
     * @param {selection} selection         The selection of currently selected components
     */
    var hasUsage = function (selection) {
        // ensure the correct number of components are selected
        if (selection.size() !== 1) {
            return false;
        }
        if (nfCanvasUtils.canRead(selection) === false) {
            return false;
        }

        return nfCanvasUtils.isProcessor(selection);
    };

    /**
     * Determines whether there is one component selected.
     *
     * @param {selection} selection         The selection of currently selected components
     */
    var isNotConnection = function (selection) {
        return selection.size() === 1 && !nfCanvasUtils.isConnection(selection);
    };

    /**
     * Determines whether the components in the specified selection are copyable.
     *
     * @param {selection} selection         The selection of currently selected components
     */
    var isCopyable = function (selection) {
        return nfCanvasUtils.isCopyable(selection);
    };

    /**
     * Determines whether the components in the specified selection are pastable.
     *
     * @param {selection} selection         The selection of currently selected components
     */
    var isPastable = function (selection) {
        return nfCanvasUtils.isPastable();
    };

    /**
     * Determines whether the specified selection is empty.
     *
     * @param {selection} selection         The seleciton
     */
    var emptySelection = function (selection) {
        return selection.empty();
    };

    /**
     * Determines whether the componets in the specified selection support being moved to the front.
     *
     * @param {selection} selection         The selection
     */
    var canMoveToFront = function (selection) {
        // ensure the correct number of components are selected
        if (selection.size() !== 1) {
            return false;
        }
        if (nfCanvasUtils.canModify(selection) === false) {
            return false;
        }

        return nfCanvasUtils.isConnection(selection) || nfCanvasUtils.isLabel(selection);
    };

    /**
     * Determines whether the components in the specified selection are alignable.
     *
     * @param {selection} selection          The selection
     */
    var canAlign = function (selection) {
        return nfCanvasUtils.canAlign(selection);
    };

    /**
     * Determines whether the components in the specified selection are colorable.
     *
     * @param {selection} selection          The selection
     */
    var isColorable = function (selection) {
        return nfCanvasUtils.isColorable(selection);
    };

    /**
     * Determines whether the component in the specified selection is a connection.
     *
     * @param {selection} selection         The selection
     */
    var isConnection = function (selection) {
        // ensure the correct number of components are selected
        if (selection.size() !== 1) {
            return false;
        }

        return nfCanvasUtils.isConnection(selection);
    };

    /**
     * Determines whether the component in the specified selection could possibly have downstream components.
     *
     * @param {selection} selection         The selection
     */
    var hasDownstream = function (selection) {
        // ensure the correct number of components are selected
        if (selection.size() !== 1) {
            return false;
        }

        return nfCanvasUtils.isFunnel(selection) || nfCanvasUtils.isProcessor(selection) || nfCanvasUtils.isProcessGroup(selection) ||
            nfCanvasUtils.isRemoteProcessGroup(selection) || nfCanvasUtils.isInputPort(selection) ||
            (nfCanvasUtils.isOutputPort(selection) && nfCanvasUtils.getParentGroupId() !== null);
    };

    /**
     * Determines whether the component in the specified selection could possibly have upstream components.
     *
     * @param {selection} selection         The selection
     */
    var hasUpstream = function (selection) {
        // ensure the correct number of components are selected
        if (selection.size() !== 1) {
            return false;
        }

        return nfCanvasUtils.isFunnel(selection) || nfCanvasUtils.isProcessor(selection) || nfCanvasUtils.isProcessGroup(selection) ||
            nfCanvasUtils.isRemoteProcessGroup(selection) || nfCanvasUtils.isOutputPort(selection) ||
            (nfCanvasUtils.isInputPort(selection) && nfCanvasUtils.getParentGroupId() !== null);
    };

    /**
     * Determines whether the current selection is a stateful processor.
     *
     * @param {selection} selection
     */
    var isStatefulProcessor = function (selection) {
        // ensure the correct number of components are selected
        if (selection.size() !== 1) {
            return false;
        }
        if (nfCanvasUtils.canRead(selection) === false || nfCanvasUtils.canModify(selection) === false) {
            return false;
        }

        if (nfCanvasUtils.isProcessor(selection)) {
            var processorData = selection.datum();
            return processorData.component.persistsState === true;
        } else {
            return false;
        }
    };

    /**
     * Determines whether the current selection is a processor with more than one version.
     *
     * @param {selection} selection
     */
    var canChangeProcessorVersion = function (selection) {
        // ensure the correct number of components are selected
        if (selection.size() !== 1) {
            return false;
        }
        if (nfCanvasUtils.canRead(selection) === false || nfCanvasUtils.canModify(selection) === false) {
            return false;
        }

        if (nfCanvasUtils.isProcessor(selection)) {
            var processorData = selection.datum();
            return processorData.component.multipleVersionsAvailable === true;
        } else {
            return false;
        }
    };

    /**
     * Determines whether the current selection is a process group.
     *
     * @param {selection} selection
     */
    var isProcessGroup = function (selection) {
        // ensure the correct number of components are selected
        if (selection.size() !== 1) {
            return false;
        }

        return nfCanvasUtils.isProcessGroup(selection);
    };

    /**
     * Determines whether the current selection is a processor.
     *
     * @param {selection} selection
     */
    var isRunnableProcessor = function (selection) {
        // ensure the correct number of components are selected
        if (selection.size() !== 1) {
            return false;
        }

        return isRunnable(selection) && nfCanvasUtils.isProcessor(selection);
    };

    /**
     * Returns whether the process group supports downloading the current flow.
     *
     * @param selection
     * @returns {boolean}
     */
    var supportsDownloadFlow = function (selection) {
        // download is allowed when either nothing is selected or a single readable process group is selected
        return (selection.empty() && nfCanvasUtils.canReadCurrentGroup()) ||
                (selection.size() === 1 && nfCanvasUtils.isProcessGroup(selection) && nfCanvasUtils.canRead(selection));
    };

    /**
     * Determines whether the current selection supports flow versioning.
     *
     * @param selection
     */
    var supportsFlowVersioning = function (selection) {
        if (nfCommon.canVersionFlows() === false) {
            return false;
        }

        if (selection.empty()) {
            // prevent versioning of the root group
            if (nfCanvasUtils.getParentGroupId() === null) {
                return false;
            }

            // if not root group, ensure adequate permissions
            return nfCanvasUtils.canReadCurrentGroup() && nfCanvasUtils.canWriteCurrentGroup();
        }

        if (isProcessGroup(selection) === true) {
            return nfCanvasUtils.canRead(selection) && nfCanvasUtils.canModify(selection);
        }

        return false;
    };

    /**
     * Determines whether the current selection supports starting flow versioning.
     *
     * @param selection
     */
    var supportsStartFlowVersioning = function (selection) {
        // ensure this selection supports flow versioning above
        if (supportsFlowVersioning(selection) === false) {
            return false;
        }

        if (selection.empty()) {
            // check bread crumbs for version control information in the current group
            var breadcrumbEntities = nfNgBridge.injector.get('breadcrumbsCtrl').getBreadcrumbs();
            if (breadcrumbEntities.length > 0) {
                var breadcrumbEntity = breadcrumbEntities[breadcrumbEntities.length - 1];
                if (breadcrumbEntity.permissions.canRead) {
                    return nfCommon.isUndefinedOrNull(breadcrumbEntity.breadcrumb.versionControlInformation);
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }

        // check the selection for version control information
        var processGroupData = selection.datum();
        return nfCommon.isUndefinedOrNull(processGroupData.component.versionControlInformation);
    };

    /**
     * Returns whether the process group support supports commit.
     *
     * @param selection
     * @returns {boolean}
     */
    var supportsCommitFlowVersion = function (selection) {
        var versionControlInformation = getFlowVersionControlInformation(selection);

        // check the selection for version control information
        return versionControlInformation !== null &&
            versionControlInformation.state === 'LOCALLY_MODIFIED';
    };

    /**
     * Returns whether the process group support supports force commit.
     *
     * @param selection
     * @returns {boolean}
     */
    var supportsForceCommitFlowVersion = function (selection) {
        var versionControlInformation = getFlowVersionControlInformation(selection);

        // check the selection for version control information
        return versionControlInformation !== null &&
            versionControlInformation.state === 'LOCALLY_MODIFIED_AND_STALE';
    };


    /**
     * Returns whether the process group supports revert local changes.
     *
     * @param selection
     * @returns {boolean}
     */
    var hasLocalChanges = function (selection) {
        var versionControlInformation = getFlowVersionControlInformation(selection);

        // check the selection for version control information
        return versionControlInformation !== null &&
            (versionControlInformation.state === 'LOCALLY_MODIFIED' ||
             versionControlInformation.state === 'LOCALLY_MODIFIED_AND_STALE');
    };

    /**
     * Returns whether the process group supports changing the flow version.
     *
     * @param selection
     * @returns {boolean}
     */
    var supportsChangeFlowVersion = function (selection) {
        var versionControlInformation = getFlowVersionControlInformation(selection);

        return versionControlInformation !== null &&
            versionControlInformation.state !== 'LOCALLY_MODIFIED' &&
            versionControlInformation.state !== 'LOCALLY_MODIFIED_AND_STALE' &&
            versionControlInformation.state !== 'SYNC_FAILURE';
    };

    /**
     * Determines whether the current selection supports stopping flow versioning.
     *
     * @param selection
     * @returns {boolean}
     */
    var supportsStopFlowVersioning = function (selection) {
        var versionControlInformation = getFlowVersionControlInformation(selection);

        return versionControlInformation !== null;
    };

    /**
     * Convenience function to perform all flow versioning pre-checks and retrieve
     * valid version information.
     *
     * @param selection
     */
    var getFlowVersionControlInformation = function (selection) {
        // ensure this selection supports flow versioning
        if (supportsFlowVersioning(selection) === false) {
            return null;
        }

        var versionControlInformation;
        if (selection.empty()) {
            // check bread crumbs for version control information in the current group
            var breadcrumbEntities = nfNgBridge.injector.get('breadcrumbsCtrl').getBreadcrumbs();
            if (breadcrumbEntities.length > 0) {
                var breadcrumbEntity = breadcrumbEntities[breadcrumbEntities.length - 1];
                if (breadcrumbEntity.permissions.canRead) {
                    versionControlInformation = breadcrumbEntity.breadcrumb.versionControlInformation;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } else {
            var processGroupData = selection.datum();
            versionControlInformation = processGroupData.component.versionControlInformation;
        }

        if (nfCommon.isDefinedAndNotNull(versionControlInformation)) {
            return versionControlInformation;;
        }

        return null;
    }

    /**
     * Determines whether the current selection could have provenance.
     *
     * @param {selection} selection
     */
    var canAccessProvenance = function (selection) {
        // ensure the correct number of components are selected
        if (selection.size() !== 1) {
            return false;
        }

        return !nfCanvasUtils.isLabel(selection) && !nfCanvasUtils.isConnection(selection) && !nfCanvasUtils.isProcessGroup(selection)
            && !nfCanvasUtils.isRemoteProcessGroup(selection) && nfCommon.canAccessProvenance();
    };

    /**
     * Determines whether the current selection is a remote process group.
     *
     * @param {selection} selection
     */
    var isRemoteProcessGroup = function (selection) {
        // ensure the correct number of components are selected
        if (selection.size() !== 1) {
            return false;
        }
        if (nfCanvasUtils.canRead(selection) === false) {
            return false;
        }

        return nfCanvasUtils.isRemoteProcessGroup(selection);
    };

    /**
     * Determines if the components in the specified selection support starting transmission.
     *
     * @param {selection} selection
     */
    var canStartTransmission = function (selection) {
        if (nfCanvasUtils.canOperate(selection) === false) {
            return false;
        }

        return nfCanvasUtils.canAllStartTransmitting(selection);
    };

    /**
     * Determines if the components in the specified selection support stopping transmission.
     *
     * @param {selection} selection
     */
    var canStopTransmission = function (selection) {
        if (nfCanvasUtils.canOperate(selection) === false) {
            return false;
        }

        return nfCanvasUtils.canAllStopTransmitting(selection);
    };

    /**
     * Only DFMs can empty a queue.
     *
     * @param {selection} selection
     */
    var canEmptyQueue = function (selection) {
        return isConnection(selection);
    };

    /**
     * Only DFMs can list a queue.
     *
     * @param {selection} selection
     */
    var canListQueue = function (selection) {
        return isConnection(selection);
    };

    /**
     * Determines if the components in the specified selection can be moved into a parent group.
     *
     * @param {type} selection
     */
    var canMoveToParent = function (selection) {
        if (nfCanvasUtils.canModify(selection) === false) {
            return false;
        }

        // TODO - also check can modify in parent

        return !selection.empty() && nfCanvasUtils.getComponentByType('Connection').isDisconnected(selection) && nfCanvasUtils.getParentGroupId() !== null;
    };

    /**
     * Closes sub menu's starting from the specified menu.
     *
     * @param menu menu
     */
    var closeSubMenus = function (menu) {
        menu.remove().find('.group-menu-item').each(function () {
            var siblingGroupId = $(this).attr('id');
            closeSubMenus($('#' + siblingGroupId + '-sub-menu'));
        });
    };

    /**
     * Adds a menu item to the context menu.
     *
     * {
     *      click: refresh (function),
     *      text: '开始' (string),
     *      clazz: 'fa fa-refresh'
     * }
     *
     * @param {jQuery} contextMenu The context menu
     * @param {object} item The menu item configuration
     */
    var addMenuItem = function (contextMenu, item) {
        var menuItem = $('<div class="context-menu-item"></div>').attr('id', item.id).on('mouseenter', function () {
            $(this).addClass('hover');

            contextMenu.find('.group-menu-item').not('#' + item.id).each(function () {
                var siblingGroupId = $(this).attr('id');
                closeSubMenus($('#' + siblingGroupId + '-sub-menu'));
            });
        }).on('mouseleave', function () {
            $(this).removeClass('hover');
        }).appendTo(contextMenu);

        // create the img and conditionally add the style
        var img = $('<div class="context-menu-item-img"></div>').addClass(item['clazz']).appendTo(menuItem);
        if (nfCommon.isDefinedAndNotNull(item['imgStyle'])) {
            img.addClass(item['imgStyle']);
        }

        $('<div class="context-menu-item-text"></div>').text(item['text']).appendTo(menuItem);
        if (item.isGroup) {
            $('<div class="fa fa-caret-right context-menu-group-item-img"></div>').appendTo(menuItem);
        }
        $('<div class="clear"></div>').appendTo(menuItem);

        return menuItem;
    };

    /**
     * Positions and shows the context menu.
     *
     * @param {jQuery} contextMenu  The context menu
     * @param {object} options      The context menu configuration
     */
    var positionAndShow = function (contextMenu, options) {
        contextMenu.css({
            'left': options.x + 'px',
            'top': options.y + 'px'
        }).show();
    };

    /**
     * Executes the specified action with the optional selection.
     *
     * @param {string} action
     * @param {selection} selection
     * @param {mouse event} evt
     */
    var executeAction = function (action, selection, evt) {
        // execute the action
        nfActions[action](selection, evt);

        // close the context menu
        nfContextMenu.hide();
    };

    // defines the available actions and the conditions which they apply
    var menuItems = [
        {id: 'reload-menu-item', condition: emptySelection, menuItem: {clazz: 'fa fa-refresh', text: '刷新', action: 'reload'}},
        {id: 'leave-group-menu-item', condition: isNotRootGroup, menuItem: {clazz: 'fa fa-level-up', text: '离开处理组', action: 'leaveGroup'}},
        {separator: true},
        {id: 'show-configuration-menu-item', condition: isConfigurable, menuItem: {clazz: 'fa fa-gear', text: '配置', action: 'showConfiguration'}},
        {id: 'show-details-menu-item', condition: hasDetails, menuItem: {clazz: 'fa fa-gear', text: '查看配置', action: 'showDetails'}},
        {id: 'parameters-menu-item', condition: hasParameterContext, menuItem: {clazz: 'fa', text: '参数', action: 'openParameterContext'}},
        {id: 'variable-registry-menu-item', condition: hasVariables, menuItem: {clazz: 'fa', text: '变量', action: 'openVariableRegistry'}},
        {separator: true},
        {id: 'version-menu-item', groupMenuItem: {clazz: 'fa', text: '版本'}, menuItems: [
            {id: 'start-version-control-menu-item', condition: supportsStartFlowVersioning, menuItem: {clazz: 'fa fa-upload', text: '启用版本管控', action: 'saveFlowVersion'}},
            {separator: true},
            {id: 'commit-menu-item', condition: supportsCommitFlowVersion, menuItem: {clazz: 'fa fa-upload', text: '提交本地修改', action: 'saveFlowVersion'}},
            {id: 'force-commit-menu-item', condition: supportsForceCommitFlowVersion, menuItem: {clazz: 'fa fa-upload', text: '提交本地修改', action: 'forceSaveFlowVersion'}},
            {id: 'local-changes-menu-item', condition: hasLocalChanges, menuItem: {clazz: 'fa', text: '显示本地修改', action: 'showLocalChanges'}},
            {id: 'revert-menu-item', condition: hasLocalChanges, menuItem: {clazz: 'fa fa-undo', text: '回退本地修改', action: 'revertLocalChanges'}},
            {id: 'change-version-menu-item', condition: supportsChangeFlowVersion, menuItem: {clazz: 'fa', text: '修改版本', action: 'changeFlowVersion'}},
            {separator: true},
            {id: 'stop-version-control-menu-item', condition: supportsStopFlowVersioning, menuItem: {clazz: 'fa', text: '停用版本管控', action: 'stopVersionControl'}}
        ]},
        {separator: true},
        {id: 'enter-group-menu-item', condition: isProcessGroup, menuItem: {clazz: 'fa fa-sign-in', text: '进入处理组', action: 'enterGroup'}},
        {separator: true},
        {id: 'start-menu-item', condition: isRunnable, menuItem: {clazz: 'fa fa-play', text: '开始', action: 'start'}},
        {id: 'stop-menu-item', condition: isStoppable, menuItem: {clazz: 'fa fa-stop', text: '停止', action: 'stop'}},
        {id: 'run-once-menu-item', condition: isRunnableProcessor, menuItem: {clazz: 'fa fa-caret-right', text: '运行一次', action: 'runOnce'}},
        {id: 'terminate-menu-item', condition: canTerminate, menuItem: {clazz: 'fa fa-hourglass-end', text: '终止', action: 'terminate'}},
        {id: 'enable-menu-item', condition: canEnable, menuItem: {clazz: 'fa fa-flash', text: '启用', action: 'enable'}},
        {id: 'disable-menu-item', condition: canDisable, menuItem: {clazz: 'icon icon-enable-false', text: '禁用', action: 'disable'}},
        {id: 'enable-transmission-menu-item', condition: canStartTransmission, menuItem: {clazz: 'fa fa-bullseye', text: '启用数据传输', action: 'enableTransmission'}},
        {id: 'disable-transmission-menu-item', condition: canStopTransmission, menuItem: { clazz: 'icon icon-transmit-false', text: '禁用数据传输', action: 'disableTransmission'}},
        {separator: true},
        {id: 'enable-all-controller-services-menu-item', condition: isProcessGroup, menuItem: {clazz: 'fa fa-flash', text: '启用所有控制器服务', action: 'enableAllControllerServices'}},
        {id: 'enable-all-controller-services-menu-item-noselection', condition: emptySelection, menuItem: {clazz: 'fa fa-flash', text: '启用所有控制器服务', action: 'enableAllControllerServices'}},
        {id: 'disable-all-controller-services-menu-item', condition: isProcessGroup, menuItem: {clazz: 'icon icon-enable-false', text: '禁用所有控制器服务', action: 'disableAllControllerServices'}},
        {id: 'disable-all-controller-services-menu-item-noselection', condition: emptySelection, menuItem: {clazz: 'icon icon-enable-false', text: '禁用所有控制器服务', action: 'disableAllControllerServices'}},
        {separator: true},
        {id: 'data-provenance-menu-item', condition: canAccessProvenance, menuItem: {clazz: 'icon icon-provenance', imgStyle: 'context-menu-provenance', text: '查看数据朔源', action: 'openProvenance'}},
        {id: 'show-stats-menu-item', condition: supportsStats, menuItem: {clazz: 'fa fa-area-chart', text: '查看状态历史', action: 'showStats'}},
        {id: 'view-state-menu-item', condition: isStatefulProcessor, menuItem: {clazz: 'fa fa-tasks', text: '查看状态', action: 'viewState'}},
        {id: 'list-queue-menu-item', condition: canListQueue, menuItem: {clazz: 'fa fa-list', text: '查看队列数据', action: 'listQueue'}},
        {id: 'show-usage-menu-item', condition: hasUsage, menuItem: {clazz: 'fa fa-book', text: '查看使用说明', action: 'showUsage'}},
        {id: 'view-menu-item', groupMenuItem: {clazz: 'icon icon-connect', text: '查看连接'}, menuItems: [
            {id: 'show-upstream-menu-item', condition: hasUpstream, menuItem: {clazz: 'icon', text: '上游连接', action: 'showUpstream'}},
            {id: 'show-downstream-menu-item', condition: hasDownstream, menuItem: {clazz: 'icon', text: '下游连接', action: 'showDownstream'}}
        ]},
        {separator: true},
        {id: 'refresh-remote-flow-menu-item', condition: isRemoteProcessGroup, menuItem: {clazz: 'fa fa-refresh', text: '刷新远端', action: 'refreshRemoteFlow'}},
        {separator: true},
        {id: 'remote-ports-menu-item', condition: isRemoteProcessGroup, menuItem: {clazz: 'fa fa-cloud', text: '管理远程端口', action: 'remotePorts'}},
        {id: 'manage-policies-menu-item', condition: canManagePolicies, menuItem: {clazz: 'fa fa-key', text: '管理访问策略', action: 'managePolicies'}},
        {id: 'change-version-menu-item', condition: canChangeProcessorVersion, menuItem: {clazz: 'fa fa-exchange', text: '修改版本', action: 'changeVersion'}},
        {separator: true},
        {id: 'show-source-menu-item', condition: isConnection, menuItem: {clazz: 'fa fa-long-arrow-left', text: '查看源组件', action: 'showSource'}},
        {id: 'show-destination-menu-item', condition: isConnection, menuItem: {clazz: 'fa fa-long-arrow-right', text: '查看目标组件', action: 'showDestination'}},
        {separator: true},
        {id: 'align-menu-item', groupMenuItem: {clazz: 'fa', text: '对齐'}, menuItems: [
            {id: 'align-horizontal-menu-item', condition: canAlign, menuItem: { clazz: 'fa fa-align-center fa-rotate-90', text: '水平对齐', action: 'alignHorizontal'}},
            {id: 'align-vertical-menu-item', condition: canAlign, menuItem: {clazz: 'fa fa-align-center', text: '垂直对齐', action: 'alignVertical'}}
        ]},
        {id: 'to-front-menu-item', condition: canMoveToFront, menuItem: {clazz: 'fa fa-clone', text: '前端显示', action: 'toFront'}},
        {id: 'center-menu-item', condition: isNotConnection, menuItem: {clazz: 'fa fa-crosshairs', text: '在窗口内居中', action: 'center'}},
        {id: 'fill-color-menu-item', condition: isColorable, menuItem: {clazz: 'fa fa-paint-brush', text: '修改颜色', action: 'fillColor'}},
        {id: 'open-uri-menu-item', condition: isRemoteProcessGroup, menuItem: {clazz: 'fa fa-external-link', text: '查看', action: 'openUri'}},
        {separator: true},
        {id: 'move-into-parent-menu-item', condition: canMoveToParent, menuItem: {clazz: 'fa fa-arrows', text: '移到父处理组', action: 'moveIntoParent'}},
        {id: 'group-menu-item', condition: canGroup, menuItem: {clazz: 'icon icon-group', text: '组合...', action: 'group'}},
        {separator: true},
        {id: 'download-menu-item', groupMenuItem: {clazz: 'fa', text: '下载数据流程定义'}, menuItems: [
            {id: 'download-menu-item-without', condition: supportsDownloadFlow, menuItem: {clazz: 'fa', text: '不包含外部服务', action: 'downloadFlowWithoutExternalServices'}},
            {id: 'download-menu-item-with', condition: supportsDownloadFlow, menuItem: {clazz: 'fa', text: '包含外部服务', action: 'downloadFlowWithExternalServices'}}
        ]},
        {separator: true},
        {id: 'upload-template-menu-item', condition: canUploadTemplate, menuItem: {clazz: 'icon icon-template-import', text: '上传模板', action: 'uploadTemplate'}},
        {id: 'template-menu-item', condition: canCreateTemplate, menuItem: {clazz: 'icon icon-template-save', text: '创建模板', action: 'template'}},
        {separator: true},
        {id: 'copy-menu-item', condition: isCopyable, menuItem: {clazz: 'fa fa-copy', text: '拷贝', action: 'copy'}},
        {id: 'paste-menu-item', condition: isPastable, menuItem: {clazz: 'fa fa-paste', text: '粘贴', action: 'paste'}},
        {separator: true},
        {id: 'empty-queue-menu-item', condition: canEmptyQueue, menuItem: {clazz: 'fa fa-minus-circle', text: '清空队列', action: 'emptyQueue'}},
        {id: 'empty-all-queues-menu-item', condition: isProcessGroup, menuItem: {clazz: 'fa fa-minus-circle', text: '清空所有队列', action: 'emptyAllQueues'}},
        {id: 'empty-all-queues-menu-item-noselection', condition: emptySelection, menuItem: {clazz: 'fa fa-minus-circle', text: '清空所有队列', action: 'emptyAllQueues'}},
        {id: 'delete-menu-item', condition: isDeletable, menuItem: {clazz: 'fa fa-trash', text: '删除', action: 'delete'}}
    ];

    var nfContextMenu = {

        /**
         * Initialize the context menu.
         *
         * @param nfActionsRef   The nfActions module.
         */
        init: function (nfActionsRef) {
            nfActions = nfActionsRef;

            $('#context-menu').on('contextmenu', function (evt) {
                // stop propagation and prevent default
                evt.preventDefault();
                evt.stopPropagation();
            });
        },

        /**
         * Shows the context menu.
         */
        show: function () {
            // hide the menu if currently visible
            nf.ContextMenu.hide();

            var contextMenu = $('#context-menu').empty();
            var canvasBody = $('#canvas-body').get(0);
            var bannerFooter = $('#banner-footer').get(0);
            var breadCrumb = $('#breadcrumbs').get(0);

            // get the current selection
            var selection = nfCanvasUtils.getSelection();

            // get the location for the context menu
            var position = d3.mouse(canvasBody);

            // determines if the specified menu positioned at x would overflow the available width
            var overflowRight = function (x, menu) {
                return x + menu.width() > canvasBody.clientWidth;
            };

            // determines if the specified menu positioned at y would overflow the available height
            var overflowBottom = function (y, menu) {
                return y + menu.height() > (canvasBody.clientHeight - breadCrumb.clientHeight - bannerFooter.clientHeight);
            };

            // adds a menu item
            var addItem = function (menu, id, item) {
                // add the menu item
                addMenuItem(menu, {
                    id: id,
                    clazz: item.clazz,
                    imgStyle: item.imgStyle,
                    text: item.text,
                    isGroup: false
                }).on('click', function (evt) {
                    executeAction(item.action, selection, evt);
                }).on('contextmenu', function (evt) {
                    executeAction(item.action, selection, evt);

                    // stop propagation and prevent default
                    evt.preventDefault();
                    evt.stopPropagation();
                });
            };

            // adds a group item
            var addGroupItem = function (menu, groupId, groupItem, applicableGroupItems) {
                // add the menu item
                addMenuItem(menu, {
                    id: groupId,
                    clazz: groupItem.clazz,
                    imgStyle: groupItem.imgStyle,
                    text: groupItem.text,
                    isGroup: true
                }).addClass('group-menu-item').on('mouseenter', function () {
                    // see if this submenu item is already open
                    if ($('#' + groupId + '-sub-menu').length == 0) {
                        var groupMenuItem = $(this);
                        var contextMenuPosition = menu.position();
                        var groupMenuItemPosition = groupMenuItem.position();

                        var x = contextMenuPosition.left + groupMenuItemPosition.left + groupMenuItem.width();
                        var y = contextMenuPosition.top + groupMenuItemPosition.top;

                        var subMenu = $('<div class="context-menu unselectable sub-menu"></div>').attr('id', groupId + '-sub-menu').appendTo('body');

                        processMenuItems(subMenu, applicableGroupItems);

                        // make sure the sub menu is not hidden by the browser boundaries
                        if (overflowRight(x, subMenu)) {
                            x -= (subMenu.width() + groupMenuItem.width() - 4);
                        }
                        if (overflowBottom(y, subMenu)) {
                            y -= (subMenu.height() - groupMenuItem.height());
                        }

                        subMenu.css({
                            top: y + 'px',
                            left: x + 'px'
                        }).show();
                    }
                });
            };

            // whether or not a group item should be included
            var includeGroupItem = function (groupItem) {
                if (groupItem.separator) {
                    return true;
                } else if (groupItem.menuItem) {
                    return groupItem.condition(selection);
                } else {
                    var descendantItems = [];
                    $.each(groupItem.menuItems, function (_, descendantItem) {
                        if (includeGroupItem(descendantItem)) {
                            descendantItems.push(descendantItem);
                        }
                    });
                    return descendantItems.length > 0;
                }
            };

            // adds the specified items to the specified menu
            var processMenuItems = function (menu, items) {
                var allowSeparator = false;
                $.each(items, function (_, item) {
                    if (item.separator && allowSeparator) {
                        $('<div class="context-menu-item-separator"></div>').appendTo(menu);
                        allowSeparator = false;
                    } else {
                        if (processMenuItem(menu, item)) {
                            allowSeparator = true;
                        }
                    }
                });

                // ensure the last child isn't a separator
                var last = menu.children().last();
                if (last.hasClass('context-menu-item-separator')) {
                    last.remove();
                }
            };

            // adds the specified item to the specified menu if the conditions are met, returns if the item was added
            var processMenuItem = function (menu, i) {
                var included = false;

                if (i.menuItem) {
                    included = i.condition(selection);
                    if (included) {
                        addItem(menu, i.id, i.menuItem);
                    }
                } else if (i.groupMenuItem) {
                    var applicableGroupItems = [];
                    $.each(i.menuItems, function (_, groupItem) {
                        if (includeGroupItem(groupItem)) {
                            applicableGroupItems.push(groupItem);
                        }
                    });

                    // ensure the included menu items includes more than just separators
                    var includedMenuItems = $.grep(applicableGroupItems, function (gi) {
                        return nfCommon.isUndefinedOrNull(gi.separator);
                    });
                    included = includedMenuItems.length > 0;
                    if (included) {
                        addGroupItem(menu, i.id, i.groupMenuItem, applicableGroupItems);
                    }
                }

                return included;
            };

            // consider each component action for the current selection
            processMenuItems(contextMenu, menuItems);

            // make sure the context menu is not hidden by the browser boundaries
            if (overflowRight(position[0], contextMenu)) {
                position[0] = canvasBody.clientWidth - contextMenu.width() - 2;
            }
            if (overflowBottom(position[1], contextMenu)) {
                position[1] = canvasBody.clientHeight - breadCrumb.clientHeight - bannerFooter.clientHeight - contextMenu.height() - 9;
            }

            // show the context menu
            positionAndShow(contextMenu, {
                'x': position[0],
                'y': position[1]
            });

            // inform Angular app incase we've click on the canvas
            nfNgBridge.digest();
        },

        /**
         * Hides the context menu.
         */
        hide: function () {
            $('#context-menu').hide();
            $('div.context-menu.sub-menu').remove();
        },

        /**
         * Activates the context menu for the components in the specified selection.
         *
         * @param {selection} components    The components to enable the context menu for
         */
        activate: function (components) {
            components.on('contextmenu.selection', function () {
                // get the clicked component to update selection
                nfContextMenu.show();

                // stop propagation and prevent default
                d3.event.preventDefault();
                d3.event.stopPropagation();
            });
        }
    };

    return nfContextMenu;
}));
