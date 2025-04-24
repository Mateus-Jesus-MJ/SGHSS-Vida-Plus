import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';


import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';


import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {provideAnimations} from  '@angular/platform-browser/animations';
import {provideToastr} from 'ngx-toastr';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { environment } from '../environments/environment.development';


export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideToastr(),
    provideEnvironmentNgxMask(),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth())
  ]
};
