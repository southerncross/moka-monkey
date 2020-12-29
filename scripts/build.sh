#!/bin/sh

rollup -c

cat tempermonkey dist/index.js > dist/temp.js
mv dist/temp.js dist/index.js