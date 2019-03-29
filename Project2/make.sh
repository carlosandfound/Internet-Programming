#!/bin/bash

out_file="alvar357_nodejs.zip"

cp client/js/script.js .
zip -r $out_file script.js index.js

rm script.js
