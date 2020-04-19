# iqb-distpacker 2020

install
npm install iqb-distpacker


usage
package.json add scripts
{
    ...
    "postbuild": "node node_modules/.bin/iqb-distpacker ./dist/$npm_package_name",
}