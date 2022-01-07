# Guide d'installation
- Clonez le dépôt  JeuDeDames dans le dossier Android qui contient le LanchCordova.bat

```
git clone mohabib38/JeuDeDames (github.com)
```
<br/>
```
cd JeuDeDames
```
Dans JeuDeDames/
```
npm install websocket
npm install mongoose
```
Ouvrez un nouveau terminal
``` 
mongod --dbpath Path_Vers_MongoDB
```
Dans JeuDeDames/ lancez le serveur
```
node ServerWS.js
```
Ouvrez un nouveau terminal ou se trouve le LanchCordova.bat :
```
 LaunchCordova.bat
 cd JeuDeDames\AppCordova
 cordova platform add browser
cordova platform add android
```
Pour lancer le jeu
```
cordova run browser
```
C'est tout! Si tout s'est bien passé, vous devriez maintenant regarder la page d’authentification du projet.
