// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `index.ts`, but if you do
// `ng build --env=prod` then `index.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const AppConfig = {
  production: false,
  environment: 'DEV',
  firebase: {
    apiKey: 'AIzaSyDhyTu1PLO0fFx3dOvf7zettC-zyV2xK0I',
    authDomain: 'sku-easy.firebaseapp.com',
    databaseURL: 'https://sku-easy.firebaseio.com',
    projectId: 'sku-easy',
    storageBucket: '',
    messagingSenderId: '929709798530'
  }
};
