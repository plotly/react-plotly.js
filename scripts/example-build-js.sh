browserify example/src/index.js \
  -p [ \
    css-modulesify --after autoprefixer --autoprefixer.browsers "> 5%" -o example/dist/styles.css \
  ] \
  -t [ \
    babelify \
      --presets [ es2015 react ] \
      --plugins transform-class-properties ] \
  -t brfs \
  -g [ envify --NODE_ENV production ] \
  -g uglifyify \
  -p bundle-collapser/plugin \
  | uglifyjs --compress --mangle \
  > example/dist/index.js
