#!/usr/bin/env sh

budo example/src/index.js \
  --dir example/src \
  --open \
  --live \
  --host localhost \
  -- \
    -p [ \
      css-modulesify --after autoprefixer --autoprefixer.browsers "> 5%" -o example/src/assets/styles.css \
    ] \
    -t [ \
      babelify \
        --presets [ es2015 react ] \
        --plugins transform-class-properties \
      ] \
    -t brfs
