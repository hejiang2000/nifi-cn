#!/bin/sh
#
#    Licensed to the Apache Software Foundation (ASF) under one or more
#    contributor license agreements.  See the NOTICE file distributed with
#    this work for additional information regarding copyright ownership.
#    The ASF licenses this file to You under the Apache License, Version 2.0
#    (the "License"); you may not use this file except in compliance with
#    the License.  You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS,
#    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#    See the License for the specific language governing permissions and
#    limitations under the License.

REGISTRY_SCRIPT=`find nifi-registry-assembly/target/ -name nifi-registry.sh | head -1`
REGISTRY_BIN_DIR=$(dirname "${REGISTRY_SCRIPT}")
REGISTRY_DIR=$REGISTRY_BIN_DIR/..
SKIP_UI=$1

./${REGISTRY_SCRIPT} stop

if [ "$SKIP_UI" == "skipUi" ]; then
  CMND="mvn clean install -Pcontrib-check --projects \!nifi-registry-web-ui"
else
  CMND="mvn clean install -Pcontrib-check"
fi

# Don't actually start the registry if the build didn't succeed. 
${CMND} && ./${REGISTRY_SCRIPT} start && tail -n 500 -f ${REGISTRY_DIR}/logs/nifi-registry-app.log
