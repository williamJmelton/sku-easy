import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable, ReplaySubject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { flatMap } from 'rxjs/operators';
import { Sku } from './models/Sku';
import * as firebase from 'firebase';
import { firestore } from 'firebase';
// import * as firebase from '../../node_modules/firebase/firebase.js';

@Injectable()
export class WorkerService {
  $skus: Observable<any>;
  $searchedSkus: Observable<any>;
  $userEmail = new ReplaySubject();
  $searchedNumberData = new ReplaySubject();
  dbRef = this._db.firestore.collection('generatedNumbers').doc('number');
  user = this._afAuth.auth.currentUser;
  timeStamps: any;
  $auth = new ReplaySubject();
  newNumber;

  constructor(private _db: AngularFirestore, public _afAuth: AngularFireAuth) {
    this._db.firestore.settings({ timestampsInSnapshots: true });
    this.$skus = this._db
      .collection('generatedNumbers', ref => ref.orderBy('number', 'desc'))
      .valueChanges();
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
  getSearchedSkus(sku: number): Observable<any> {
    this.$searchedSkus = this._db
      .collection('generatedNumbers', ref =>
        ref.where('number', '==', sku).limit(1)
      )
      .valueChanges()
      .pipe(
        flatMap(result => result),
        take(1)
      );
    return this.$searchedSkus;
  }
  lookUpSku(sku: number): Observable<any> {
    let number = {};
    const sub = this.getSearchedSkus(sku).subscribe(
      next => {
        // do next
        this.$searchedNumberData.next(next);
        number = next;
      },
      error => {},
      () => {
        console.log('complete');
      }
    );
    return this.$searchedNumberData.pipe(take(1));
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
    const obj = {
      number: nextNumber,
      generatedBy: person,
      timeStamp: timeStamp
    };

    this._db.firestore
      .runTransaction(transaction => {
        return transaction.get(this.dbRef).then(doc => {
          const newValue = doc.data().val + 1;
          this.newNumber = newValue;
          const oldValue = doc.data().val;
          if (doc.data().val !== newValue) {
            transaction.set(this.dbRef, { val: newValue });
            return Promise.resolve('Number increased to ' + newValue);
          } else {
            return Promise.resolve('Numbers Conflicted. Try Again.');
          }
        });
      })
      .then(result => {
        console.log('done, make a write saying who did it...');
        this._db.firestore
          .collection('generatedNumbers')
          .add({ number: this.newNumber, person: person, time: Date.now() });
      })
      .catch(err => {
        console.log('Transaction failure:', err);
      });
  }
  login(user: string, pass: string) {
    this._afAuth.auth.signInAndRetrieveDataWithEmailAndPassword(
      user + '@eabargain.com',
      pass
    );
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
