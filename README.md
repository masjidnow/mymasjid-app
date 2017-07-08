# MyMasjid by MasjidNow

MyMasjid is an HTML5 Mobile app built using the Ionic Framework and AngularJS. It allows mosque goers to check their masjid's prayer times and monthly information, as well as receive instant push notifications from their mosque.


# Getting Started

## Install Node and NPM

### On Mac OS with Homebrew

From your command prompt (Terminal on Mac OS), enter the following commands:

```bash
brew install node
sudo npm install -g cordova
sudo npm install -g ionic
```

## Developing

Start the server and develop the app with live reloading using:

```bash
ionic serve
```

### Environment Variables

Some sensitive information is necessary to run the app eg. a Google Cloud Messaging (GCM) sender ID or a MasjidNow API token. You can inject the required information into the app through the appConfig constant by creating a JSON object and saving it to `/app.env.json` like so:

```json
{
  "gcmSenderId": "abac123dbac",
  "apiAuthToken": "1kljfnajle"
}
```
and updating the `env_templates/appConfig.js` file only if you need to add a  new entry.

Then run the `gulp configure` task to generate the `www/app/appConfig.js` file.


### Make changes to SCSS
To have the SCSS files be compiled and changes pushed to the browser, keep the following command running alongside the server.

```
gulp watch
```
