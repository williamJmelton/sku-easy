import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Sku } from './models/Sku';
import * as firebase from 'firebase';
import {firestore} from 'firebase';
// import * as firebase from '../../node_modules/firebase/firebase.js';

@Injectable()
export class WorkerService {
  $skus: Observable<any>;
  $userEmail = new ReplaySubject();
  user = this._afAuth.auth.currentUser;
  timeStamps: any;
  $auth = new ReplaySubject();

  constructor(private _db: AngularFirestore, public _afAuth: AngularFireAuth) {
    this._db.firestore.settings({ timestampsInSnapshots: true });
    this.$skus = this._db.collection('generatedNumbers', ref => ref.orderBy('number', 'desc')).valueChanges();
    this.getSkuNumbers();
    this.$userEmail.next('anon');
    this.$auth.next(false);
  }
  getSkuNumbers(): Observable<any> {
    return this.$skus.pipe(
      map(sku => {
        return sku.map(skuObj => skuObj.number);
      })
    );
  }
  getNewestDate() {
    this.$skus.pipe(
      map(sku => {
        console.log(sku.map(skuObj => skuObj.timeStamp));
      })
    );
  }
  getUserName(): Observable<any> {
    return this.$userEmail;
  }
  getSkus(): Observable<Sku> {
    return this.$skus.pipe(
      map(skus => {
        console.log(skus);
        return skus;
      })
    );
  }
  generate(lastNumber: number, person: string) {
    const nextNumber = lastNumber + 1;
    const generatedBy = 'Josh';
    const timeStamp = Date.now(); // firebase.firestore.FieldValue.serverTimestamp();
    const obj = {number: nextNumber, generatedBy: person, timeStamp: timeStamp};
    this._db.firestore.collection('generatedNumbers').doc().set(obj);
  }
  login(user: string, pass: string) {
    this._afAuth.auth.signInAndRetrieveDataWithEmailAndPassword(user, pass);
    this._afAuth.authState.subscribe(data => {
      if (data != null) {
        this.$userEmail.next(data.email);
        this.$auth.next(true);
      }
    });
  }
  logout() {
    this._afAuth.auth.signOut().then(() => this.$userEmail.next('anon'));
    this.$auth.next(false);
  }
  getAuth(): Observable<any> {
    return this.$auth;
  }
}
