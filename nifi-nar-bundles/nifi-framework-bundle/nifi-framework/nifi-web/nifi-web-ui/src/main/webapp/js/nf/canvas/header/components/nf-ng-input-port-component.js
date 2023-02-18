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
                'nf.Client',
                'nf.Birdseye',
                'nf.Storage',
                'nf.Graph',
                'nf.CanvasUtils',
                'nf.ErrorHandler',
                'nf.Common'],
            function ($, nfClient, nfBirdseye, nfStorage, nfGraph, nfCanvasUtils, nfErrorHandler, nfDialog) {
                return (nf.ng.InputPortComponent = factory($, nfClient, nfBirdseye, nfStorage, nfGraph, nfCanvasUtils, nfErrorHandler));
            });
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = (nf.ng.InputPortComponent =
            factory(require('jquery'),
                require('nf.Client'),
                require('nf.Birdseye'),
                require('nf.Storage'),
                require('nf.Graph'),
                require('nf.CanvasUtils'),
                require('nf.ErrorHandler'),
                require('nf.Dialog')));
    } else {
        nf.ng.InputPortComponent = factory(root.$,
            root.nf.Client,
            root.nf.Birdseye,
            root.nf.Storage,
            root.nf.Graph,
            root.nf.CanvasUtils,
            root.nf.ErrorHandler,
            root.nf.Dialog);
    }
}(this, function ($, nfClient, nfBirdseye, nfStorage, nfGraph, nfCanvasUtils, nfErrorHandler, nfDialog) {
    'use strict';

    return function (serviceProvider) {
        'use strict';

        /**
         * Create the input port and add to the graph.
         *
         * @argument {string} portName          The input port name.
         * @argument {boolean} allowRemoteAccess Whether the input port can be accessed via S2S.
         * @argument {object} pt                The point that the input port was dropped.
         */
        var createInputPort = function (portName, allowRemoteAccess, pt) {
            var inputPortEntity = {
                'revision': nfClient.getRevision({
                    'revision': {
                        'version': 0
                    }
                }),
                'disconnectedNodeAcknowledged': nfStorage.isDisconnectionAcknowledged(),
                'component': {
                    'name': portName,
                    'allowRemoteAccess': allowRemoteAccess,
                    'position': {
                        'x': pt.x,
                        'y': pt.y
                    }
                }
            };

            // create a new processor of the defined type
            $.ajax({
                type: 'POST',
                url: serviceProvider.headerCtrl.toolboxCtrl.config.urls.api + '/process-groups/' + encodeURIComponent(nfCanvasUtils.getGroupId()) + '/input-ports',
                data: JSON.stringify(inputPortEntity),
                dataType: 'json',
                contentType: 'application/json'
            }).done(function (response) {
                // add the port to the graph
                nfGraph.add({
                    'inputPorts': [response]
                }, {
                    'selectAll': true
                });

                // hide the dialog
                inputPortComponent.modal.hide();

                // update component visibility
                nfGraph.updateVisibility();

                // update the birdseye
                nfBirdseye.refresh();
            }).fail(nfErrorHandler.handleConfigurationUpdateAjaxError);
        };

        function InputPortComponent() {

            this.icon = 'icon icon-port-in';

            this.hoverIcon = 'icon icon-port-in-add';

            /**
             * The input port component's modal.
             */
            this.modal = {

                /**
                 * Gets the modal element.
                 *
                 * @returns {*|jQuery|HTMLElement}
                 */
                getElement: function () {
                    return $('#new-port-dialog');
                },

                /**
                 * Initialize the modal.
                 */
                init: function () {
                    // configure the new port dialog
                    this.getElement().modal({
                        scrollableContentStyle: 'scrollable',
                        headerText: '添加输入端口',
                        handler: {
                            close: function () {
                                $('#new-port-name').val('');
                            }
                        }
                    });
                },

                /**
                 * Updates the modal config.
                 *
                 * @param {string} name             The name of the property to update.
                 * @param {object|array} config     The config for the `name`.
                 */
                update: function (name, config) {
                    this.getElement().modal(name, config);
                },

                /**
                 * Show the modal.
                 */
                show: function () {
                    $('#new-port-dialog > .dialog-header > .dialog-header-text').text('添加输入端口')

                    var optionLocal = {
                                text: '本地连接',
                                value: 'false',
                                description: '从父处理组内的组件中接收 FlowFile'
                            };

                    var optionRemote = {
                                text: '远程连接 (site-to-site)',
                                value: 'true',
                                description: '从远程处理组接收 FlowFile (site-to-site)'
                            };

                    // initialize the remote access combo
                    $('#port-allow-remote-access-label').text('接收至');
                    $('#port-allow-remote-access-info').attr('title', 'Specify where FlowFiles are received from.');
                    if (nfCanvasUtils.getParentGroupId() === null) {
                        $('#port-allow-remote-access-setting').hide();
                    } else {
                        $('#port-allow-remote-access-setting').show();
                    }
                    $('#port-allow-remote-access').combo({
                        options: [optionLocal, optionRemote]
                    });

                    this.getElement().modal('show');
                },

                /**
                 * Hide the modal.
                 */
                hide: function () {
                    this.getElement().modal('hide');
                }
            };
        }

        InputPortComponent.prototype = {
            constructor: InputPortComponent,

            /**
             * Gets the component.
             *
             * @returns {*|jQuery|HTMLElement}
             */
            getElement: function () {
                return $('#port-in-component');
            },

            /**
             * Enable the component.
             */
            enabled: function () {
                this.getElement().attr('disabled', false);
            },

            /**
             * Disable the component.
             */
            disabled: function () {
                this.getElement().attr('disabled', true);
            },

            /**
             * Handler function for when component is dropped on the canvas.
             *
             * @argument {object} pt        The point that the component was dropped.
             */
            dropHandler: function (pt) {
                this.promptForInputPortName(pt);
            },

            /**
             * The drag icon for the toolbox component.
             *
             * @param event
             * @returns {*|jQuery|HTMLElement}
             */
            dragIcon: function (event) {
                return $('<div class="icon icon-port-in-add"></div>');
            },

            /**
             * Prompts the user to enter the name for the input port.
             *
             * @argument {object} pt        The point that the input port was dropped.
             */
            promptForInputPortName: function (pt) {
                var inputPortComponent = this;
                var addInputPort = function () {
                    // get the name of the input port and clear the textfield
                    var portName = $('#new-port-name').val();
                    var allowRemoteAccess = $('#port-allow-remote-access').combo('getSelectedOption').value;

                    // create the input port
                    createInputPort(portName, allowRemoteAccess, pt);
                };

                this.modal.update('setButtonModel', [{
                    buttonText: '添加',
                    color: {
                        base: '#728E9B',
                        hover: '#004849',
                        text: '#ffffff'
                    },
                    handler: {
                        click: addInputPort
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
                                inputPortComponent.modal.hide();
                            }
                        }
                    }]);

                // update the port type
                $('#new-port-type').text('输入');

                // show the dialog
                this.modal.show();

                // set up the focus and key handlers
                $('#new-port-name').focus().off('keyup').on('keyup', function (e) {
                    var code = e.keyCode ? e.keyCode : e.which;
                    if (code === $.ui.keyCode.ENTER) {
                        addInputPort();
                    }
                });
            }
        }

        var inputPortComponent = new InputPortComponent();
        return inputPortComponent;
    };
}));