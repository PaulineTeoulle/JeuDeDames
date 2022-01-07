# Guide d'installation
- Clonez le dépôt  JeuDeDames dans le dossier Android qui contient le LanchCordova.bat

```bash
git clone mohabib38/JeuDeDames (github.com)
```
```bash
cd JeuDeDames
```
Dans JeuDeDames/
```bash
npm install websocket
npm install mongoose
```
Ouvrez un nouveau terminal
```bash
mongod --dbpath Path_Vers_MongoDB
```
Dans JeuDeDames/ lancez le serveur
```bash
node ServerWS.js
```
Ouvrez un nouveau terminal ou se trouve le LanchCordova.bat :
```bash
 LaunchCordova.bat
 cd JeuDeDames\AppCordova
 cordova platform add browser
cordova platform add android
```
Pour lancer le jeu
```bash
cordova run browser
```
C'est tout! Si tout s'est bien passé, vous devriez maintenant regarder la page d’authentification du projet.
