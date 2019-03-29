#!/bin/bash

files="*.php *.xml README.md *.css"
name="alvar357_express"

mkdir -p $name
cp $files $name
zip -r $name $name
rm -rf $name
