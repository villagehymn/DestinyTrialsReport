[![bitHound Score](https://www.bithound.io/github/SteffanLong/DestinyTrialsReport/badges/score.svg)](https://www.bithound.io/github/SteffanLong/DestinyTrialsReport/master)

Using homebrew, install node + npm

* brew install node

Install modules
* make sure node version is v0.12.7
* sudo npm install

Install bower packages

* bower install

Update the definition files

* sudo node manifest.js

Run Local Proxy

* node proxy.js 63294
* uncomment `url :  "http://localhost:63294/Platform/" `in app.js (comment out the bungie one)

Run Server

* grunt serve


DEBIAN/UBUNTU

[Install Dependencies]
```
sudo apt-get install git ruby ruby-dev
```

[Update Gems & Install Compass]
```
sudo gem update
sudo gem install compass
```

[Install Node Version Manager]
```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.25.4/install.sh | bash
```

OR

```
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.25.4/install.sh | bash
```

[Install NPM & node.js]
```
source ~/.profile
nvm install 0.12.7
nvm use 0.12.7
n=$(which node);n=${n%/bin/node}; chmod -R 755 $n/bin/*; sudo cp -r $n/{bin,lib,share} /usr/local
```

[Install NPM Modules]
```
sudo npm install grunt-cli bower -g
npm install
```

[Install Bower Components]
```
bower install
```

[Run Server]
```
grunt serve
```
