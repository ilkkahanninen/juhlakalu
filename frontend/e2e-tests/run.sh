#!/usr/bin/env bash

__PORT="9999"
__SERVER_ADDR="127.0.0.1:${__PORT}"

JK_TEST=1 SERVER_ADDR="${__SERVER_ADDR}" cargo run &
__SERVER_PID=$!
SERVER_ADDR="${__SERVER_ADDR}" yarn test -- "$@"
kill "${__SERVER_PID}"
