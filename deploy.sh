#!/bin/bash

git checkout master
for subdir in hello-world linear-memory mandelbrot svm
do
    cd $subdir
    git checkout gh-pages .gitignore
    make
    cd ..
done
git add .
git stash save
git checkout gh-pages
git checkout stash -- .
git stash drop
git reset HEAD
git add .
git commit -m "Deployment `date`"
