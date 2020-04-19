# iqb-distpacker 

This is a simple cli-script to embedd linked js & css-files in the index.html. Images will relpaced by their base64-encoding

## How to use
edit your package.json and add in scripts
```
{
    ...
    "postbuild": "node node_modules/.bin/iqb-distpacker ./dist/$npm_package_name",
}
```
now, the script will run automatically by "npm run build" or in visual studio code run script 
```
or manually 
```
node node_modules/.bin/iqb-distpacker ./dist/YourPackageName
```

### Install
```
npm install iqb-distpacker
```